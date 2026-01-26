/**
 * Referral system utility functions for StackSUSU
 */

import { REFERRAL_CONFIG } from '../constants/contracts';

export interface ReferralCode {
  code: string;
  owner: string;
  createdAt: number;
  usageCount: number;
  totalRewards: number;
  isActive: boolean;
}

export interface ReferralReward {
  referrer: string;
  referee: string;
  amount: number;
  circleId: number;
  claimedAt?: number;
  txId?: string;
}

export interface ReferralStats {
  totalReferrals: number;
  activeReferrals: number;
  totalRewards: number;
  pendingRewards: number;
  claimedRewards: number;
  tier: ReferralTier;
}

export type ReferralTier = 'bronze' | 'silver' | 'gold' | 'platinum' | 'diamond';

/**
 * Generate a unique referral code from address
 */
export function generateReferralCode(address: string): string {
  // Take last 8 characters of address and add random suffix
  const addressPart = address.slice(-8).replace(/[^A-Za-z0-9]/g, '');
  const randomPart = Math.random().toString(36).substring(2, 6).toUpperCase();
  return `SS${addressPart}${randomPart}`;
}

/**
 * Validate referral code format
 */
export function isValidReferralCode(code: string): boolean {
  if (!code || typeof code !== 'string') return false;
  // Must start with SS, be 14-18 chars, alphanumeric
  const pattern = /^SS[A-Za-z0-9]{12,16}$/;
  return pattern.test(code);
}

/**
 * Calculate referral reward amount
 */
export function calculateReferralReward(
  contributionAmount: number,
  tier: ReferralTier = 'bronze'
): number {
  const tierMultipliers: Record<ReferralTier, number> = {
    bronze: 1.0,
    silver: 1.25,
    gold: 1.5,
    platinum: 2.0,
    diamond: 2.5,
  };
  
  const baseReward = contributionAmount * REFERRAL_CONFIG.BASE_REWARD_PERCENTAGE;
  return Math.floor(baseReward * tierMultipliers[tier]);
}

/**
 * Get referral tier based on total referrals
 */
export function getReferralTier(totalReferrals: number): ReferralTier {
  if (totalReferrals >= 100) return 'diamond';
  if (totalReferrals >= 50) return 'platinum';
  if (totalReferrals >= 25) return 'gold';
  if (totalReferrals >= 10) return 'silver';
  return 'bronze';
}

/**
 * Get tier display info
 */
export function getTierInfo(tier: ReferralTier): {
  name: string;
  color: string;
  icon: string;
  nextTier: ReferralTier | null;
  referralsNeeded: number;
} {
  const tierInfo: Record<ReferralTier, { name: string; color: string; icon: string; nextTier: ReferralTier | null; referralsNeeded: number }> = {
    bronze: { name: 'Bronze', color: '#cd7f32', icon: '🥉', nextTier: 'silver', referralsNeeded: 10 },
    silver: { name: 'Silver', color: '#c0c0c0', icon: '🥈', nextTier: 'gold', referralsNeeded: 25 },
    gold: { name: 'Gold', color: '#ffd700', icon: '🥇', nextTier: 'platinum', referralsNeeded: 50 },
    platinum: { name: 'Platinum', color: '#e5e4e2', icon: '💎', nextTier: 'diamond', referralsNeeded: 100 },
    diamond: { name: 'Diamond', color: '#b9f2ff', icon: '💠', nextTier: null, referralsNeeded: 0 },
  };
  return tierInfo[tier];
}

/**
 * Calculate progress to next tier
 */
export function getTierProgress(totalReferrals: number): {
  currentTier: ReferralTier;
  progress: number;
  referralsToNext: number;
} {
  const currentTier = getReferralTier(totalReferrals);
  const tierInfo = getTierInfo(currentTier);
  
  if (!tierInfo.nextTier) {
    return { currentTier, progress: 100, referralsToNext: 0 };
  }
  
  const tierThresholds: Record<ReferralTier, number> = {
    bronze: 0,
    silver: 10,
    gold: 25,
    platinum: 50,
    diamond: 100,
  };
  
  const currentThreshold = tierThresholds[currentTier];
  const nextThreshold = tierInfo.referralsNeeded;
  const range = nextThreshold - currentThreshold;
  const progress = Math.min(100, ((totalReferrals - currentThreshold) / range) * 100);
  
  return {
    currentTier,
    progress: Math.round(progress),
    referralsToNext: Math.max(0, nextThreshold - totalReferrals),
  };
}

/**
 * Format referral reward amount
 */
export function formatRewardAmount(amount: number): string {
  const stxAmount = amount / 1_000_000;
  return `${stxAmount.toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 6,
  })} STX`;
}

/**
 * Calculate total claimable rewards
 */
export function getTotalClaimable(rewards: ReferralReward[]): number {
  return rewards
    .filter(r => !r.claimedAt)
    .reduce((sum, r) => sum + r.amount, 0);
}

/**
 * Get referral leaderboard ranking
 */
export function getReferralRank(
  userStats: ReferralStats,
  allStats: ReferralStats[]
): number {
  const sorted = [...allStats].sort((a, b) => b.totalReferrals - a.totalReferrals);
  const rank = sorted.findIndex(s => s.totalReferrals === userStats.totalReferrals);
  return rank + 1;
}

/**
 * Sort referral codes by various criteria
 */
export function sortReferralCodes(
  codes: ReferralCode[],
  sortBy: 'created' | 'usage' | 'rewards' = 'created',
  direction: 'asc' | 'desc' = 'desc'
): ReferralCode[] {
  const sorted = [...codes].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'created':
        comparison = a.createdAt - b.createdAt;
        break;
      case 'usage':
        comparison = a.usageCount - b.usageCount;
        break;
      case 'rewards':
        comparison = a.totalRewards - b.totalRewards;
        break;
    }
    return direction === 'asc' ? comparison : -comparison;
  });
  return sorted;
}

/**
 * Check if user can create a new referral code
 */
export function canCreateReferralCode(existingCodes: ReferralCode[]): boolean {
  const activeCodes = existingCodes.filter(c => c.isActive);
  return activeCodes.length < REFERRAL_CONFIG.MAX_CODES_PER_USER;
}

/**
 * Get referral link from code
 */
export function getReferralLink(code: string, baseUrl: string = 'https://stacksusu.com'): string {
  return `${baseUrl}/join?ref=${encodeURIComponent(code)}`;
}

/**
 * Parse referral code from URL
 */
export function parseReferralFromUrl(url: string): string | null {
  try {
    const urlObj = new URL(url);
    return urlObj.searchParams.get('ref');
  } catch {
    return null;
  }
}
