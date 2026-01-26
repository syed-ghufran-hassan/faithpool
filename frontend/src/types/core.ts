/**
 * Core Type Definitions for StackSusu
 */

// ===== Stacks/Blockchain Types =====

export type StacksAddress = `SP${string}` | `ST${string}`;

export interface StacksPrincipal {
  address: StacksAddress;
  contractName?: string;
}

export type MicroSTX = number;
export type STX = number;

export interface Transaction {
  txId: string;
  status: 'pending' | 'success' | 'failed' | 'abandoned';
  sender: StacksAddress;
  fee: MicroSTX;
  nonce: number;
  timestamp?: Date;
}

// ===== Circle Types =====

export type CircleStatus = 'pending' | 'active' | 'completed' | 'cancelled';
export type MemberStatus = 'active' | 'defaulted' | 'completed';

export interface Circle {
  id: number;
  name: string;
  creator: StacksAddress;
  contributionAmount: MicroSTX;
  totalMembers: number;
  maxMembers: number;
  currentRound: number;
  status: CircleStatus;
  roundDurationDays: number;
  createdAt: number; // block height
  startedAt?: number;
  completedAt?: number;
}

export interface CircleMember {
  address: StacksAddress;
  position: number;
  status: MemberStatus;
  joinedAt: number;
  contributions: number[];
  payoutReceived: boolean;
  payoutAmount?: MicroSTX;
}

export interface CircleRound {
  roundNumber: number;
  status: 'pending' | 'active' | 'completed';
  recipient: StacksAddress;
  startBlock: number;
  endBlock: number;
  contributionsReceived: number;
  totalContributed: MicroSTX;
}

export interface CircleWithMembers extends Circle {
  members: CircleMember[];
}

export interface CircleWithRounds extends Circle {
  rounds: CircleRound[];
}

// ===== User Types =====

export interface User {
  address: StacksAddress;
  reputationScore: number;
  totalCirclesJoined: number;
  totalCirclesCreated: number;
  totalContributed: MicroSTX;
  totalReceived: MicroSTX;
  activeCircles: number[];
  completedCircles: number[];
  nfts: number[];
}

export interface UserStats {
  totalCircles: number;
  activeCircles: number;
  completedCircles: number;
  successRate: number; // percentage
  avgContribution: MicroSTX;
  reputationTier: ReputationTier;
}

// ===== NFT Types =====

export interface SusuNFT {
  tokenId: number;
  owner: StacksAddress;
  circleId: number;
  circleName: string;
  position: number;
  contributionAmount: MicroSTX;
  mintedAt: number;
  metadata?: NFTMetadata;
}

export interface NFTMetadata {
  name: string;
  description: string;
  image?: string;
  attributes: NFTAttribute[];
}

export interface NFTAttribute {
  trait_type: string;
  value: string | number;
}

// ===== Reputation Types =====

export type ReputationTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

export interface ReputationInfo {
  score: number;
  tier: ReputationTier;
  tierName: string;
  tierColor: string;
  nextTier?: ReputationTier;
  pointsToNextTier?: number;
}

// ===== Referral Types =====

export interface ReferralInfo {
  code: string;
  referrer: StacksAddress;
  totalReferrals: number;
  activeReferrals: number;
  rewardsEarned: MicroSTX;
}

export interface Referral {
  referee: StacksAddress;
  referredAt: number;
  circleJoined?: number;
  rewardPaid: boolean;
}

// ===== Governance Types =====

export interface Proposal {
  id: number;
  proposer: StacksAddress;
  title: string;
  description: string;
  status: 'pending' | 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  startBlock: number;
  endBlock: number;
  executedAt?: number;
}

export interface Vote {
  proposalId: number;
  voter: StacksAddress;
  support: boolean;
  weight: number;
  timestamp: number;
}

// ===== API Response Types =====

export interface ApiResponse<T> {
  success: boolean;
  data?: T;
  error?: {
    code: string;
    message: string;
  };
}

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  pageSize: number;
  hasMore: boolean;
}

// ===== Event Types =====

export interface CircleEvent {
  type: 'created' | 'joined' | 'started' | 'contributed' | 'payout' | 'completed';
  circleId: number;
  actor: StacksAddress;
  data: Record<string, unknown>;
  blockHeight: number;
  txId: string;
}

// ===== Form Types =====

export interface CreateCircleForm {
  name: string;
  contributionAmount: STX;
  maxMembers: number;
  roundDurationDays: number;
}

export interface JoinCircleForm {
  circleId: number;
  referralCode?: string;
}
