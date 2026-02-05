/**
 * Mock Data Generators
 * 
 * Comprehensive mock data generators for testing the StackSUSU application.
 * Provides realistic test data for all data types in the system.
 * 
 * @module utils/mock-data
 * 
 * @example
 * ```typescript
 * import { generateCircles, generateUsers } from '@/utils/mock-data';
 * 
 * const circles = generateCircles(10);
 * const users = generateUsers(5);
 * ```
 */

import { mockStacksAddress, mockCircle, mockUser, mockTransaction, mockContribution } from './test-utils';

// ============================================================================
// Circle Data Generators
// ============================================================================

/** Generate multiple circles */
export function generateCircles(count: number, overrides?: Partial<Circle>): Circle[] {
  return Array.from({ length: count }, (_, i) => 
    mockCircle({
      id: i + 1,
      name: `Savings Circle ${i + 1}`,
      ...overrides,
    })
  );
}

/** Generate circles with varied statuses */
export function generateCirclesMixed(count: number): Circle[] {
  const statuses = ['active', 'forming', 'completed', 'cancelled'];
  const modes = ['upfront', 'round-by-round'];
  const frequencies = ['daily', 'weekly', 'biweekly', 'monthly'];
  
  return Array.from({ length: count }, (_, i) => 
    mockCircle({
      id: i + 1,
      name: `${frequencies[i % frequencies.length].charAt(0).toUpperCase() + 
        frequencies[i % frequencies.length].slice(1)} Savings ${i + 1}`,
      status: statuses[i % statuses.length],
      mode: modes[i % modes.length],
      frequency: frequencies[i % frequencies.length],
      memberCount: Math.floor(Math.random() * 8) + 2,
      maxMembers: Math.floor(Math.random() * 5) + 5,
      currentRound: Math.floor(Math.random() * 5) + 1,
      totalRounds: 5 + Math.floor(Math.random() * 10),
      contributionAmount: [100000, 500000, 1000000, 2000000, 5000000][i % 5],
    })
  );
}

/** Generate a complete circle with members and contributions */
export function generateFullCircle(overrides?: Partial<Circle>): FullCircle {
  const circle = mockCircle(overrides);
  const members = generateUsers(circle.memberCount).map((user, i) => ({
    ...user,
    joinedAt: circle.createdAt + i * 86400000,
    hasContributed: i < circle.currentRound - 1,
    payoutReceived: i < circle.currentRound - 1,
    payoutOrder: i + 1,
  }));
  
  const contributions: Contribution[] = [];
  for (let round = 1; round <= circle.currentRound; round++) {
    members.forEach((member, i) => {
      if (round <= circle.currentRound && (round < circle.currentRound || i < circle.memberCount)) {
        contributions.push(mockContribution({
          id: contributions.length + 1,
          circleId: circle.id,
          member: member.address,
          round,
          amount: circle.contributionAmount,
          timestamp: circle.createdAt + round * circle.payoutInterval * 1000 + i * 3600000,
        }));
      }
    });
  }
  
  return {
    ...circle,
    members,
    contributions,
    totalContributed: contributions.reduce((sum, c) => sum + c.amount, 0),
    nextPayoutDate: circle.createdAt + (circle.currentRound + 1) * circle.payoutInterval * 1000,
  };
}

// ============================================================================
// User Data Generators
// ============================================================================

/** Generate multiple users */
export function generateUsers(count: number, overrides?: Partial<User>): User[] {
  return Array.from({ length: count }, (_, i) => 
    mockUser({
      nickname: `User${i + 1}`,
      ...overrides,
    })
  );
}

/** Generate users with varying reputation scores */
export function generateUsersWithReputation(count: number): User[] {
  const reputationLevels = [
    { score: 1000, circlesCompleted: 20, onTimePayments: 100, label: 'Elite' },
    { score: 850, circlesCompleted: 10, onTimePayments: 50, label: 'Trusted' },
    { score: 700, circlesCompleted: 5, onTimePayments: 25, label: 'Good' },
    { score: 500, circlesCompleted: 2, onTimePayments: 10, label: 'New' },
    { score: 300, circlesCompleted: 1, onTimePayments: 5, label: 'Beginner' },
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const rep = reputationLevels[i % reputationLevels.length];
    return mockUser({
      nickname: `${rep.label}User${i + 1}`,
      reputation: {
        score: rep.score,
        circlesCompleted: rep.circlesCompleted,
        circlesDefaulted: Math.floor(Math.random() * 2),
        onTimePayments: rep.onTimePayments,
        latePayments: Math.floor(Math.random() * 3),
        totalVolume: rep.circlesCompleted * 10000000,
      },
    });
  });
}

// ============================================================================
// Transaction Data Generators
// ============================================================================

/** Generate multiple transactions */
export function generateTransactions(count: number, overrides?: Partial<Transaction>): Transaction[] {
  const types = ['contract-call', 'token-transfer', 'contract-deploy'];
  const statuses = ['success', 'pending', 'failed'];
  const contracts = [
    'stacksusu-core-v7',
    'stacksusu-escrow-v7',
    'stacksusu-reputation-v7',
    'stacksusu-referral-v7',
    'stacksusu-governance-v7',
  ];
  const functions = [
    'create-circle',
    'join-circle',
    'make-contribution',
    'claim-payout',
    'deposit-to-escrow',
    'update-reputation',
  ];
  
  return Array.from({ length: count }, (_, i) => 
    mockTransaction({
      type: types[i % types.length],
      status: statuses[i % statuses.length],
      contractName: contracts[i % contracts.length],
      functionName: functions[i % functions.length],
      blockHeight: 100000 + i * 10,
      timestamp: Date.now() - i * 3600000,
      ...overrides,
    })
  );
}

/** Generate transaction history for a user */
export function generateUserTransactions(
  userAddress: string,
  count: number
): Transaction[] {
  return generateTransactions(count, { sender: userAddress });
}

// ============================================================================
// Contribution Data Generators
// ============================================================================

/** Generate contributions for a circle */
export function generateCircleContributions(
  circleId: number,
  memberAddresses: string[],
  rounds: number
): Contribution[] {
  const contributions: Contribution[] = [];
  let id = 1;
  
  for (let round = 1; round <= rounds; round++) {
    memberAddresses.forEach((member, i) => {
      contributions.push(mockContribution({
        id: id++,
        circleId,
        member,
        round,
        amount: 1000000,
        timestamp: Date.now() - (rounds - round) * 604800000 - i * 3600000,
        blockHeight: 100000 + round * 100 + i,
      }));
    });
  }
  
  return contributions;
}

// ============================================================================
// NFT Data Generators
// ============================================================================

export interface NFTBadge {
  id: number;
  tokenId: number;
  owner: string;
  name: string;
  description: string;
  imageUrl: string;
  rarity: 'common' | 'uncommon' | 'rare' | 'epic' | 'legendary';
  attributes: Array<{ trait: string; value: string }>;
  mintedAt: number;
  circleId?: number;
}

/** Generate NFT badges */
export function generateNFTBadges(count: number, owner?: string): NFTBadge[] {
  const rarities: NFTBadge['rarity'][] = ['common', 'uncommon', 'rare', 'epic', 'legendary'];
  const badgeTypes = [
    { name: 'First Circle', desc: 'Completed your first savings circle' },
    { name: 'Contributing Member', desc: 'Made 10+ contributions' },
    { name: 'Circle Creator', desc: 'Created 5+ savings circles' },
    { name: 'Trusted Member', desc: 'Achieved 900+ reputation score' },
    { name: 'Punctual Payer', desc: '50+ on-time payments' },
    { name: 'High Roller', desc: 'Contributed 100+ STX total' },
    { name: 'Community Leader', desc: 'Referred 10+ members' },
    { name: 'Governance Participant', desc: 'Voted on 5+ proposals' },
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const badgeType = badgeTypes[i % badgeTypes.length];
    return {
      id: i + 1,
      tokenId: i + 1,
      owner: owner || mockStacksAddress(),
      name: badgeType.name,
      description: badgeType.desc,
      imageUrl: `https://api.stacksusu.com/nft/${i + 1}.png`,
      rarity: rarities[Math.floor(Math.random() * rarities.length)],
      attributes: [
        { trait: 'Category', value: 'Achievement' },
        { trait: 'Rarity', value: rarities[Math.floor(Math.random() * rarities.length)] },
      ],
      mintedAt: Date.now() - Math.floor(Math.random() * 2592000000),
      circleId: Math.floor(Math.random() * 100) + 1,
    };
  });
}

// ============================================================================
// Referral Data Generators
// ============================================================================

export interface Referral {
  id: number;
  referrer: string;
  referee: string;
  status: 'pending' | 'completed' | 'expired';
  rewardAmount: number;
  createdAt: number;
  completedAt?: number;
  circleId?: number;
}

/** Generate referral data */
export function generateReferrals(count: number, referrer?: string): Referral[] {
  const statuses: Referral['status'][] = ['pending', 'completed', 'expired'];
  
  return Array.from({ length: count }, (_, i) => {
    const status = statuses[i % statuses.length];
    const refAddr = referrer || mockStacksAddress();
    
    return {
      id: i + 1,
      referrer: refAddr,
      referee: mockStacksAddress(),
      status,
      rewardAmount: [100000, 250000, 500000, 1000000][i % 4],
      createdAt: Date.now() - Math.floor(Math.random() * 604800000),
      completedAt: status === 'completed' ? Date.now() - Math.floor(Math.random() * 86400000) : undefined,
      circleId: Math.floor(Math.random() * 50) + 1,
    };
  });
}

// ============================================================================
// Governance Data Generators
// ============================================================================

export interface Proposal {
  id: number;
  title: string;
  description: string;
  proposer: string;
  circleId: number;
  status: 'active' | 'passed' | 'rejected' | 'executed';
  votesFor: number;
  votesAgainst: number;
  totalVotingPower: number;
  startBlock: number;
  endBlock: number;
  createdAt: number;
}

/** Generate governance proposals */
export function generateProposals(count: number, circleId?: number): Proposal[] {
  const statuses: Proposal['status'][] = ['active', 'passed', 'rejected', 'executed'];
  const proposalTypes = [
    { title: 'Change Contribution Amount', desc: 'Proposal to adjust the contribution amount' },
    { title: 'Add New Member', desc: 'Vote to approve new member' },
    { title: 'Update Payout Schedule', desc: 'Modify the payout frequency' },
    { title: 'Emergency Pause', desc: 'Emergency proposal to pause circle' },
    { title: 'Change Circle Settings', desc: 'Update circle configuration' },
  ];
  
  return Array.from({ length: count }, (_, i) => {
    const type = proposalTypes[i % proposalTypes.length];
    const status = statuses[i % statuses.length];
    const votesFor = Math.floor(Math.random() * 10);
    const votesAgainst = Math.floor(Math.random() * 5);
    
    return {
      id: i + 1,
      title: type.title,
      description: type.desc,
      proposer: mockStacksAddress(),
      circleId: circleId || Math.floor(Math.random() * 50) + 1,
      status,
      votesFor,
      votesAgainst,
      totalVotingPower: votesFor + votesAgainst,
      startBlock: 100000 + i * 100,
      endBlock: 100000 + i * 100 + 1440,
      createdAt: Date.now() - Math.floor(Math.random() * 604800000),
    };
  });
}

// ============================================================================
// Dashboard Data Generators
// ============================================================================

export interface DashboardStats {
  totalCircles: number;
  activeCircles: number;
  totalMembers: number;
  totalContributed: number;
  totalPayouts: number;
  averageCircleSize: number;
  topContributors: Array<{ address: string; amount: number }>;
  recentActivity: Array<{
    type: string;
    description: string;
    timestamp: number;
  }>;
}

/** Generate dashboard statistics */
export function generateDashboardStats(): DashboardStats {
  const circles = generateCirclesMixed(20);
  const activeCircles = circles.filter(c => c.status === 'active');
  
  return {
    totalCircles: circles.length,
    activeCircles: activeCircles.length,
    totalMembers: circles.reduce((sum, c) => sum + c.memberCount, 0),
    totalContributed: circles.reduce((sum, c) => 
      sum + c.contributionAmount * c.memberCount * c.currentRound, 0
    ),
    totalPayouts: circles.reduce((sum, c) => sum + c.currentRound, 0) * 1000000,
    averageCircleSize: Math.round(
      circles.reduce((sum, c) => sum + c.memberCount, 0) / circles.length
    ),
    topContributors: Array.from({ length: 5 }, () => ({
      address: mockStacksAddress(),
      amount: Math.floor(Math.random() * 50000000) + 1000000,
    })).sort((a, b) => b.amount - a.amount),
    recentActivity: [
      { type: 'circle_created', description: 'New circle "Weekly Savings" created', timestamp: Date.now() - 300000 },
      { type: 'contribution', description: '10 STX contributed to "Friends Fund"', timestamp: Date.now() - 900000 },
      { type: 'payout', description: 'Payout claimed in "Family Savings"', timestamp: Date.now() - 1800000 },
      { type: 'member_joined', description: 'New member joined "Crypto Club"', timestamp: Date.now() - 3600000 },
      { type: 'circle_completed', description: '"Test Circle" completed successfully', timestamp: Date.now() - 7200000 },
    ],
  };
}

// ============================================================================
// Type Definitions
// ============================================================================

interface Circle {
  id: number;
  name: string;
  description?: string;
  creator: string;
  contributionAmount: number;
  maxMembers: number;
  memberCount: number;
  currentRound: number;
  totalRounds: number;
  status: string;
  frequency: string;
  mode: string;
  createdAt: number;
  startBlock: number;
  payoutInterval: number;
  minReputation: number;
}

interface User {
  address: string;
  nickname?: string;
  balance: number;
  stxBalance: number;
  reputation: {
    score: number;
    circlesCompleted: number;
    circlesDefaulted: number;
    onTimePayments: number;
    latePayments: number;
    totalVolume: number;
  };
  createdAt: number;
}

interface FullCircle extends Circle {
  members: Array<User & { joinedAt: number; hasContributed: boolean; payoutReceived: boolean; payoutOrder: number }>;
  contributions: Array<{
    id: number;
    circleId: number;
    member: string;
    amount: number;
    round: number;
    timestamp: number;
    blockHeight: number;
    txId: string;
  }>;
  totalContributed: number;
  nextPayoutDate: number;
}
