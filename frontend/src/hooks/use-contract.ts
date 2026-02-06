/**
 * Custom React Hooks for Contract Interactions
 * @module use-contract
 */

import { useState, useEffect, useCallback } from 'react';
import {
  getCircleInfo,
  getUserCircles,
  getUserReputation,
  getCircleBalance,
  canUserWithdraw,
  type CircleData,
} from '../lib/contract-integration';

/**
 * Hook to fetch circle information
 */
export function useCircle(circleId: number | null) {
  const [circle, setCircle] = useState<CircleData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!circleId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const data = await getCircleInfo(circleId);
      setCircle(data);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch circle'));
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { circle, loading, error, refetch: fetch };
}

/**
 * Hook to fetch user's circles
 */
export function useUserCircles(userAddress: string | null) {
  const [circleIds, setCircleIds] = useState<number[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetch = useCallback(async () => {
    if (!userAddress) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const ids = await getUserCircles(userAddress);
      setCircleIds(ids);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Failed to fetch circles'));
    } finally {
      setLoading(false);
    }
  }, [userAddress]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { circleIds, loading, error, refetch: fetch };
}

/**
 * Hook to fetch user reputation
 */
export function useReputation(userAddress: string | null) {
  const [reputation, setReputation] = useState(0);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!userAddress) return;
    
    setLoading(true);
    getUserReputation(userAddress)
      .then(setReputation)
      .finally(() => setLoading(false));
  }, [userAddress]);

  return { reputation, loading };
}

/**
 * Hook to check withdrawal eligibility
 */
export function useWithdrawEligibility(circleId: number | null, userAddress: string | null) {
  const [canWithdraw, setCanWithdraw] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!circleId || !userAddress) return;
    
    setLoading(true);
    canUserWithdraw(circleId, userAddress)
      .then(setCanWithdraw)
      .finally(() => setLoading(false));
  }, [circleId, userAddress]);

  return { canWithdraw, loading };
}

/**
 * Hook to fetch circle balance
 */
export function useCircleBalance(circleId: number | null) {
  const [balance, setBalance] = useState<bigint>(BigInt(0));
  const [loading, setLoading] = useState(false);

  const fetch = useCallback(async () => {
    if (!circleId) return;
    
    setLoading(true);
    try {
      const bal = await getCircleBalance(circleId);
      setBalance(bal);
    } finally {
      setLoading(false);
    }
  }, [circleId]);

  useEffect(() => {
    fetch();
  }, [fetch]);

  return { balance, loading, refetch: fetch };
}
