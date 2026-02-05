/**
 * Member-related utility functions for StackSUSU
 */

import { MEMBER_STATUS, REPUTATION_TIERS } from '../constants/contracts';

export interface Member {
  address: string;
  joinedAt: number;
  status: number;
  contributionCount: number;
  payoutReceived: boolean;
  reputation?: number;
}

export interface MemberStats {
  totalContributed: number;
  totalReceived: number;
  circlesJoined: number;
  circlesCompleted: number;
  onTimePercentage: number;
}

/**
 * Check if a member is active
 */
export function isMemberActive(member: Member): boolean {
  return member.status === MEMBER_STATUS.ACTIVE;
}

/**
 * Get member status label
 */
export function getMemberStatusLabel(status: number): string {
  const labels: Record<number, string> = {
    [MEMBER_STATUS.ACTIVE]: 'Active',
    [MEMBER_STATUS.REMOVED]: 'Removed',
    [MEMBER_STATUS.LEFT]: 'Left',
  };
  return labels[status] || 'Unknown';
}

/**
 * Get reputation tier for a member
 */
export function getMemberTier(reputation: number): {
  name: string;
  level: number;
  minPoints: number;
  maxPoints: number;
} {
  if (reputation >= REPUTATION_TIERS.DIAMOND.min) {
    return { name: 'Diamond', level: 5, minPoints: REPUTATION_TIERS.DIAMOND.min, maxPoints: Infinity };
  }
  if (reputation >= REPUTATION_TIERS.PLATINUM.min) {
    return { name: 'Platinum', level: 4, minPoints: REPUTATION_TIERS.PLATINUM.min, maxPoints: REPUTATION_TIERS.PLATINUM.max };
  }
  if (reputation >= REPUTATION_TIERS.GOLD.min) {
    return { name: 'Gold', level: 3, minPoints: REPUTATION_TIERS.GOLD.min, maxPoints: REPUTATION_TIERS.GOLD.max };
  }
  if (reputation >= REPUTATION_TIERS.SILVER.min) {
    return { name: 'Silver', level: 2, minPoints: REPUTATION_TIERS.SILVER.min, maxPoints: REPUTATION_TIERS.SILVER.max };
  }
  return { name: 'Bronze', level: 1, minPoints: REPUTATION_TIERS.BRONZE.min, maxPoints: REPUTATION_TIERS.BRONZE.max };
}

/**
 * Get tier badge emoji
 */
export function getTierEmoji(tierName: string): string {
  const emojis: Record<string, string> = {
    Bronze: '🥉',
    Silver: '🥈',
    Gold: '🥇',
    Platinum: '💎',
    Diamond: '👑',
  };
  return emojis[tierName] || '🏅';
}

/**
 * Calculate progress to next tier
 */
export function getTierProgress(reputation: number): {
  current: number;
  target: number;
  percentage: number;
  nextTier: string | null;
} {
  const tier = getMemberTier(reputation);
  
  if (tier.name === 'Diamond') {
    return { current: reputation, target: reputation, percentage: 100, nextTier: null };
  }
  
  const nextTierNames: Record<string, string> = {
    Bronze: 'Silver',
    Silver: 'Gold',
    Gold: 'Platinum',
    Platinum: 'Diamond',
  };
  
  const target = tier.maxPoints + 1;
  const progress = reputation - tier.minPoints;
  const range = target - tier.minPoints;
  const percentage = Math.min(100, Math.round((progress / range) * 100));
  
  return {
    current: reputation,
    target,
    percentage,
    nextTier: nextTierNames[tier.name] || null,
  };
}

/**
 * Format member address for display
 */
export function formatMemberAddress(address: string, length = 8): string {
  if (!address || address.length < length * 2) return address;
  return `${address.slice(0, length)}...${address.slice(-length / 2)}`;
}

/**
 * Get member avatar color based on address
 */
export function getMemberAvatarColor(address: string): string {
  const colors = [
    '#f97316', // orange
    '#22c55e', // green
    '#3b82f6', // blue
    '#a855f7', // purple
    '#ec4899', // pink
    '#14b8a6', // teal
    '#f59e0b', // amber
    '#6366f1', // indigo
  ];
  
  // Simple hash from address
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
}

/**
 * Sort members by various criteria
 */
export function sortMembers(
  members: Member[],
  sortBy: 'joined' | 'reputation' | 'contributions' | 'address' = 'joined',
  direction: 'asc' | 'desc' = 'asc'
): Member[] {
  const sorted = [...members].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'joined':
        comparison = a.joinedAt - b.joinedAt;
        break;
      case 'reputation':
        comparison = (a.reputation || 0) - (b.reputation || 0);
        break;
      case 'contributions':
        comparison = a.contributionCount - b.contributionCount;
        break;
      case 'address':
        comparison = a.address.localeCompare(b.address);
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

/**
 * Filter members by status
 */
export function filterMembersByStatus(members: Member[], status: number | 'all'): Member[] {
  if (status === 'all') return members;
  return members.filter(m => m.status === status);
}

/**
 * Check if address is valid Stacks principal
 */
export function isValidStacksAddress(address: string): boolean {
  // Stacks addresses start with SP (mainnet) or ST (testnet)
  const regex = /^S[PT][A-Z0-9]{38,40}$/;
  return regex.test(address);
}

/**
 * Get member initials for avatar
 */
export function getMemberInitials(address: string): string {
  if (!address) return '??';
  // Use first and last chars of the meaningful part
  const clean = address.replace(/^S[PT]/, '');
  return `${clean[0]}${clean[clean.length - 1]}`.toUpperCase();
}
