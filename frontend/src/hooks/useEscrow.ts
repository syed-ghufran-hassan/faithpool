import { useState, useCallback } from 'react';
import { openContractCall } from '@stacks/connect';
import { contractPrincipalCV, uintCV, bufferCV } from '@stacks/transactions';
import { CONTRACTS, NETWORK } from '../config/contracts';

interface EscrowState {
  circleId: number;
  memberId: number;
  amount: number;
  releaseBlock: number;
  status: 'locked' | 'released' | 'disputed' | 'refunded';
}

interface UseEscrowReturn {
  escrowState: EscrowState | null;
  isLoading: boolean;
  error: string | null;
  lockFunds: (circleId: number, memberId: number, amount: number) => Promise<void>;
  releaseFunds: (circleId: number, memberId: number) => Promise<void>;
  disputeEscrow: (circleId: number, memberId: number, reason: string) => Promise<void>;
  resolveDispute: (circleId: number, memberId: number, releaseToMember: boolean) => Promise<void>;
  getEscrowInfo: (circleId: number, memberId: number) => Promise<EscrowState | null>;
}

export function useEscrow(): UseEscrowReturn {
  const [escrowState, setEscrowState] = useState<EscrowState | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const lockFunds = useCallback(async (circleId: number, memberId: number, amount: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACTS.escrow.address,
        contractName: CONTRACTS.escrow.name,
        functionName: 'lock-contribution',
        functionArgs: [uintCV(circleId), uintCV(memberId), uintCV(amount)],
        onFinish: (data) => {
          console.log('Lock funds transaction:', data.txId);
          setEscrowState({
            circleId,
            memberId,
            amount,
            releaseBlock: 0,
            status: 'locked',
          });
        },
        onCancel: () => {
          setError('Transaction cancelled by user');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to lock funds');
    } finally {
      setIsLoading(false);
    }
  }, []);

  const releaseFunds = useCallback(async (circleId: number, memberId: number) => {
    setIsLoading(true);
    setError(null);
    try {
      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACTS.escrow.address,
        contractName: CONTRACTS.escrow.name,
        functionName: 'release-payout',
        functionArgs: [uintCV(circleId), uintCV(memberId)],
        onFinish: (data) => {
          console.log('Release funds transaction:', data.txId);
          if (escrowState) {
            setEscrowState({ ...escrowState, status: 'released' });
          }
        },
        onCancel: () => {
          setError('Transaction cancelled by user');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to release funds');
    } finally {
      setIsLoading(false);
    }
  }, [escrowState]);

  const disputeEscrow = useCallback(async (circleId: number, memberId: number, reason: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const reasonBuffer = bufferCV(new TextEncoder().encode(reason));
      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACTS.escrow.address,
        contractName: CONTRACTS.escrow.name,
        functionName: 'initiate-dispute',
        functionArgs: [uintCV(circleId), uintCV(memberId), reasonBuffer],
        onFinish: (data) => {
          console.log('Dispute transaction:', data.txId);
          if (escrowState) {
            setEscrowState({ ...escrowState, status: 'disputed' });
          }
        },
        onCancel: () => {
          setError('Transaction cancelled by user');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to dispute escrow');
    } finally {
      setIsLoading(false);
    }
  }, [escrowState]);

  const resolveDispute = useCallback(async (
    circleId: number,
    memberId: number,
    releaseToMember: boolean
  ) => {
    setIsLoading(true);
    setError(null);
    try {
      await openContractCall({
        network: NETWORK,
        contractAddress: CONTRACTS.escrow.address,
        contractName: CONTRACTS.escrow.name,
        functionName: 'resolve-dispute',
        functionArgs: [
          uintCV(circleId),
          uintCV(memberId),
          releaseToMember ? uintCV(1) : uintCV(0),
        ],
        onFinish: (data) => {
          console.log('Resolve dispute transaction:', data.txId);
          if (escrowState) {
            setEscrowState({
              ...escrowState,
              status: releaseToMember ? 'released' : 'refunded',
            });
          }
        },
        onCancel: () => {
          setError('Transaction cancelled by user');
        },
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to resolve dispute');
    } finally {
      setIsLoading(false);
    }
  }, [escrowState]);

  const getEscrowInfo = useCallback(async (
    circleId: number,
    memberId: number
  ): Promise<EscrowState | null> => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch(
        `https://api.hiro.so/v2/contracts/call-read/${CONTRACTS.escrow.address}/${CONTRACTS.escrow.name}/get-escrow-info`,
        {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            sender: CONTRACTS.escrow.address,
            arguments: [
              uintCV(circleId).hex,
              uintCV(memberId).hex,
            ],
          }),
        }
      );
      
      if (!response.ok) {
        throw new Error('Failed to fetch escrow info');
      }
      
      const data = await response.json();
      // Parse and return escrow state from response
      return data.result ? {
        circleId,
        memberId,
        amount: 0,
        releaseBlock: 0,
        status: 'locked',
      } : null;
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to get escrow info');
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    escrowState,
    isLoading,
    error,
    lockFunds,
    releaseFunds,
    disputeEscrow,
    resolveDispute,
    getEscrowInfo,
  };
}

export default useEscrow;
