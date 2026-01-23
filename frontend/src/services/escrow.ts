// Escrow Service - Handles escrow operations and balance queries

import { CONTRACTS, NETWORK_CONFIG } from '../config/constants';
import { stacksApi, callReadOnlyFunction } from './stacks';
import type { EscrowBalance, EscrowStats } from '../types/blockchain';

// Parse Clarity uint response
function parseUint(response: any): number {
  if (!response) return 0;
  if (response.type === 'uint' || response.type === 1) {
    return parseInt(response.value, 10);
  }
  if (typeof response === 'string' && response.startsWith('(ok u')) {
    const match = response.match(/\(ok u(\d+)\)/);
    return match ? parseInt(match[1], 10) : 0;
  }
  return 0;
}

// Parse Clarity optional response
function parseOptional<T>(response: any, parser: (v: any) => T): T | null {
  if (!response) return null;
  if (response.type === 'none' || response.type === 9) return null;
  if (response.type === 'some' || response.type === 10) {
    return parser(response.value);
  }
  return null;
}

// Get circle escrow balance
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

// Get user deposit in escrow for a circle
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
