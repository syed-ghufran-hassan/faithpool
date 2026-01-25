import { useState, useCallback, useEffect } from 'react';
import { openContractCall } from '@stacks/connect';
import { standardPrincipalCV, uintCV } from '@stacks/transactions';
import { CONTRACTS, NETWORK } from '../config/contracts';

interface ReputationScore {
  address: string;
  totalScore: number;
  completedCircles: number;
  onTimePayments: number;
  latePayments: number;
  defaults: number;
  trustLevel: 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';
  lastUpdated: number;
}

interface UseReputationReturn {
  reputation: ReputationScore | null;
  isLoading: boolean;
  error: string | null;
  getReputation: (address: string) => Promise<ReputationScore | null>;
  updateReputation: (address: string, action: ReputationAction) => Promise<void>;
  getTrustLevel: (score: number) => string;
  canJoinCircle: (address: string, minTrustLevel: string) => Promise<boolean>;
}

type ReputationAction = 
  | 'on-time-payment'
  | 'late-payment'
  | 'circle-completion'
  | 'circle-default'
  | 'referral-bonus';

const TRUST_LEVELS = {
  bronze: { min: 0, max: 99 },
  silver: { min: 100, max: 299 },
  gold: { min: 300, max: 599 },
  platinum: { min: 600, max: 999 },
  diamond: { min: 1000, max: Infinity },
} as const;

export function useReputation(): UseReputationReturn {
  const [reputation, setReputation] = useState<ReputationScore | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const getTrustLevel = useCallback((score: number): string => {
    if (score >= TRUST_LEVELS.diamond.min) return 'diamond';
    if (score >= TRUST_LEVELS.platinum.min) return 'platinum';
    if (score >= TRUST_LEVELS.gold.min) return 'gold';
    if (score >= TRUST_LEVELS.silver.min) return 'silver';
    return 'bronze';
  }, []);

  const getReputation = useCallback(async (address: string): Promise<ReputationScore | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.hiro.so/v2/contracts/call-read/${CONTRACTS.reputation.address}/${CONTRACTS.reputation.name}/get-reputation`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: address,
            arguments: [standardPrincipalCV(address).hex],
          }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch reputation');
      }

      const data = await response.json();
      
      if (data.okay && data.result) {
        // Parse the Clarity response
        const totalScore = 0; // Parse from data.result
        const reputationData: ReputationScore = {
          address,
          totalScore,
          completedCircles: 0,
          onTimePayments: 0,
          latePayments: 0,
          defaults: 0,
          trustLevel: getTrustLevel(totalScore) as ReputationScore['trustLevel'],
          lastUpdated: Date.now(),
        };
        setReputation(reputationData);
        return reputationData;
      }
      
      return null;
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to get reputation';
      setError(message);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [getTrustLevel]);

  const updateReputation = useCallback(async (
    address: string,
    action: ReputationAction
  ): Promise<void> => {
    setIsLoading(true);
    setError(null);
    
    const actionMap: Record<ReputationAction, string> = {
      'on-time-payment': 'record-on-time-payment',
      'late-payment': 'record-late-payment',
      'circle-completion': 'record-circle-completion',
      'circle-default': 'record-default',
      'referral-bonus': 'add-referral-bonus',
    };

    try {
      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACTS.reputation.address,
        contractName: CONTRACTS.reputation.name,
        functionName: actionMap[action],
        functionArgs: [standardPrincipalCV(address)],
        onFinish: (data) => {
          console.log('Reputation update transaction:', data.txId);
        },
        onCancel: () => {
          setError('Transaction cancelled by user');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to update reputation');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const canJoinCircle = useCallback(async (
    address: string,
    minTrustLevel: string
  ): Promise<boolean> => {
    const rep = await getReputation(address);
    if (!rep) return false;

    const trustHierarchy = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];
    const userLevel = trustHierarchy.indexOf(rep.trustLevel);
    const requiredLevel = trustHierarchy.indexOf(minTrustLevel);
    
    return userLevel >= requiredLevel;
  }, [getReputation]);

  return {
    reputation,
    isLoading,
    error,
    getReputation,
    updateReputation,
    getTrustLevel,
    canJoinCircle,
  };
}

export default useReputation;
