/**
 * Emergency Withdrawal Type Definitions
 * Emergency exit system with cooldowns and penalties
 */

export interface EmergencyRequest {
  circleId: number;
  member: string;
  requestedAt: number; // block height
  processed: boolean;
  processedAt?: number; // block height
  amount: number; // microSTX withdrawn
  penaltyPaid: number; // microSTX penalty
}

export interface EmergencyStats {
  circleId: number;
  totalEmergencyExits: number;
  maxAllowed: number;
  remainingSlots: number;
  totalPenaltiesCollected: number;
}

// Constants
export const EMERGENCY_COOLDOWN_BLOCKS = 1008; // ~7 days
export const EMERGENCY_PENALTY_BPS = 1000; // 10% penalty
export const MAX_EMERGENCY_PERCENT = 30; // Max 30% of members can emergency exit

/**
 * Check if member is on cooldown
 */
export function isOnCooldown(lastEmergencyBlock: number, currentBlock: number): boolean {
  return currentBlock - lastEmergencyBlock < EMERGENCY_COOLDOWN_BLOCKS;
}

/**
 * Get blocks remaining in cooldown
 */
export function getCooldownRemaining(lastEmergencyBlock: number, currentBlock: number): number {
  const remaining = EMERGENCY_COOLDOWN_BLOCKS - (currentBlock - lastEmergencyBlock);
  return Math.max(0, remaining);
}

/**
 * Format cooldown time for display
 */
export function formatCooldown(blocks: number): string {
  if (blocks <= 0) return 'Ready';
  
  const minutes = blocks * 10;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;

  if (days > 0) {
    return remainingHours > 0 ? `${days}d ${remainingHours}h` : `${days}d`;
  }
  return `${hours}h`;
}

/**
 * Calculate penalty amount
 */
export function calculatePenalty(amountMicroSTX: number): number {
  return Math.floor((amountMicroSTX * EMERGENCY_PENALTY_BPS) / 10000);
}

/**
 * Calculate net withdrawal after penalty
 */
export function calculateNetWithdrawal(amountMicroSTX: number): number {
  return amountMicroSTX - calculatePenalty(amountMicroSTX);
}

/**
 * Calculate max emergency exits allowed for a circle
 */
export function calculateMaxEmergencyExits(memberCount: number): number {
  return Math.floor((memberCount * MAX_EMERGENCY_PERCENT) / 100);
}

/**
 * Check if circle can accept more emergency exits
 */
export function canAcceptEmergencyExit(
  currentExits: number,
  memberCount: number
): boolean {
  return currentExits < calculateMaxEmergencyExits(memberCount);
}

/**
 * Get emergency availability status
 */
export function getEmergencyStatus(
  stats: EmergencyStats
): 'available' | 'limited' | 'unavailable' {
  if (stats.remainingSlots === 0) return 'unavailable';
  if (stats.remainingSlots <= 1) return 'limited';
  return 'available';
}

/**
 * Get status color
 */
export function getEmergencyStatusColor(
  status: 'available' | 'limited' | 'unavailable'
): string {
  const colors = {
    available: '#22c55e', // green
    limited: '#f97316', // orange
    unavailable: '#ef4444', // red
  };
  return colors[status];
}

/**
 * Format emergency exit warning message
 */
export function getEmergencyWarning(penaltyMicroSTX: number): string {
  const penaltySTX = penaltyMicroSTX / 1000000;
  return `Warning: Emergency withdrawal includes a ${EMERGENCY_PENALTY_BPS / 100}% penalty (${penaltySTX.toFixed(6)} STX). This action cannot be undone.`;
}
