// useBlockchain hook - blockchain state and utilities

import { useState, useEffect, useCallback } from 'react';
import { getCurrentBlockHeight, getAccountTransactions, getExplorerTxUrl as getExplorerTxUrlFn } from '../services/stacks';
import { blocksToTime } from '../utils/helpers';

interface BlockchainState {
  currentBlock: number;
  lastUpdated: number;
}

interface UseBlockchainResult {
  currentBlock: number;
  isLoading: boolean;
  refresh: () => Promise<void>;
  getExplorerTxUrl: (txId: string) => string;
  getExplorerAddressUrl: (address: string) => string;
  blocksUntil: (targetBlock: number) => number;
  timeUntil: (targetBlock: number) => string;
}

let blockchainState: BlockchainState = {
  currentBlock: 0,
  lastUpdated: 0,
};

// Cache duration: 30 seconds
const CACHE_DURATION = 30000;

export function useBlockchain(): UseBlockchainResult {
  const [currentBlock, setCurrentBlock] = useState(blockchainState.currentBlock);
  const [isLoading, setIsLoading] = useState(false);

  const fetchBlockHeight = useCallback(async (force: boolean = false) => {
    const now = Date.now();
    
    // Use cached value if fresh
    if (!force && blockchainState.lastUpdated > 0 && now - blockchainState.lastUpdated < CACHE_DURATION) {
      setCurrentBlock(blockchainState.currentBlock);
      return;
    }

    setIsLoading(true);

    try {
      const height = await getCurrentBlockHeight();
      blockchainState = {
        currentBlock: height,
        lastUpdated: now,
      };
      setCurrentBlock(height);
    } catch (err) {
      console.error('Failed to fetch block height:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchBlockHeight();

    // Refresh every 30 seconds
    const interval = setInterval(() => fetchBlockHeight(true), CACHE_DURATION);
    return () => clearInterval(interval);
  }, [fetchBlockHeight]);

  const getExplorerTxUrl = useCallback((txId: string) => {
    return getExplorerTxUrlFn(txId);
  }, []);

  const getExplorerAddressUrl = useCallback((address: string) => {
    return `https://explorer.hiro.so/address/${address}?chain=mainnet`;
  }, []);

  const blocksUntil = useCallback((targetBlock: number) => {
    return Math.max(0, targetBlock - currentBlock);
  }, [currentBlock]);

  const timeUntil = useCallback((targetBlock: number) => {
    const blocks = Math.max(0, targetBlock - currentBlock);
    return blocksToTime(blocks);
  }, [currentBlock]);

  return {
    currentBlock,
    isLoading,
    refresh: () => fetchBlockHeight(true),
    getExplorerTxUrl,
    getExplorerAddressUrl,
    blocksUntil,
    timeUntil,
  };
}

interface UseTransactionHistoryResult {
  transactions: any[];
  isLoading: boolean;
  error: string | null;
  hasMore: boolean;
  loadMore: () => Promise<void>;
  refresh: () => Promise<void>;
}

export function useTransactionHistory(
  address: string | null,
  pageSize: number = 20
): UseTransactionHistoryResult {
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [offset, setOffset] = useState(0);
  const [hasMore, setHasMore] = useState(true);

  const fetchTransactions = useCallback(async (reset: boolean = false) => {
    if (!address) {
      setTransactions([]);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const currentOffset = reset ? 0 : offset;
      const result = await getAccountTransactions(address, pageSize, currentOffset);

      if (reset) {
        setTransactions(result.results || []);
        setOffset(pageSize);
      } else {
        setTransactions(prev => [...prev, ...(result.results || [])]);
        setOffset(currentOffset + pageSize);
      }

      setHasMore((result.results?.length || 0) >= pageSize);
    } catch (err) {
      console.error('Failed to fetch transactions:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch transactions');
    } finally {
      setIsLoading(false);
    }
  }, [address, offset, pageSize]);

  useEffect(() => {
    fetchTransactions(true);
  }, [address]); // Reset when address changes

  const loadMore = useCallback(async () => {
    if (!isLoading && hasMore) {
      await fetchTransactions(false);
    }
  }, [isLoading, hasMore, fetchTransactions]);

  const refresh = useCallback(async () => {
    await fetchTransactions(true);
  }, [fetchTransactions]);

  return {
    transactions,
    isLoading,
    error,
    hasMore,
    loadMore,
    refresh,
  };
}

export default useBlockchain;
