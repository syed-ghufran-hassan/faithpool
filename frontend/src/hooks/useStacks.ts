import { useState, useEffect, useCallback } from 'react';
import { getAccountBalance, getAccountTransactions } from '../services/api';

interface UseBalanceReturn {
  balance: number;
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useBalance(address: string | null): UseBalanceReturn {
  const [balance, setBalance] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchBalance = useCallback(async () => {
    if (!address) {
      setBalance(0);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const stxBalance = await getAccountBalance(address);
      setBalance(stxBalance);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch balance';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [address]);

  useEffect(() => {
    fetchBalance();
  }, [fetchBalance]);

  return {
    balance,
    loading,
    error,
    refetch: fetchBalance,
  };
}

interface Transaction {
  tx_id: string;
  tx_type: string;
  tx_status: string;
  sender_address: string;
  fee_rate: string;
  block_height: number;
  burn_block_time: number;
}

interface UseTransactionsReturn {
  transactions: Transaction[];
  loading: boolean;
  error: string | null;
  refetch: () => Promise<void>;
}

export function useTransactions(address: string | null, limit = 20): UseTransactionsReturn {
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchTransactions = useCallback(async () => {
    if (!address) {
      setTransactions([]);
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const data = await getAccountTransactions(address, limit);
      setTransactions(data.results || []);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch transactions';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [address, limit]);

  useEffect(() => {
    fetchTransactions();
  }, [fetchTransactions]);

  return {
    transactions,
    loading,
    error,
    refetch: fetchTransactions,
  };
}

export default { useBalance, useTransactions };
