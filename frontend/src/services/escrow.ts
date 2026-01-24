/**
 * Escrow Service
 * 
 * Handles escrow operations and balance queries for:
 * - Circle escrow balances
 * - User deposits
 * - Total escrow statistics
 * 
 * @module services/escrow
 */

import { CONTRACTS, NETWORK_CONFIG } from '../config/constants';
import { stacksApi, callReadOnlyFunction } from './stacks';
import type { EscrowBalance, EscrowStats } from '../types/blockchain';

// ============================================================
// Clarity Value Parsers
// ============================================================

/**
 * Parse Clarity uint response to number
 * @param response - Clarity response object
 */
function parseUint(response: unknown): number {
  if (!response) return 0;
  const resp = response as Record<string, unknown>;
  if (resp.type === 'uint' || resp.type === 1) {
    return parseInt(resp.value as string, 10);
  }
  if (typeof response === 'string' && response.startsWith('(ok u')) {
    const match = response.match(/\(ok u(\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }
  return 0;
}

/**
 * Parse Clarity optional response
 * @param response - Clarity response object
 * @param parser - Parser function for the inner value
 */
function parseOptional<T>(response: unknown, parser: (v: unknown) => T): T | null {
  if (!response) return null;
  const resp = response as Record<string, unknown>;
  if (resp.type === 'none' || resp.type === 9) return null;
  if (resp.type === 'some' || resp.type === 10) {
    return parser(resp.value);
  }
  return null;
}

// ============================================================
// Escrow Balance Queries
// ============================================================

/**
 * Get total escrow balance for a circle
 * @param circleId - Circle ID
 * @returns Balance in STX
 */
export async function getCircleEscrowBalance(circleId: number): Promise<number> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.ESCROW,
      'get-circle-balance',
      [{ type: 'uint', value: circleId.toString() }]
    );
    
    return parseUint(response) / 1_000_000;
  } catch (error) {
    console.error('Failed to get circle escrow balance:', error);
    return 0;
  }
}

/**
 * Get user's deposit amount in escrow for a circle
 * @param circleId - Circle ID
 * @param userAddress - User's Stacks address
 * @returns Deposit amount in STX
 */
export async function getUserDeposit(circleId: number, userAddress: string): Promise<number> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.ESCROW,
      'get-user-deposit',
      [
        { type: 'uint', value: circleId.toString() },
        { type: 'principal', value: userAddress }
      ]
    );
    
    return parseUint(response) / 1_000_000;
  } catch (error) {
    console.error('Failed to get user deposit:', error);
    return 0;
  }
}

// Get total escrow contract balance
export async function getTotalEscrowBalance(): Promise<number> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.ESCROW,
      'get-total-balance',
      []
    );
    
    return parseUint(response) / 1_000_000;
  } catch (error) {
    console.error('Failed to get total escrow balance:', error);
    return 0;
  }
}

// Get escrow contract STX balance from chain
export async function getEscrowContractBalance(): Promise<number> {
  try {
    const [address, name] = CONTRACTS.ESCROW.split('.');
    const response = await stacksApi(`/v2/accounts/${address}.${name}`);
    return parseInt(response.balance, 10) / 1_000_000;
  } catch (error) {
    console.error('Failed to get escrow contract balance:', error);
    return 0;
  }
}

// Check if user has deposited for current round
export async function hasUserDepositedThisRound(
  circleId: number, 
  userAddress: string
): Promise<boolean> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.CORE,
      'has-deposited-this-round',
      [
        { type: 'uint', value: circleId.toString() },
        { type: 'principal', value: userAddress }
      ]
    );
    
    if (response?.type === 'bool') {
      return response.value === true || response.value === 'true';
    }
    return false;
  } catch (error) {
    console.error('Failed to check deposit status:', error);
    return false;
  }
}

// Get escrow statistics for a circle
export async function getCircleEscrowStats(circleId: number): Promise<EscrowStats> {
  try {
    const [balance, totalDeposits] = await Promise.all([
      getCircleEscrowBalance(circleId),
      callReadOnlyFunction(
        CONTRACTS.ESCROW,
        'get-total-deposits',
        [{ type: 'uint', value: circleId.toString() }]
      ).then(parseUint).then(v => v / 1_000_000).catch(() => 0),
    ]);
    
    return {
      circleId,
      currentBalance: balance,
      totalDeposits,
      lastUpdated: Date.now(),
    };
  } catch (error) {
    console.error('Failed to get circle escrow stats:', error);
    return {
      circleId,
      currentBalance: 0,
      totalDeposits: 0,
      lastUpdated: Date.now(),
    };
  }
}

// Get all pending withdrawals for a user
export async function getPendingWithdrawals(userAddress: string): Promise<{
  circleId: number;
  amount: number;
  requestedAt: number;
}[]> {
  // This would need to scan events or maintain local state
  // For now, return empty - would need indexer support
  console.warn('getPendingWithdrawals requires indexer support');
  return [];
}

// Format escrow balance for display
export function formatEscrowBalance(balance: number): string {
  if (balance >= 1000) {
    return `${(balance / 1000).toFixed(2)}K STX`;
  }
  return `${balance.toFixed(6)} STX`;
}

// Calculate expected payout for a member
export async function calculateExpectedPayout(
  circleId: number,
  contribution: number,
  memberCount: number
): Promise<{
  grossPayout: number;
  platformFee: number;
  netPayout: number;
}> {
  const grossPayout = contribution * memberCount;
  const platformFee = grossPayout * 0.02; // 2% platform fee
  const netPayout = grossPayout - platformFee;
  
  return {
    grossPayout,
    platformFee,
    netPayout,
  };
}

// Verify escrow has sufficient funds for payout
export async function verifyPayoutFunds(
  circleId: number,
  expectedPayout: number
): Promise<{
  hasSufficientFunds: boolean;
  currentBalance: number;
  shortfall: number;
}> {
  const currentBalance = await getCircleEscrowBalance(circleId);
  const hasSufficientFunds = currentBalance >= expectedPayout;
  const shortfall = hasSufficientFunds ? 0 : expectedPayout - currentBalance;
  
  return {
    hasSufficientFunds,
    currentBalance,
    shortfall,
  };
}
