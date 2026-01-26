/**
 * Circle Utilities
 * 
 * Helper functions for circle calculations and formatting.
 */

import { Circle, CircleMember, CircleRound, CircleStatus, MemberStatus } from '../types/core';
import { microStxToStx, formatMicroStx } from './stx';

// ===== Status Utilities =====

/**
 * Get human-readable status label
 */
export function getStatusLabel(status: CircleStatus): string {
  const labels: Record<CircleStatus, string> = {
    pending: 'Waiting for members',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
  };
  return labels[status];
}

/**
 * Get status color for UI
 */
export function getStatusColor(status: CircleStatus): string {
  const colors: Record<CircleStatus, string> = {
    pending: 'yellow',
    active: 'green',
    completed: 'blue',
    cancelled: 'red',
  };
  return colors[status];
}

/**
 * Get member status label
 */
export function getMemberStatusLabel(status: MemberStatus): string {
  const labels: Record<MemberStatus, string> = {
    active: 'Active',
    defaulted: 'Defaulted',
    completed: 'Completed',
  };
  return labels[status];
}

// ===== Progress Calculations =====

/**
 * Calculate circle fill progress (members joined / max)
 */
export function calculateFillProgress(circle: Circle): number {
  if (circle.maxMembers === 0) return 0;
  return (circle.totalMembers / circle.maxMembers) * 100;
}

/**
 * Calculate round progress (current / total)
 */
export function calculateRoundProgress(circle: Circle): number {
  if (circle.maxMembers === 0) return 0;
  return (circle.currentRound / circle.maxMembers) * 100;
}

/**
 * Get remaining spots in circle
 */
export function getRemainingSpots(circle: Circle): number {
  return Math.max(0, circle.maxMembers - circle.totalMembers);
}

/**
 * Check if circle is full
 */
export function isCircleFull(circle: Circle): boolean {
  return circle.totalMembers >= circle.maxMembers;
}

/**
 * Check if circle can be started
 */
export function canStartCircle(circle: Circle): boolean {
  return circle.status === 'pending' && circle.totalMembers >= 3;
}

// ===== Financial Calculations =====

/**
 * Calculate total pool size for a circle
 */
export function calculatePoolSize(circle: Circle): number {
  return circle.contributionAmount * circle.maxMembers;
}

/**
 * Calculate payout amount per round
 */
export function calculatePayoutAmount(circle: Circle): number {
  return circle.contributionAmount * (circle.maxMembers - 1);
}

/**
 * Calculate total contributed by a member
 */
export function calculateMemberContributed(member: CircleMember): number {
  return member.contributions.reduce((sum, c) => sum + c, 0);
}

/**
 * Calculate remaining contributions for a member
 */
export function calculateRemainingContributions(
  circle: Circle,
  member: CircleMember
): number {
  const totalRounds = circle.maxMembers;
  const contributedRounds = member.contributions.length;
  return (totalRounds - contributedRounds) * circle.contributionAmount;
}

/**
 * Calculate ROI for a member based on their position
 */
export function calculateMemberROI(
  circle: Circle,
  position: number
): number {
  // Early positions (1, 2) get money early - positive time value
  // Later positions wait longer but get interest from defaulters
  const middlePosition = (circle.maxMembers + 1) / 2;
  const positionDiff = middlePosition - position;
  
  // Simple ROI based on position advantage
  return positionDiff * (100 / circle.maxMembers);
}

// ===== Formatting =====

/**
 * Format circle summary
 */
export function formatCircleSummary(circle: Circle): string {
  const stx = microStxToStx(circle.contributionAmount);
  return `${circle.name} - ${stx} STX × ${circle.maxMembers} members`;
}

/**
 * Format contribution amount
 */
export function formatContribution(amount: number): string {
  return formatMicroStx(amount);
}

/**
 * Format round info
 */
export function formatRoundInfo(circle: Circle): string {
  return `Round ${circle.currentRound} of ${circle.maxMembers}`;
}

/**
 * Format members info
 */
export function formatMembersInfo(circle: Circle): string {
  return `${circle.totalMembers}/${circle.maxMembers} members`;
}

// ===== Round Utilities =====

/**
 * Get current round recipient
 */
export function getCurrentRecipient(
  circle: Circle,
  members: CircleMember[]
): CircleMember | undefined {
  return members.find(m => m.position === circle.currentRound);
}

/**
 * Get next recipient
 */
export function getNextRecipient(
  circle: Circle,
  members: CircleMember[]
): CircleMember | undefined {
  return members.find(m => m.position === circle.currentRound + 1);
}

/**
 * Check if member has contributed this round
 */
export function hasContributedThisRound(
  member: CircleMember,
  currentRound: number
): boolean {
  return member.contributions.length >= currentRound;
}

/**
 * Get members who haven't contributed this round
 */
export function getPendingContributors(
  members: CircleMember[],
  currentRound: number
): CircleMember[] {
  return members.filter(m => 
    m.status === 'active' && 
    !hasContributedThisRound(m, currentRound)
  );
}

// ===== Sorting =====

/**
 * Sort members by position
 */
export function sortMembersByPosition(members: CircleMember[]): CircleMember[] {
  return [...members].sort((a, b) => a.position - b.position);
}

/**
 * Sort members by contribution amount
 */
export function sortMembersByContribution(members: CircleMember[]): CircleMember[] {
  return [...members].sort((a, b) => 
    calculateMemberContributed(b) - calculateMemberContributed(a)
  );
}

// ===== Validation =====

/**
 * Validate circle name
 */
export function isValidCircleName(name: string): boolean {
  const trimmed = name.trim();
  return trimmed.length >= 3 && trimmed.length <= 50;
}

/**
 * Validate contribution amount
 */
export function isValidContribution(amountStx: number): boolean {
  return amountStx >= 10 && amountStx <= 10000;
}

/**
 * Validate member count
 */
export function isValidMemberCount(count: number): boolean {
  return count >= 3 && count <= 12;
}
