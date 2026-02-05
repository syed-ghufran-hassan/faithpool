/**
 * Emergency system utility functions for StackSUSU
 * Handles emergency pauses, withdrawals, and circuit breaker functionality
 */

import { BLOCK_TIMES } from '../constants/contracts';

export type EmergencyType = 'pause' | 'withdrawal' | 'circuit_breaker' | 'upgrade';
export type EmergencyStatus = 'active' | 'resolved' | 'expired';
export type EmergencySeverity = 'low' | 'medium' | 'high' | 'critical';

export interface EmergencyEvent {
  id: number;
  type: EmergencyType;
  severity: EmergencySeverity;
  initiator: string;
  reason: string;
  createdAt: number;
  expiresAt?: number;
  resolvedAt?: number;
  resolvedBy?: string;
  affectedCircles: number[];
}

export interface CircuitBreakerState {
  isPaused: boolean;
  pausedAt?: number;
  pauseDuration?: number;
  reason?: string;
  canResume: boolean;
}

/**
 * Check if emergency is currently active
 */
export function isEmergencyActive(
  event: EmergencyEvent,
  currentBlock: number
): boolean {
  if (event.resolvedAt) return false;
  if (event.expiresAt && currentBlock >= event.expiresAt) return false;
  return true;
}

/**
 * Get emergency status
 */
export function getEmergencyStatus(
  event: EmergencyEvent,
  currentBlock: number
): EmergencyStatus {
  if (event.resolvedAt) return 'resolved';
  if (event.expiresAt && currentBlock >= event.expiresAt) return 'expired';
  return 'active';
}

/**
 * Calculate time until emergency expires
 */
export function getEmergencyTimeRemaining(
  event: EmergencyEvent,
  currentBlock: number
): {
  blocks: number;
  seconds: number;
  formatted: string;
} {
  if (!event.expiresAt || event.resolvedAt) {
    return { blocks: 0, seconds: 0, formatted: 'N/A' };
  }
  
  const blocksRemaining = Math.max(0, event.expiresAt - currentBlock);
  const secondsRemaining = blocksRemaining * BLOCK_TIMES.AVG_BLOCK_TIME_SECONDS;
  
  const hours = Math.floor(secondsRemaining / 3600);
  const minutes = Math.floor((secondsRemaining % 3600) / 60);
  
  let formatted = '';
  if (blocksRemaining <= 0) formatted = 'Expired';
  else if (hours > 0) formatted = `${hours}h ${minutes}m`;
  else formatted = `${minutes}m`;
  
  return { blocks: blocksRemaining, seconds: secondsRemaining, formatted };
}

/**
 * Get severity color
 */
export function getSeverityColor(severity: EmergencySeverity): string {
  const colors: Record<EmergencySeverity, string> = {
    low: '#22c55e',
    medium: '#f59e0b',
    high: '#f97316',
    critical: '#ef4444',
  };
  return colors[severity];
}

/**
 * Get severity label
 */
export function getSeverityLabel(severity: EmergencySeverity): string {
  const labels: Record<EmergencySeverity, string> = {
    low: 'Low',
    medium: 'Medium',
    high: 'High',
    critical: 'Critical',
  };
  return labels[severity];
}

/**
 * Get emergency type label
 */
export function getEmergencyTypeLabel(type: EmergencyType): string {
  const labels: Record<EmergencyType, string> = {
    pause: 'System Pause',
    withdrawal: 'Emergency Withdrawal',
    circuit_breaker: 'Circuit Breaker',
    upgrade: 'Emergency Upgrade',
  };
  return labels[type];
}

/**
 * Get emergency type icon name
 */
export function getEmergencyTypeIcon(type: EmergencyType): string {
  const icons: Record<EmergencyType, string> = {
    pause: 'pause-circle',
    withdrawal: 'alert-triangle',
    circuit_breaker: 'zap-off',
    upgrade: 'shield-alert',
  };
  return icons[type];
}

/**
 * Check if user can initiate emergency action
 */
export function canInitiateEmergency(
  userAddress: string,
  adminAddresses: string[],
  userReputation: number,
  minReputation = 1000
): { canInitiate: boolean; reason?: string } {
  if (adminAddresses.includes(userAddress)) {
    return { canInitiate: true };
  }
  
  if (userReputation >= minReputation) {
    return { canInitiate: true };
  }
  
  return {
    canInitiate: false,
    reason: `Requires admin access or ${minReputation}+ reputation`,
  };
}

/**
 * Check if user can resolve emergency
 */
export function canResolveEmergency(
  event: EmergencyEvent,
  userAddress: string,
  adminAddresses: string[]
): { canResolve: boolean; reason?: string } {
  if (event.resolvedAt) {
    return { canResolve: false, reason: 'Already resolved' };
  }
  
  if (!adminAddresses.includes(userAddress)) {
    return { canResolve: false, reason: 'Only admins can resolve' };
  }
  
  return { canResolve: true };
}

/**
 * Sort emergency events by various criteria
 */
export function sortEmergencyEvents(
  events: EmergencyEvent[],
  sortBy: 'created' | 'severity' | 'expires' = 'created',
  direction: 'asc' | 'desc' = 'desc'
): EmergencyEvent[] {
  const severityOrder: Record<EmergencySeverity, number> = {
    low: 1,
    medium: 2,
    high: 3,
    critical: 4,
  };
  
  const sorted = [...events].sort((a, b) => {
    let comparison = 0;
    switch (sortBy) {
      case 'created':
        comparison = a.createdAt - b.createdAt;
        break;
      case 'severity':
        comparison = severityOrder[a.severity] - severityOrder[b.severity];
        break;
      case 'expires':
        comparison = (a.expiresAt || 0) - (b.expiresAt || 0);
        break;
    }
    return direction === 'asc' ? comparison : -comparison;
  });
  return sorted;
}

/**
 * Filter emergency events by status
 */
export function filterEmergencyByStatus(
  events: EmergencyEvent[],
  status: EmergencyStatus | 'all',
  currentBlock: number
): EmergencyEvent[] {
  if (status === 'all') return events;
  return events.filter(e => getEmergencyStatus(e, currentBlock) === status);
}

/**
 * Get circuit breaker state for a circle
 */
export function getCircuitBreakerState(
  events: EmergencyEvent[],
  circleId: number,
  currentBlock: number
): CircuitBreakerState {
  const activeEvents = events.filter(
    e => e.type === 'circuit_breaker' &&
         e.affectedCircles.includes(circleId) &&
         isEmergencyActive(e, currentBlock)
  );
  
  if (activeEvents.length === 0) {
    return { isPaused: false, canResume: true };
  }
  
  const latestEvent = activeEvents[0];
  const pauseDuration = latestEvent.expiresAt 
    ? (latestEvent.expiresAt - latestEvent.createdAt) * BLOCK_TIMES.AVG_BLOCK_TIME_SECONDS
    : undefined;
  
  return {
    isPaused: true,
    pausedAt: latestEvent.createdAt,
    pauseDuration,
    reason: latestEvent.reason,
    canResume: false,
  };
}

/**
 * Calculate emergency withdrawal amount (with penalty)
 */
export function calculateEmergencyWithdrawal(
  balance: number,
  penaltyPercentage = 5
): {
  withdrawAmount: number;
  penalty: number;
  netAmount: number;
} {
  const penalty = Math.floor(balance * (penaltyPercentage / 100));
  const netAmount = balance - penalty;
  
  return {
    withdrawAmount: balance,
    penalty,
    netAmount,
  };
}

/**
 * Get active emergency count for display
 */
export function getActiveEmergencyCount(
  events: EmergencyEvent[],
  currentBlock: number
): {
  total: number;
  critical: number;
  high: number;
} {
  const active = events.filter(e => isEmergencyActive(e, currentBlock));
  
  return {
    total: active.length,
    critical: active.filter(e => e.severity === 'critical').length,
    high: active.filter(e => e.severity === 'high').length,
  };
}
