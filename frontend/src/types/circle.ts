/**
 * Circle Type Definitions
 * Core data structures for StackSusu circles
 */

export const CircleStatus = {
  PENDING: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  CANCELLED: 3,
  PAUSED: 4,
} as const;

export type CircleStatus = typeof CircleStatus[keyof typeof CircleStatus];

export const ContributionMode = {
  UPFRONT: 0,
  ROUND_BY_ROUND: 1,
} as const;

export type ContributionMode = typeof ContributionMode[keyof typeof ContributionMode];

export interface Circle {
  id: number;
  creator: string;
  name: string;
  contribution: number; // in microSTX
  maxMembers: number;
  payoutInterval: number; // in days
  status: CircleStatus;
  currentRound: number;
  startBlock: number;
  memberCount: number;
  createdAt: number; // block height
  contributionMode: ContributionMode;
  minReputation: number;
  totalContributed: number;
  totalPaidOut: number;
}

export interface CircleMember {
  circleId: number;
  member: string;
  slot: number;
  joinedAt: number; // block height
  hasDeposited: boolean;
  contributionsMade: number;
  lastContributionRound: number;
  hasReceivedPayout: boolean;
}

export interface CircleDeposit {
  circleId: number;
  member: string;
  deposited: boolean;
  amount: number; // in microSTX
  depositBlock: number;
}

export interface CirclePayout {
  circleId: number;
  round: number;
  recipient: string;
  amount: number; // in microSTX
  claimedAt: number; // block height
  isEmergency: boolean;
}

export interface RoundContribution {
  circleId: number;
  round: number;
  member: string;
  amount: number;
  contributedAt: number;
  isLate: boolean;
}

// Circle creation parameters
export interface CreateCircleParams {
  name: string;
  contribution: number; // in microSTX
  maxMembers: number;
  payoutIntervalDays: number;
  contributionMode: ContributionMode;
  minReputation: number;
}

// Circle summary for list views
export interface CircleSummary {
  id: number;
  name: string;
  contribution: number;
  memberCount: number;
  maxMembers: number;
  status: CircleStatus;
  contributionMode: ContributionMode;
  currentRound: number;
}

// Helper functions

export function getStatusLabel(status: CircleStatus): string {
  const labels: Record<CircleStatus, string> = {
    [CircleStatus.PENDING]: 'Pending',
    [CircleStatus.ACTIVE]: 'Active',
    [CircleStatus.COMPLETED]: 'Completed',
    [CircleStatus.CANCELLED]: 'Cancelled',
    [CircleStatus.PAUSED]: 'Paused',
  };
  return labels[status] ?? 'Unknown';
}

export function getStatusColor(status: CircleStatus): string {
  const colors: Record<CircleStatus, string> = {
    [CircleStatus.PENDING]: 'yellow',
    [CircleStatus.ACTIVE]: 'green',
    [CircleStatus.COMPLETED]: 'blue',
    [CircleStatus.CANCELLED]: 'red',
    [CircleStatus.PAUSED]: 'orange',
  };
  return colors[status] ?? 'gray';
}

export function getModeLabel(mode: ContributionMode): string {
  return mode === ContributionMode.UPFRONT ? 'Upfront' : 'Round-by-Round';
}

export function isCircleJoinable(circle: Circle): boolean {
  return (
    circle.status === CircleStatus.PENDING &&
    circle.memberCount < circle.maxMembers
  );
}

export function isCircleActive(circle: Circle): boolean {
  return circle.status === CircleStatus.ACTIVE;
}

export function getTotalPoolAmount(circle: Circle): number {
  return circle.contribution * circle.maxMembers;
}
