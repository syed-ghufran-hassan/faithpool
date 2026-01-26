/**
 * Governance-related utility functions for StackSUSU
 */

import { BLOCK_TIMES } from '../constants/contracts';

export type ProposalStatus = 'pending' | 'active' | 'passed' | 'rejected' | 'executed' | 'expired';

export interface Proposal {
  id: number;
  creator: string;
  title: string;
  description: string;
  createdAt: number;
  votingEndsAt: number;
  executionDelay: number;
  votesFor: number;
  votesAgainst: number;
  totalVoters: number;
  executed: boolean;
  proposalType: 'parameter' | 'upgrade' | 'emergency' | 'general';
  parameters?: Record<string, unknown>;
}

export interface Vote {
  voter: string;
  proposalId: number;
  support: boolean;
  weight: number;
  votedAt: number;
}

/**
 * Calculate proposal status based on current block height
 */
export function getProposalStatus(proposal: Proposal, currentBlockHeight: number): ProposalStatus {
  if (proposal.executed) return 'executed';
  
  if (currentBlockHeight < proposal.createdAt) return 'pending';
  
  if (currentBlockHeight <= proposal.votingEndsAt) return 'active';
  
  const isPassed = proposal.votesFor > proposal.votesAgainst && 
                   proposal.totalVoters >= getQuorumThreshold(proposal);
  
  if (!isPassed) return 'rejected';
  
  const executionBlock = proposal.votingEndsAt + proposal.executionDelay;
  if (currentBlockHeight < executionBlock) return 'passed';
  
  // Check if execution window expired (e.g., 1 week after execution becomes available)
  const expirationBlock = executionBlock + BLOCK_TIMES.BLOCKS_PER_WEEK;
  if (currentBlockHeight > expirationBlock) return 'expired';
  
  return 'passed';
}

/**
 * Get quorum threshold for a proposal
 */
export function getQuorumThreshold(proposal: Proposal): number {
  // Different proposal types may have different quorum requirements
  const thresholds: Record<string, number> = {
    emergency: 5,
    parameter: 10,
    upgrade: 20,
    general: 15,
  };
  return thresholds[proposal.proposalType] || 10;
}

/**
 * Calculate vote percentage
 */
export function getVotePercentage(votesFor: number, votesAgainst: number): {
  forPercentage: number;
  againstPercentage: number;
} {
  const total = votesFor + votesAgainst;
  if (total === 0) return { forPercentage: 0, againstPercentage: 0 };
  
  return {
    forPercentage: Math.round((votesFor / total) * 100),
    againstPercentage: Math.round((votesAgainst / total) * 100),
  };
}

/**
 * Estimate time remaining for voting
 */
export function getTimeRemaining(endBlock: number, currentBlock: number): {
  blocks: number;
  seconds: number;
  formatted: string;
} {
  const blocksRemaining = Math.max(0, endBlock - currentBlock);
  const secondsRemaining = blocksRemaining * BLOCK_TIMES.AVG_BLOCK_TIME_SECONDS;
  
  return {
    blocks: blocksRemaining,
    seconds: secondsRemaining,
    formatted: formatDuration(secondsRemaining),
  };
}

/**
 * Format duration in seconds to human readable string
 */
function formatDuration(seconds: number): string {
  if (seconds <= 0) return 'Ended';
  
  const days = Math.floor(seconds / 86400);
  const hours = Math.floor((seconds % 86400) / 3600);
  const minutes = Math.floor((seconds % 3600) / 60);
  
  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
}

/**
 * Check if user has voted on proposal
 */
export function hasUserVoted(votes: Vote[], userAddress: string, proposalId: number): boolean {
  return votes.some(v => v.voter === userAddress && v.proposalId === proposalId);
}

/**
 * Get user's vote on proposal
 */
export function getUserVote(votes: Vote[], userAddress: string, proposalId: number): Vote | null {
  return votes.find(v => v.voter === userAddress && v.proposalId === proposalId) || null;
}

/**
 * Calculate voting power based on reputation
 */
export function calculateVotingPower(reputation: number): number {
  // Quadratic voting power: sqrt of reputation
  return Math.floor(Math.sqrt(reputation));
}

/**
 * Get proposal type label
 */
export function getProposalTypeLabel(type: string): string {
  const labels: Record<string, string> = {
    parameter: 'Parameter Change',
    upgrade: 'Contract Upgrade',
    emergency: 'Emergency Action',
    general: 'General Proposal',
  };
  return labels[type] || 'Proposal';
}

/**
 * Get proposal status color
 */
export function getProposalStatusColor(status: ProposalStatus): string {
  const colors: Record<ProposalStatus, string> = {
    pending: '#fbbf24',
    active: '#22c55e',
    passed: '#3b82f6',
    rejected: '#ef4444',
    executed: '#8b5cf6',
    expired: '#6b7280',
  };
  return colors[status];
}

/**
 * Sort proposals by various criteria
 */
export function sortProposals(
  proposals: Proposal[],
  sortBy: 'created' | 'votes' | 'ending' = 'created',
  direction: 'asc' | 'desc' = 'desc'
): Proposal[] {
  const sorted = [...proposals].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'created':
        comparison = a.createdAt - b.createdAt;
        break;
      case 'votes':
        comparison = (a.votesFor + a.votesAgainst) - (b.votesFor + b.votesAgainst);
        break;
      case 'ending':
        comparison = a.votingEndsAt - b.votingEndsAt;
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

/**
 * Filter proposals by status
 */
export function filterProposalsByStatus(
  proposals: Proposal[],
  status: ProposalStatus | 'all',
  currentBlock: number
): Proposal[] {
  if (status === 'all') return proposals;
  return proposals.filter(p => getProposalStatus(p, currentBlock) === status);
}
