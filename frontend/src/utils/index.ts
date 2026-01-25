/**
 * Utility Functions
 * 
 * Centralized utilities for the StackSUSU application.
 * 
 * @module utils
 * 
 * Modular exports:
 * - date: Date/time formatting
 * - numbers: Number/currency formatting  
 * - strings: String manipulation
 * - validation: Form validation rules
 * - transaction: Blockchain transaction utilities
 * - format: Formatting helpers
 * 
 * @example
 * ```typescript
 * import { truncateAddress, formatStx, formatDate } from '@/utils';
 * import { getTransactionStatus, waitForTransaction } from '@/utils';
 * ```
 */

// ============================================================================
// Module Re-exports
// ============================================================================

export * from './date';
export * from './numbers';
export * from './strings';
export * from './transaction';
export * from './format';

// ============================================================================
// Address Utilities
// ============================================================================

/**
 * Truncate a Stacks address for display
 * @param address Full Stacks address
 * @param startChars Characters to show at start
 * @param endChars Characters to show at end
 */
export function truncateAddress(
  address: string,
  startChars: number = 6,
  endChars: number = 4
): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

// ============================================================================
// STX Formatting
// ============================================================================

/** MicroSTX per STX conversion factor */
const MICRO_STX_FACTOR = 1_000_000;

/**
 * Format STX amount with proper decimals
 * @param microStx Amount in microSTX
 * @param decimals Number of decimal places
 */
export function formatStx(microStx: number, decimals: number = 2): string {
  const stx = microStx / MICRO_STX_FACTOR;
  return stx.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Parse STX to microSTX
 * @param stx Amount in STX
 */
export function parseStxToMicro(stx: number): number {
  return Math.floor(stx * MICRO_STX_FACTOR);
}

// ============================================================================
// Date Formatting (Legacy - prefer utils/date.ts)
// ============================================================================

/**
 * Format a date string for display
 * @deprecated Use formatDate from utils/date instead
 * @param dateString ISO date string or timestamp
 */
export function formatDate(dateString: string | number): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 * @param dateString ISO date string or timestamp
 */
export function formatRelativeTime(dateString: string | number): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSeconds = Math.floor(diffMs / 1000);
  const diffMinutes = Math.floor(diffSeconds / 60);
  const diffHours = Math.floor(diffMinutes / 60);
  const diffDays = Math.floor(diffHours / 24);
  const diffWeeks = Math.floor(diffDays / 7);
  const diffMonths = Math.floor(diffDays / 30);

  if (diffSeconds < 60) return 'just now';
  if (diffMinutes < 60) return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
}

/**
 * Convert frequency string to seconds
 * @param frequency Frequency type
 */
export function frequencyToSeconds(frequency: 'weekly' | 'biweekly' | 'monthly'): number {
  switch (frequency) {
    case 'weekly':
      return 7 * 24 * 60 * 60; // 604800
    case 'biweekly':
      return 14 * 24 * 60 * 60; // 1209600
    case 'monthly':
      return 30 * 24 * 60 * 60; // 2592000
    default:
      return 7 * 24 * 60 * 60;
  }
}

/**
 * Convert seconds to frequency string
 * @param seconds Time in seconds
 */
export function secondsToFrequency(seconds: number): 'weekly' | 'biweekly' | 'monthly' {
  if (seconds <= 604800) return 'weekly';
  if (seconds <= 1209600) return 'biweekly';
  return 'monthly';
}

/**
 * Calculate time until next payout
 * @param lastPayoutTime Timestamp of last payout
 * @param frequencySeconds Frequency in seconds
 */
export function timeUntilNextPayout(lastPayoutTime: number, frequencySeconds: number): string {
  const now = Date.now();
  const nextPayout = lastPayoutTime + frequencySeconds * 1000;
  const diffMs = nextPayout - now;
  
  if (diffMs <= 0) return 'Now';
  
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
  const diffDays = Math.floor(diffHours / 24);
  
  if (diffDays > 0) return `${diffDays} day${diffDays > 1 ? 's' : ''}`;
  if (diffHours > 0) return `${diffHours} hour${diffHours > 1 ? 's' : ''}`;
  
  const diffMinutes = Math.floor(diffMs / (1000 * 60));
  return `${diffMinutes} minute${diffMinutes > 1 ? 's' : ''}`;
}

/**
 * Generate a random color based on a string
 * @param str Input string
 */
export function stringToColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const h = hash % 360;
  return `hsl(${h}, 70%, 60%)`;
}

/**
 * Calculate progress percentage
 * @param current Current value
 * @param total Total value
 */
export function calculateProgress(current: number, total: number): number {
  if (total === 0) return 0;
  return Math.min(Math.round((current / total) * 100), 100);
}

/**
 * Validate Stacks address format
 * @param address Address to validate
 */
export function isValidStacksAddress(address: string): boolean {
  // Basic validation for Stacks addresses
  // Mainnet addresses start with SP, testnet with ST
  const pattern = /^(SP|ST)[A-Z0-9]{38,40}$/;
  return pattern.test(address);
}

/**
 * Get status color based on circle status
 * @param status Circle status
 */
export function getStatusColor(status: string): string {
  switch (status.toLowerCase()) {
    case 'active':
      return '#10b981';
    case 'forming':
      return '#f59e0b';
    case 'completed':
      return '#6b7280';
    case 'cancelled':
      return '#ef4444';
    default:
      return '#6b7280';
  }
}

/**
 * Copy text to clipboard
 * @param text Text to copy
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch (err) {
    console.error('Failed to copy:', err);
    return false;
  }
}
