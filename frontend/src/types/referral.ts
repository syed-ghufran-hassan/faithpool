/**
 * Referral Type Definitions
 * Referral program with tiered rewards
 */

export interface Referral {
  referee: string; // The person who was referred
  referrer: string; // The person who referred them
  referredAt: number; // block height
  circlesJoined: number;
  totalVolume: number; // microSTX
  rewardsClaimed: number; // microSTX
}

export interface ReferrerStats {
  totalReferrals: number;
  activeReferrals: number;
  totalEarned: number; // microSTX
  pendingRewards: number; // microSTX
  lastPayout: number; // block height
  tier: ReferralTier;
}

export type ReferralTier = 0 | 1 | 2 | 3;

export interface TierInfo {
  tier: ReferralTier;
  name: string;
  threshold: number;
  multiplier: number;
  color: string;
}

// Tier definitions
export const REFERRAL_TIERS: Record<ReferralTier, TierInfo> = {
  0: { tier: 0, name: 'Starter', threshold: 0, multiplier: 1.0, color: '#6b7280' },
  1: { tier: 1, name: 'Bronze', threshold: 5, multiplier: 1.25, color: '#cd7f32' },
  2: { tier: 2, name: 'Silver', threshold: 20, multiplier: 1.5, color: '#c0c0c0' },
  3: { tier: 3, name: 'Gold', threshold: 50, multiplier: 2.0, color: '#ffd700' },
};

// Base reward percentage (in basis points)
export const BASE_REWARD_BPS = 50; // 0.5%

/**
 * Get tier based on referral count
 */
export function getTierFromCount(referralCount: number): ReferralTier {
  if (referralCount >= 50) return 3;
  if (referralCount >= 20) return 2;
  if (referralCount >= 5) return 1;
  return 0;
}

/**
 * Get tier info
 */
export function getTierInfo(tier: ReferralTier): TierInfo {
  return REFERRAL_TIERS[tier];
}

/**
 * Calculate referral reward
 */
export function calculateReward(volumeMicroSTX: number, tier: ReferralTier): number {
  const tierInfo = REFERRAL_TIERS[tier];
  const baseReward = Math.floor((volumeMicroSTX * BASE_REWARD_BPS) / 10000);
  return Math.floor(baseReward * tierInfo.multiplier);
}

/**
 * Get progress to next tier
 */
export function getProgressToNextTier(currentCount: number): {
  current: number;
  required: number;
  percent: number;
  nextTier: TierInfo | null;
} {
  const currentTier = getTierFromCount(currentCount);
  
  if (currentTier === 3) {
    return { current: currentCount, required: 50, percent: 100, nextTier: null };
  }
  
  const nextTierLevel = (currentTier + 1) as ReferralTier;
  const nextTier = REFERRAL_TIERS[nextTierLevel];
  const prevThreshold = REFERRAL_TIERS[currentTier].threshold;
  const progress = currentCount - prevThreshold;
  const needed = nextTier.threshold - prevThreshold;
  const percent = Math.min(100, (progress / needed) * 100);
  
  return { current: currentCount, required: nextTier.threshold, percent, nextTier };
}

/**
 * Format referral link
 */
export function formatReferralLink(referrerAddress: string, baseUrl = 'https://stacksusu.xyz'): string {
  return `${baseUrl}?ref=${referrerAddress}`;
}
