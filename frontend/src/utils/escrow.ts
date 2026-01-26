/**
 * Escrow system utility functions for StackSUSU
 */

import { BLOCK_TIMES, ESCROW_CONFIG } from '../constants/contracts';

export type EscrowStatus = 'pending' | 'locked' | 'released' | 'disputed' | 'refunded' | 'expired';

export interface EscrowDeposit {
  id: number;
  depositor: string;
  recipient: string;
  amount: number;
  createdAt: number;
  lockUntil: number;
  releaseCondition: string;
  status: EscrowStatus;
  circleId?: number;
  roundNumber?: number;
}

export interface EscrowDispute {
  escrowId: number;
  initiator: string;
  reason: string;
  createdAt: number;
  resolution?: 'depositor' | 'recipient' | 'split';
  resolvedAt?: number;
  resolvedBy?: string;
}

export interface EscrowStats {
  totalDeposits: number;
  activeEscrows: number;
  totalValueLocked: number;
  successfulReleases: number;
  disputeRate: number;
}

/**
 * Calculate escrow lock duration in blocks
 */
export function calculateLockBlocks(daysToLock: number): number {
  return daysToLock * BLOCK_TIMES.BLOCKS_PER_DAY;
}

/**
 * Get escrow status based on current block height
 */
export function getEscrowStatus(
  deposit: EscrowDeposit,
  currentBlockHeight: number
): EscrowStatus {
  if (deposit.status === 'released' || deposit.status === 'refunded') {
    return deposit.status;
  }
  
  if (deposit.status === 'disputed') {
    return 'disputed';
  }
  
  if (currentBlockHeight < deposit.createdAt) {
    return 'pending';
  }
  
  if (currentBlockHeight >= deposit.lockUntil) {
    return 'expired';
  }
  
  return 'locked';
}

/**
 * Calculate time remaining until escrow unlock
 */
export function getTimeUntilUnlock(
  lockUntil: number,
  currentBlock: number
): {
  blocks: number;
  seconds: number;
  formatted: string;
} {
  const blocksRemaining = Math.max(0, lockUntil - currentBlock);
  const secondsRemaining = blocksRemaining * BLOCK_TIMES.AVG_BLOCK_TIME_SECONDS;
  
  const days = Math.floor(secondsRemaining / 86400);
  const hours = Math.floor((secondsRemaining % 86400) / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  
  let formatted = '';
  if (days > 0) formatted = `${days}d ${hours}h`;
  else if (hours > 0) formatted = `${hours}h ${minutes}m`;
  else formatted = `${minutes}m`;
  
  return {
    blocks: blocksRemaining,
    seconds: secondsRemaining,
    formatted: blocksRemaining <= 0 ? 'Unlocked' : formatted,
  };
}

/**
 * Calculate escrow fee
 */
export function calculateEscrowFee(amount: number): number {
  return Math.floor(amount * ESCROW_CONFIG.FEE_PERCENTAGE);
}

/**
 * Calculate net amount after escrow fee
 */
export function getNetAmount(amount: number): number {
  const fee = calculateEscrowFee(amount);
  return amount - fee;
}

/**
 * Check if escrow can be released
 */
export function canReleaseEscrow(
  deposit: EscrowDeposit,
  currentBlock: number,
  userAddress: string
): { canRelease: boolean; reason?: string } {
  if (deposit.status !== 'locked') {
    return { canRelease: false, reason: `Escrow status is ${deposit.status}` };
  }
  
  if (deposit.depositor !== userAddress) {
    return { canRelease: false, reason: 'Only depositor can release' };
  }
  
  if (currentBlock < deposit.lockUntil && !deposit.releaseCondition) {
    return { canRelease: false, reason: 'Lock period not ended' };
  }
  
  return { canRelease: true };
}

/**
 * Check if escrow can be disputed
 */
export function canDisputeEscrow(
  deposit: EscrowDeposit,
  userAddress: string
): { canDispute: boolean; reason?: string } {
  if (deposit.status !== 'locked') {
    return { canDispute: false, reason: 'Can only dispute locked escrows' };
  }
  
  if (deposit.depositor !== userAddress && deposit.recipient !== userAddress) {
    return { canDispute: false, reason: 'Only parties can dispute' };
  }
  
  return { canDispute: true };
}

/**
 * Get escrow status color
 */
export function getEscrowStatusColor(status: EscrowStatus): string {
  const colors: Record<EscrowStatus, string> = {
    pending: '#fbbf24',
    locked: '#3b82f6',
    released: '#22c55e',
    disputed: '#ef4444',
    refunded: '#8b5cf6',
    expired: '#6b7280',
  };
  return colors[status];
}

/**
 * Get escrow status label
 */
export function getEscrowStatusLabel(status: EscrowStatus): string {
  const labels: Record<EscrowStatus, string> = {
    pending: 'Pending',
    locked: 'Locked',
    released: 'Released',
    disputed: 'In Dispute',
    refunded: 'Refunded',
    expired: 'Expired',
  };
  return labels[status];
}

/**
 * Sort escrow deposits by various criteria
 */
export function sortEscrowDeposits(
  deposits: EscrowDeposit[],
  sortBy: 'created' | 'amount' | 'unlock' = 'created',
  direction: 'asc' | 'desc' = 'desc'
): EscrowDeposit[] {
  const sorted = [...deposits].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'created':
        comparison = a.createdAt - b.createdAt;
        break;
      case 'amount':
        comparison = a.amount - b.amount;
        break;
      case 'unlock':
        comparison = a.lockUntil - b.lockUntil;
        break;
    }
    return direction === 'asc' ? comparison : -comparison;
  });
  return sorted;
}

/**
 * Filter escrow deposits by status
 */
export function filterEscrowsByStatus(
  deposits: EscrowDeposit[],
  status: EscrowStatus | 'all',
  currentBlock: number
): EscrowDeposit[] {
  if (status === 'all') return deposits;
  return deposits.filter(d => getEscrowStatus(d, currentBlock) === status);
}

/**
 * Calculate total value locked across escrows
 */
export function getTotalValueLocked(deposits: EscrowDeposit[], currentBlock: number): number {
  return deposits
    .filter(d => getEscrowStatus(d, currentBlock) === 'locked')
    .reduce((sum, d) => sum + d.amount, 0);
}

/**
 * Get user's escrow statistics
 */
export function getUserEscrowStats(
  deposits: EscrowDeposit[],
  userAddress: string,
  currentBlock: number
): EscrowStats {
  const userDeposits = deposits.filter(
    d => d.depositor === userAddress || d.recipient === userAddress
  );
  
  const activeEscrows = userDeposits.filter(
    d => getEscrowStatus(d, currentBlock) === 'locked'
  );
  
  const successfulReleases = userDeposits.filter(
    d => d.status === 'released'
  );
  
  const disputes = userDeposits.filter(d => d.status === 'disputed');
  
  return {
    totalDeposits: userDeposits.length,
    activeEscrows: activeEscrows.length,
    totalValueLocked: activeEscrows.reduce((sum, d) => sum + d.amount, 0),
    successfulReleases: successfulReleases.length,
    disputeRate: userDeposits.length > 0 
      ? (disputes.length / userDeposits.length) * 100 
      : 0,
  };
}

/**
 * Validate escrow amount
 */
export function validateEscrowAmount(amount: number): {
  isValid: boolean;
  error?: string;
} {
  if (amount <= 0) {
    return { isValid: false, error: 'Amount must be greater than 0' };
  }
  
  if (amount < ESCROW_CONFIG.MIN_DEPOSIT) {
    return { isValid: false, error: `Minimum deposit is ${ESCROW_CONFIG.MIN_DEPOSIT / 1_000_000} STX` };
  }
  
  if (amount > ESCROW_CONFIG.MAX_DEPOSIT) {
    return { isValid: false, error: `Maximum deposit is ${ESCROW_CONFIG.MAX_DEPOSIT / 1_000_000} STX` };
  }
  
  return { isValid: true };
}
