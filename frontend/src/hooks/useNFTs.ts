// useNFTs hook - fetch and manage user NFTs

import { useState, useEffect, useCallback } from 'react';
import { 
  getUserNFTs, 
  getNFTMetadata, 
  getNFTListing, 
  getUserNFTBalance,
  getMarketplaceListings,
  formatNFTDisplay,
} from '../services/nft';
import type { NFTToken, NFTMetadata, NFTListing } from '../types/blockchain';

interface UseNFTsResult {
  nfts: NFTToken[];
  nftCount: number;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  getNFTDisplay: (token: NFTToken) => ReturnType<typeof formatNFTDisplay>;
}

interface UseMarketplaceResult {
  listings: NFTToken[];
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

export function useUserNFTs(userAddress: string | null): UseNFTsResult {
  const [nfts, setNfts] = useState<NFTToken[]>([]);
  const [nftCount, setNftCount] = useState(0);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchNFTs = useCallback(async () => {
    if (!userAddress) {
      setNfts([]);
      setNftCount(0);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [userNfts, balance] = await Promise.all([
        getUserNFTs(userAddress),
        getUserNFTBalance(userAddress),
      ]);

      setNfts(userNfts);
      setNftCount(balance);
    } catch (err) {
      console.error('Failed to fetch user NFTs:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch NFTs');
    } finally {
      setIsLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetchNFTs();
  }, [fetchNFTs]);

  const getNFTDisplay = useCallback((token: NFTToken) => {
    return formatNFTDisplay(token);
  }, []);

  return {
    nfts,
    nftCount,
    isLoading,
    error,
    refresh: fetchNFTs,
    getNFTDisplay,
  };
}

export function useMarketplace(limit: number = 50): UseMarketplaceResult {
  const [listings, setListings] = useState<NFTToken[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchListings = useCallback(async () => {
    setIsLoading(true);
    setError(null);

    try {
      const marketListings = await getMarketplaceListings(limit);
      setListings(marketListings);
    } catch (err) {
      console.error('Failed to fetch marketplace listings:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch listings');
    } finally {
      setIsLoading(false);
    }
  }, [limit]);

  useEffect(() => {
    fetchListings();
  }, [fetchListings]);

  return {
    listings,
    isLoading,
    error,
    refresh: fetchListings,
  };
}

export function useNFTDetails(tokenId: number | null): {
  metadata: NFTMetadata | null;
  listing: NFTListing | null;
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
} {
  const [metadata, setMetadata] = useState<NFTMetadata | null>(null);
  const [listing, setListing] = useState<NFTListing | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (tokenId === null) {
      setMetadata(null);
      setListing(null);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const [meta, list] = await Promise.all([
        getNFTMetadata(tokenId),
        getNFTListing(tokenId),
      ]);

      setMetadata(meta);
      setListing(list);
    } catch (err) {
      console.error('Failed to fetch NFT details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch NFT details');
    } finally {
      setIsLoading(false);
    }
  }, [tokenId]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  return {
    metadata,
    listing,
    isLoading,
    error,
    refresh: fetchDetails,
  };
}

export default useUserNFTs;
