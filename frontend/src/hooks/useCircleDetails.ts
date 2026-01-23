// useCircleDetails hook - fetch and manage circle details

import { useState, useEffect, useCallback } from 'react';
import { getCircleById, getCircleMember, formatCircleForDisplay } from '../services/circles';
import { getCircleEscrowBalance, hasUserDepositedThisRound } from '../services/escrow';
import type { OnChainCircle, OnChainMember } from '../types/blockchain';

export interface CircleDetails {
  circle: OnChainCircle | null;
  member: OnChainMember | null;
  escrowBalance: number;
  hasDepositedThisRound: boolean;
  displayData: ReturnType<typeof formatCircleForDisplay> | null;
}

export interface UseCircleDetailsResult extends CircleDetails {
  isLoading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
  isMember: boolean;
  isCreator: boolean;
  canJoin: boolean;
  canDeposit: boolean;
  canClaimPayout: boolean;
  isMyTurnForPayout: boolean;
}

export function useCircleDetails(
  circleId: number | null,
  userAddress: string | null
): UseCircleDetailsResult {
  const [circle, setCircle] = useState<OnChainCircle | null>(null);
  const [member, setMember] = useState<OnChainMember | null>(null);
  const [escrowBalance, setEscrowBalance] = useState(0);
  const [hasDepositedThisRound, setHasDepositedThisRound] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const fetchDetails = useCallback(async () => {
    if (circleId === null) return;

    setIsLoading(true);
    setError(null);

    try {
      // Fetch circle data
      const circleData = await getCircleById(circleId);
      setCircle(circleData);

      // Fetch escrow balance
      const balance = await getCircleEscrowBalance(circleId);
      setEscrowBalance(balance);

      // Fetch member data if user is connected
      if (userAddress && circleData) {
        const memberData = await getCircleMember(circleId, userAddress);
        setMember(memberData);

        // Check if deposited this round
        const deposited = await hasUserDepositedThisRound(circleId, userAddress);
        setHasDepositedThisRound(deposited);
      } else {
        setMember(null);
        setHasDepositedThisRound(false);
      }
    } catch (err) {
      console.error('Failed to fetch circle details:', err);
      setError(err instanceof Error ? err.message : 'Failed to fetch circle details');
    } finally {
      setIsLoading(false);
    }
  }, [circleId, userAddress]);

  useEffect(() => {
    fetchDetails();
  }, [fetchDetails]);

  // Computed properties
  const isMember = member !== null;
  const isCreator = circle?.creator === userAddress;
  
  const canJoin = !isMember && 
    circle !== null && 
    circle.status === 0 && // Pending
    circle.currentMembers < circle.maxMembers;

  const canDeposit = isMember && 
    circle !== null && 
    (circle.status === 0 || circle.status === 1) && // Pending or Active
    !hasDepositedThisRound;

  const isMyTurnForPayout = (() => {
    if (!isMember || !circle || !member) return false;
    if (circle.status !== 1) return false; // Must be active
    // Check if current round matches member's slot
    return member.slot === circle.currentRound;
  })();

  const canClaimPayout = isMyTurnForPayout && 
    escrowBalance >= (circle?.contribution || 0) * (circle?.currentMembers || 0) / 1_000_000;

  const displayData = circle ? formatCircleForDisplay(circle) : null;

  return {
    circle,
    member,
    escrowBalance,
    hasDepositedThisRound,
    displayData,
    isLoading,
    error,
    refresh: fetchDetails,
    isMember,
    isCreator,
    canJoin,
    canDeposit,
    canClaimPayout,
    isMyTurnForPayout,
  };
}

export default useCircleDetails;
