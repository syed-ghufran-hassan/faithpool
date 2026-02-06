/**
 * StacksUSU Contract Integration Layer
 * Centralized contract interaction utilities
 * @module contract-integration
 */

import {
  makeContractCall,
  broadcastTransaction,
  AnchorMode,
  PostConditionMode,
  Pc,
  Cl,
  type ClarityValue,
  cvToJSON,
  callReadOnlyFunction,
} from '@stacks/transactions';
import { StacksMainnet, StacksTestnet, type StacksNetwork } from '@stacks/network';

// ============================================================================
// Types
// ============================================================================

export interface CircleParams {
  name: string;
  contributionAmount: bigint;
  duration: number; // in blocks
  maxMembers: number;
}

export interface JoinCircleParams {
  circleId: number;
}

export interface ContributeParams {
  circleId: number;
  amount: bigint;
}

export interface WithdrawParams {
  circleId: number;
}

export interface CircleData {
  id: number;
  name: string;
  creator: string;
  contributionAmount: bigint;
  totalMembers: number;
  maxMembers: number;
  currentRound: number;
  totalRounds: number;
  startBlock: number;
  endBlock: number;
  status: 'active' | 'completed' | 'cancelled';
}

// ============================================================================
// Configuration
// ============================================================================

const CONTRACT_CONFIG = {
  mainnet: {
    address: 'SP...',
    coreContract: 'stacksusu-core-v7',
    adminContract: 'stacksusu-admin-v7',
    escrowContract: 'stacksusu-escrow-v7',
    governanceContract: 'stacksusu-governance-v7',
    reputationContract: 'stacksusu-reputation-v7',
  },
  testnet: {
    address: 'ST...',
    coreContract: 'stacksusu-core-v7',
    adminContract: 'stacksusu-admin-v7',
    escrowContract: 'stacksusu-escrow-v7',
    governanceContract: 'stacksusu-governance-v7',
    reputationContract: 'stacksusu-reputation-v7',
  },
} as const;

export function getContractConfig(network: 'mainnet' | 'testnet' = 'testnet') {
  return CONTRACT_CONFIG[network];
}

export function getNetwork(networkKey: 'mainnet' | 'testnet' = 'testnet'): StacksNetwork {
  return networkKey === 'mainnet' ? new StacksMainnet() : new StacksTestnet();
}

// ============================================================================
// Circle Management
// ============================================================================

/**
 * Create a new savings circle
 */
export function buildCreateCircleOptions(params: CircleParams, userAddress: string) {
  const config = getContractConfig();
  
  return {
    contractAddress: config.address,
    contractName: config.coreContract,
    functionName: 'create-circle',
    functionArgs: [
      Cl.stringAscii(params.name),
      Cl.uint(params.contributionAmount),
      Cl.uint(params.duration),
      Cl.uint(params.maxMembers),
    ],
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
  };
}

/**
 * Join an existing circle
 */
export function buildJoinCircleOptions(params: JoinCircleParams, userAddress: string) {
  const config = getContractConfig();
  
  return {
    contractAddress: config.address,
    contractName: config.coreContract,
    functionName: 'join-circle',
    functionArgs: [Cl.uint(params.circleId)],
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
  };
}

/**
 * Make a contribution to circle
 */
export function buildContributeOptions(
  params: ContributeParams,
  userAddress: string
) {
  const config = getContractConfig();
  
  // Post conditions ensure exact STX transfer
  const postConditions = [
    Pc.principal(userAddress)
      .willSendEq(params.amount)
      .ustx(),
  ];
  
  return {
    contractAddress: config.address,
    contractName: config.escrowContract,
    functionName: 'contribute',
    functionArgs: [
      Cl.uint(params.circleId),
      Cl.uint(params.amount),
    ],
    postConditions,
    postConditionMode: PostConditionMode.Deny,
    anchorMode: AnchorMode.Any,
  };
}

/**
 * Withdraw payout from circle
 */
export function buildWithdrawOptions(params: WithdrawParams, userAddress: string) {
  const config = getContractConfig();
  
  return {
    contractAddress: config.address,
    contractName: config.escrowContract,
    functionName: 'withdraw-payout',
    functionArgs: [Cl.uint(params.circleId)],
    postConditionMode: PostConditionMode.Allow, // Allow withdrawal
    anchorMode: AnchorMode.Any,
  };
}

/**
 * Cancel circle (admin only)
 */
export function buildCancelCircleOptions(circleId: number, adminAddress: string) {
  const config = getContractConfig();
  
  return {
    contractAddress: config.address,
    contractName: config.adminContract,
    functionName: 'cancel-circle',
    functionArgs: [Cl.uint(circleId)],
    postConditionMode: PostConditionMode.Allow,
    anchorMode: AnchorMode.Any,
  };
}

// ============================================================================
// Read-Only Functions
// ============================================================================

/**
 * Get circle information
 */
export async function getCircleInfo(
  circleId: number,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<CircleData | null> {
  const config = getContractConfig(network);
  const stacksNetwork = getNetwork(network);
  
  try {
    const result = await callReadOnlyFunction({
      contractAddress: config.address,
      contractName: config.coreContract,
      functionName: 'get-circle',
      functionArgs: [Cl.uint(circleId)],
      senderAddress: config.address,
      network: stacksNetwork,
    });
    
    const json = cvToJSON(result);
    if (!json.value) return null;
    
    const data = json.value.value;
    
    return {
      id: circleId,
      name: data.name?.value || '',
      creator: data.creator?.value || '',
      contributionAmount: BigInt(data['contribution-amount']?.value || 0),
      totalMembers: Number(data['total-members']?.value || 0),
      maxMembers: Number(data['max-members']?.value || 0),
      currentRound: Number(data['current-round']?.value || 0),
      totalRounds: Number(data['total-rounds']?.value || 0),
      startBlock: Number(data['start-block']?.value || 0),
      endBlock: Number(data['end-block']?.value || 0),
      status: parseCircleStatus(data.status?.value),
    };
  } catch (error) {
    console.error('Error fetching circle info:', error);
    return null;
  }
}

/**
 * Get user's circles
 */
export async function getUserCircles(
  userAddress: string,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<number[]> {
  const config = getContractConfig(network);
  const stacksNetwork = getNetwork(network);
  
  try {
    const result = await callReadOnlyFunction({
      contractAddress: config.address,
      contractName: config.coreContract,
      functionName: 'get-user-circles',
      functionArgs: [Cl.principal(userAddress)],
      senderAddress: config.address,
      network: stacksNetwork,
    });
    
    const json = cvToJSON(result);
    if (!json.value) return [];
    
    return json.value.map((item: any) => Number(item.value));
  } catch (error) {
    console.error('Error fetching user circles:', error);
    return [];
  }
}

/**
 * Get user's reputation score
 */
export async function getUserReputation(
  userAddress: string,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<number> {
  const config = getContractConfig(network);
  const stacksNetwork = getNetwork(network);
  
  try {
    const result = await callReadOnlyFunction({
      contractAddress: config.address,
      contractName: config.reputationContract,
      functionName: 'get-reputation',
      functionArgs: [Cl.principal(userAddress)],
      senderAddress: config.address,
      network: stacksNetwork,
    });
    
    const json = cvToJSON(result);
    return Number(json.value?.value || 0);
  } catch (error) {
    console.error('Error fetching reputation:', error);
    return 0;
  }
}

/**
 * Check if user can withdraw from circle
 */
export async function canUserWithdraw(
  circleId: number,
  userAddress: string,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<boolean> {
  const config = getContractConfig(network);
  const stacksNetwork = getNetwork(network);
  
  try {
    const result = await callReadOnlyFunction({
      contractAddress: config.address,
      contractName: config.escrowContract,
      functionName: 'can-withdraw',
      functionArgs: [
        Cl.uint(circleId),
        Cl.principal(userAddress),
      ],
      senderAddress: config.address,
      network: stacksNetwork,
    });
    
    const json = cvToJSON(result);
    return json.value === true || json.value?.value === 'true';
  } catch (error) {
    console.error('Error checking withdrawal eligibility:', error);
    return false;
  }
}

/**
 * Get circle's total balance
 */
export async function getCircleBalance(
  circleId: number,
  network: 'mainnet' | 'testnet' = 'testnet'
): Promise<bigint> {
  const config = getContractConfig(network);
  const stacksNetwork = getNetwork(network);
  
  try {
    const result = await callReadOnlyFunction({
      contractAddress: config.address,
      contractName: config.escrowContract,
      functionName: 'get-circle-balance',
      functionArgs: [Cl.uint(circleId)],
      senderAddress: config.address,
      network: stacksNetwork,
    });
    
    const json = cvToJSON(result);
    return BigInt(json.value?.value || 0);
  } catch (error) {
    console.error('Error fetching circle balance:', error);
    return BigInt(0);
  }
}

// ============================================================================
// Helper Functions
// ============================================================================

function parseCircleStatus(status: any): 'active' | 'completed' | 'cancelled' {
  if (typeof status === 'string') {
    if (status.includes('active')) return 'active';
    if (status.includes('completed')) return 'completed';
    if (status.includes('cancelled')) return 'cancelled';
  }
  return 'active';
}

/**
 * Convert microSTX to STX
 */
export function microStxToStx(microStx: bigint): number {
  return Number(microStx) / 1_000_000;
}

/**
 * Convert STX to microSTX
 */
export function stxToMicroStx(stx: number): bigint {
  return BigInt(Math.floor(stx * 1_000_000));
}

/**
 * Format STX amount for display
 */
export function formatStx(microStx: bigint): string {
  const stx = microStxToStx(microStx);
  return `${stx.toLocaleString()} STX`;
}

/**
 * Calculate total circle payout
 */
export function calculateTotalPayout(
  contributionAmount: bigint,
  totalMembers: number
): bigint {
  return contributionAmount * BigInt(totalMembers);
}

/**
 * Calculate blocks remaining
 */
export function calculateBlocksRemaining(
  currentBlock: number,
  endBlock: number
): number {
  return Math.max(0, endBlock - currentBlock);
}

/**
 * Estimate time remaining (assuming 10 min blocks)
 */
export function estimateTimeRemaining(blocksRemaining: number): string {
  const minutes = blocksRemaining * 10;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  
  if (days > 0) return `${days} day${days > 1 ? 's' : ''}`;
  if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''}`;
  return `${minutes} minute${minutes > 1 ? 's' : ''}`;
}
