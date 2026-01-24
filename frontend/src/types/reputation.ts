/**
 * Reputation Type Definitions
 * Member trust and reliability tracking
 */

export interface MemberReputation {
  circlesCompleted: number;
  circlesDefaulted: number;
  onTimePayments: number;
  latePayments: number;
  totalVolume: number; // in microSTX
  totalPayoutsReceived: number;
  score: number;
  lastActivity: number; // block height
  joinedAt: number; // block height
}

// Reputation constants
export const BASE_SCORE = 500;
export const MAX_SCORE = 1000;
export const MIN_SCORE = 0;

// Score impact values
export const SCORE_IMPACTS = {
  CIRCLE_COMPLETED: 25,
  CIRCLE_DEFAULTED: -100,
  ON_TIME_PAYMENT: 5,
  LATE_PAYMENT: -15,
  EMERGENCY_EXIT: -50,
  REFERRAL_BONUS: 10,
} as const;

/**
 * Get reputation level label
 */
export function getReputationLevel(score: number): string {
  if (score >= 900) return 'Excellent';
  if (score >= 750) return 'Very Good';
  if (score >= 600) return 'Good';
  if (score >= 450) return 'Average';
  if (score >= 300) return 'Below Average';
  if (score >= 150) return 'Poor';
  return 'Very Poor';
}

/**
 * Get reputation badge color
 */
export function getReputationColor(score: number): string {
  if (score >= 900) return '#10b981'; // emerald
  if (score >= 750) return '#22c55e'; // green
  if (score >= 600) return '#84cc16'; // lime
  if (score >= 450) return '#eab308'; // yellow
  if (score >= 300) return '#f97316'; // orange
  if (score >= 150) return '#ef4444'; // red
  return '#991b1b'; // dark red
}

/**
 * Calculate reputation percentage for progress bars
 */
export function getReputationPercent(score: number): number {
  return Math.min(100, Math.max(0, (score / MAX_SCORE) * 100));
}

/**
 * Check if score meets minimum requirement
 */
export function meetsReputationRequirement(score: number, minRequired: number): boolean {
  return score >= minRequired;
}

/**
 * Calculate trust factor (0.0 - 1.0) for risk assessment
 */
export function calculateTrustFactor(reputation: MemberReputation): number {
  const totalCircles = reputation.circlesCompleted + reputation.circlesDefaulted;
  if (totalCircles === 0) return 0.5; // New member, neutral trust
  
  const completionRate = reputation.circlesCompleted / totalCircles;
  const totalPayments = reputation.onTimePayments + reputation.latePayments;
  const onTimeRate = totalPayments > 0 ? reputation.onTimePayments / totalPayments : 0.5;
  
  // Weighted average: 60% completion rate, 40% on-time rate
  return completionRate * 0.6 + onTimeRate * 0.4;
}

/**
 * Format reputation for display
 */
export function formatReputation(score: number): string {
  return `${score} / ${MAX_SCORE}`;
}
