/**
 * Reputation Utilities
 * 
 * Helper functions for reputation score calculations and tier management.
 */

import { ReputationTier, ReputationInfo } from '../types/core';

// ===== Tier Configuration =====

export const REPUTATION_TIERS = {
  bronze: { min: 0, max: 99, name: 'Bronze', color: '#CD7F32', icon: '🥉' },
  silver: { min: 100, max: 499, name: 'Silver', color: '#C0C0C0', icon: '🥈' },
  gold: { min: 500, max: 999, name: 'Gold', color: '#FFD700', icon: '🥇' },
  platinum: { min: 1000, max: 4999, name: 'Platinum', color: '#E5E4E2', icon: '💎' },
  diamond: { min: 5000, max: Infinity, name: 'Diamond', color: '#B9F2FF', icon: '👑' },
} as const;

const TIER_ORDER: ReputationTier[] = ['bronze', 'silver', 'gold', 'platinum', 'diamond'];

// ===== Point Values =====

export const REPUTATION_POINTS = {
  // Positive actions
  CREATE_CIRCLE: 10,
  JOIN_CIRCLE: 5,
  CONTRIBUTE_ON_TIME: 15,
  COMPLETE_CIRCLE: 50,
  REFER_MEMBER: 20,
  
  // Penalties
  LATE_CONTRIBUTION: -10,
  MISSED_CONTRIBUTION: -25,
  DEFAULT: -100,
  LEAVE_EARLY: -30,
} as const;

// ===== Tier Calculations =====

/**
 * Get reputation tier from score
 */
export function getTierFromScore(score: number): ReputationTier {
  if (score >= REPUTATION_TIERS.diamond.min) return 'diamond';
  if (score >= REPUTATION_TIERS.platinum.min) return 'platinum';
  if (score >= REPUTATION_TIERS.gold.min) return 'gold';
  if (score >= REPUTATION_TIERS.silver.min) return 'silver';
  return 'bronze';
}

/**
 * Get full reputation info from score
 */
export function getReputationInfo(score: number): ReputationInfo {
  const tier = getTierFromScore(score);
  const tierConfig = REPUTATION_TIERS[tier];
  const tierIndex = TIER_ORDER.indexOf(tier);
  const nextTier = tierIndex < TIER_ORDER.length - 1 ? TIER_ORDER[tierIndex + 1] : undefined;
  
  let pointsToNextTier: number | undefined;
  if (nextTier) {
    pointsToNextTier = REPUTATION_TIERS[nextTier].min - score;
  }

  return {
    score,
    tier,
    tierName: tierConfig.name,
    tierColor: tierConfig.color,
    nextTier,
    pointsToNextTier,
  };
}

/**
 * Get tier display name
 */
export function getTierName(tier: ReputationTier): string {
  return REPUTATION_TIERS[tier].name;
}

/**
 * Get tier color
 */
export function getTierColor(tier: ReputationTier): string {
  return REPUTATION_TIERS[tier].color;
}

/**
 * Get tier icon/emoji
 */
export function getTierIcon(tier: ReputationTier): string {
  return REPUTATION_TIERS[tier].icon;
}

// ===== Progress Calculations =====

/**
 * Calculate progress to next tier (0-100)
 */
export function calculateTierProgress(score: number): number {
  const tier = getTierFromScore(score);
  const tierConfig = REPUTATION_TIERS[tier];
  
  if (tier === 'diamond') return 100;
  
  const tierIndex = TIER_ORDER.indexOf(tier);
  const nextTier = TIER_ORDER[tierIndex + 1];
  const nextTierMin = REPUTATION_TIERS[nextTier].min;
  
  const tierRange = nextTierMin - tierConfig.min;
  const progress = score - tierConfig.min;
  
  return Math.round((progress / tierRange) * 100);
}

/**
 * Get points needed for a specific tier
 */
export function getPointsForTier(tier: ReputationTier): number {
  return REPUTATION_TIERS[tier].min;
}

/**
 * Calculate estimated actions to reach next tier
 */
export function estimateActionsToNextTier(
  currentScore: number,
  pointsPerAction: number = REPUTATION_POINTS.CONTRIBUTE_ON_TIME
): number {
  const tier = getTierFromScore(currentScore);
  const tierIndex = TIER_ORDER.indexOf(tier);
  
  if (tierIndex >= TIER_ORDER.length - 1) return 0;
  
  const nextTier = TIER_ORDER[tierIndex + 1];
  const pointsNeeded = REPUTATION_TIERS[nextTier].min - currentScore;
  
  return Math.ceil(pointsNeeded / pointsPerAction);
}

// ===== Formatting =====

/**
 * Format reputation score for display
 */
export function formatReputationScore(score: number): string {
  if (score >= 10000) {
    return `${(score / 1000).toFixed(1)}K`;
  }
  return score.toLocaleString();
}

/**
 * Format tier badge
 */
export function formatTierBadge(tier: ReputationTier): string {
  const config = REPUTATION_TIERS[tier];
  return `${config.icon} ${config.name}`;
}

// ===== Validation =====

/**
 * Check if user can join premium circles (Gold+)
 */
export function canJoinPremiumCircles(tier: ReputationTier): boolean {
  return ['gold', 'platinum', 'diamond'].includes(tier);
}

/**
 * Check if user can create circles (Silver+)
 */
export function canCreateCircles(tier: ReputationTier): boolean {
  return ['silver', 'gold', 'platinum', 'diamond'].includes(tier);
}

/**
 * Get maximum circles user can join based on tier
 */
export function getMaxCircles(tier: ReputationTier): number {
  const limits: Record<ReputationTier, number> = {
    bronze: 3,
    silver: 5,
    gold: 10,
    platinum: 15,
    diamond: 25,
  };
  return limits[tier];
}

/**
 * Get discount percentage for tier (premium feature)
 */
export function getTierDiscount(tier: ReputationTier): number {
  const discounts: Record<ReputationTier, number> = {
    bronze: 0,
    silver: 0,
    gold: 5,
    platinum: 10,
    diamond: 15,
  };
  return discounts[tier];
}
