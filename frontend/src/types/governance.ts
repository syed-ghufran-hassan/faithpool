/**
 * Governance Type Definitions
 * Circle-level voting and proposals
 */

export const ProposalType = {
  EXTEND_DEADLINE: 1,
  CHANGE_INTERVAL: 2,
  PAUSE_CIRCLE: 3,
  RESUME_CIRCLE: 4,
  REMOVE_MEMBER: 5,
  CHANGE_ORDER: 6,
} as const;

export type ProposalType = typeof ProposalType[keyof typeof ProposalType];

export const ProposalStatus = {
  ACTIVE: 0,
  PASSED: 1,
  REJECTED: 2,
  EXECUTED: 3,
  EXPIRED: 4,
} as const;

export type ProposalStatus = typeof ProposalStatus[keyof typeof ProposalStatus];

export interface Proposal {
  id: number;
  circleId: number;
  proposer: string;
  proposalType: ProposalType;
  description: string;
  value: number;
  targetMember?: string;
  createdAt: number; // block height
  expiresAt: number; // block height
  votesFor: number;
  votesAgainst: number;
  status: ProposalStatus;
  executedAt?: number;
}

export interface Vote {
  proposalId: number;
  voter: string;
  inFavor: boolean;
  votedAt: number;
}

// Constants
export const VOTING_PERIOD_BLOCKS = 432; // ~3 days at 10 min/block
export const QUORUM_PERCENT = 50; // 50% of members must vote
export const PASS_THRESHOLD_PERCENT = 60; // 60% of votes must be in favor

/**
 * Get proposal type label
 */
export function getProposalTypeName(type: ProposalType): string {
  const names: Record<ProposalType, string> = {
    [ProposalType.EXTEND_DEADLINE]: 'Extend Deadline',
    [ProposalType.CHANGE_INTERVAL]: 'Change Payout Interval',
    [ProposalType.PAUSE_CIRCLE]: 'Pause Circle',
    [ProposalType.RESUME_CIRCLE]: 'Resume Circle',
    [ProposalType.REMOVE_MEMBER]: 'Remove Member',
    [ProposalType.CHANGE_ORDER]: 'Change Payout Order',
  };
  return names[type] || 'Unknown';
}

/**
 * Get proposal status label
 */
export function getProposalStatusLabel(status: ProposalStatus): string {
  const labels: Record<ProposalStatus, string> = {
    [ProposalStatus.ACTIVE]: 'Voting Open',
    [ProposalStatus.PASSED]: 'Passed',
    [ProposalStatus.REJECTED]: 'Rejected',
    [ProposalStatus.EXECUTED]: 'Executed',
    [ProposalStatus.EXPIRED]: 'Expired',
  };
  return labels[status] || 'Unknown';
}

/**
 * Get status color
 */
export function getProposalStatusColor(status: ProposalStatus): string {
  const colors: Record<ProposalStatus, string> = {
    [ProposalStatus.ACTIVE]: 'blue',
    [ProposalStatus.PASSED]: 'green',
    [ProposalStatus.REJECTED]: 'red',
    [ProposalStatus.EXECUTED]: 'purple',
    [ProposalStatus.EXPIRED]: 'gray',
  };
  return colors[status] || 'gray';
}

/**
 * Calculate if quorum is reached
 */
export function hasQuorum(totalVotes: number, memberCount: number): boolean {
  return (totalVotes / memberCount) * 100 >= QUORUM_PERCENT;
}

/**
 * Calculate if proposal passes
 */
export function willPass(votesFor: number, votesAgainst: number): boolean {
  const totalVotes = votesFor + votesAgainst;
  if (totalVotes === 0) return false;
  return (votesFor / totalVotes) * 100 >= PASS_THRESHOLD_PERCENT;
}

/**
 * Get voting progress percentage
 */
export function getVotingProgress(proposal: Proposal, currentBlock: number): number {
  const totalBlocks = proposal.expiresAt - proposal.createdAt;
  const elapsed = currentBlock - proposal.createdAt;
  return Math.min(100, (elapsed / totalBlocks) * 100);
}

/**
 * Get blocks remaining for voting
 */
export function getBlocksRemaining(proposal: Proposal, currentBlock: number): number {
  return Math.max(0, proposal.expiresAt - currentBlock);
}
