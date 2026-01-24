/**
 * General Utility Functions for StackSUSU
 * 
 * Common helper functions for formatting, validation, and conversions.
 * 
 * @module utils/helpers
 */

// ============================================================================
// Address Formatting
// ============================================================================

/**
 * Truncate a Stacks address for display
 * @param address - Full Stacks address
 * @param chars - Number of characters to show on each end
 * @returns Truncated address (e.g., "SP2J6Z...4G5R")
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

// ============================================================================
// STX Amount Formatting
// ============================================================================

/**
 * Format STX amount for display with unit suffix
 * @param amount - Amount in STX
 * @param decimals - Decimal places for small amounts
 * @returns Formatted string (e.g., "1.23M STX", "456.78K STX")
 */
export function formatSTX(amount: number, decimals: number = 6): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(2)}M STX`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(2)}K STX`;
  }
  return `${amount.toFixed(decimals)} STX`;
}

/**
 * Format STX with compact notation (no suffix)
 * @param amount - Amount in STX
 * @returns Compact string (e.g., "1.2M", "456.7K")
 */
export function formatSTXCompact(amount: number): string {
  if (amount >= 1_000_000) {
    return `${(amount / 1_000_000).toFixed(1)}M`;
  }
  if (amount >= 1_000) {
    return `${(amount / 1_000).toFixed(1)}K`;
  }
  return amount.toFixed(2);
}

// ============================================================================
// STX Unit Conversions
// ============================================================================

/** microSTX per STX (1 STX = 1,000,000 microSTX) */
const MICRO_STX_PER_STX = 1_000_000;

/**
 * Convert microSTX to STX
 * @param microSTX - Amount in microSTX
 */
export function microSTXToSTX(microSTX: number): number {
  return microSTX / MICRO_STX_PER_STX;
}

/**
 * Convert STX to microSTX
 * @param stx - Amount in STX
 */
export function stxToMicroSTX(stx: number): number {
  return Math.floor(stx * MICRO_STX_PER_STX);
}

// ============================================================================
// Date Formatting (Legacy - prefer utils/date.ts)
// ============================================================================

/**
 * Format date for display
 * @deprecated Use formatDate from utils/date instead
 */
export function formatDate(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });
}

/**
 * Format date with time
 */
export function formatDateTime(date: Date | string | number): string {
  const d = new Date(date);
  return d.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

/**
 * Format relative time (e.g., "2 hours ago")
 */
export function formatRelativeTime(date: Date | string | number): string {
  const d = new Date(date);
  const now = new Date();
  const diffMs = now.getTime() - d.getTime();
  const diffSecs = Math.floor(diffMs / 1000);
  const diffMins = Math.floor(diffSecs / 60);
  const diffHours = Math.floor(diffMins / 60);
  const diffDays = Math.floor(diffHours / 24);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins}m ago`;
  if (diffHours < 24) return `${diffHours}h ago`;
  if (diffDays < 7) return `${diffDays}d ago`;
  return formatDate(d);
}

// ============================================================================
// Block Time Conversions
// ============================================================================

/** Average Stacks block time in minutes */
const BLOCK_TIME_MINUTES = 10;

/** Approximate blocks per day */
const BLOCKS_PER_DAY = 144;

/**
 * Calculate blocks to time estimate
 * ~10 minutes per block on Stacks
 * @param blocks - Number of blocks
 * @returns Human-readable time estimate
 */
export function blocksToTime(blocks: number): string {
  const minutes = blocks * BLOCK_TIME_MINUTES;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `~${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `~${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `~${minutes} min`;
}

/**
 * Calculate days to blocks
 * @param days - Number of days
 * @returns Approximate block count
 */
export function timeToBlocks(days: number): number {
  return Math.ceil(days * BLOCKS_PER_DAY);
}

/**
 * Format block height with thousands separators
 * @param height - Block height number
 */
export function formatBlockHeight(height: number): string {
  return height.toLocaleString();
}

// ============================================================================
// Validation Functions
// ============================================================================

/** Stacks address pattern (SP for mainnet, ST for testnet) */
const STACKS_ADDRESS_PATTERN = /^(SP|ST)[0-9A-HJ-NP-Z]{38,40}$/;

/** Circle name constraints */
const CIRCLE_NAME_MIN_LENGTH = 3;
const CIRCLE_NAME_MAX_LENGTH = 50;

/**
 * Validate Stacks address format
 * @param address - Address to validate
 */
export function isValidStacksAddress(address: string): boolean {
  if (!address) return false;
  return STACKS_ADDRESS_PATTERN.test(address);
}

/**
 * Validate circle name
 * @param name - Circle name to validate
 */
export function isValidCircleName(name: string): boolean {
  if (!name) return false;
  return name.length >= CIRCLE_NAME_MIN_LENGTH && name.length <= CIRCLE_NAME_MAX_LENGTH;
}

// ============================================================================
// Color Generation
// ============================================================================

/** Default fallback color */
const DEFAULT_COLOR = '#6366f1';

/**
 * Generate a deterministic color from address
 * @param address - Stacks address
 * @returns HSL color string
 */
export function addressToColor(address: string): string {
  if (!address) return DEFAULT_COLOR;
  
  let hash = 0;
  for (let i = 0; i < address.length; i++) {
    hash = address.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const hue = Math.abs(hash % 360);
  return `hsl(${hue}, 70%, 50%)`;
}

/**
 * Generate initials from address
 */
export function addressToInitials(address: string): string {
  if (!address) return '??';
  return address.slice(0, 2).toUpperCase();
}

/**
 * Copy text to clipboard
 */
export async function copyToClipboard(text: string): Promise<boolean> {
  try {
    await navigator.clipboard.writeText(text);
    return true;
  } catch {
    // Fallback for older browsers
    const textarea = document.createElement('textarea');
    textarea.value = text;
    document.body.appendChild(textarea);
    textarea.select();
    try {
      document.execCommand('copy');
      return true;
    } catch {
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

/**
 * Sleep utility
 */
export function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Debounce function
 */
export function debounce<T extends (...args: any[]) => any>(
  fn: T,
  delay: number
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout>;
  return (...args: Parameters<T>) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => fn(...args), delay);
  };
}

/**
 * Throttle function
 */
export function throttle<T extends (...args: any[]) => any>(
  fn: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false;
  return (...args: Parameters<T>) => {
    if (!inThrottle) {
      fn(...args);
      inThrottle = true;
      setTimeout(() => (inThrottle = false), limit);
    }
  };
}

/**
 * Calculate percentage
 */
export function calculatePercentage(value: number, total: number): number {
  if (total === 0) return 0;
  return Math.round((value / total) * 100);
}

/**
 * Clamp number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Generate unique ID
 */
export function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

/**
 * Check if running in browser
 */
export function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

/**
 * Get query parameter from URL
 */
export function getQueryParam(name: string): string | null {
  if (!isBrowser()) return null;
  const params = new URLSearchParams(window.location.search);
  return params.get(name);
}

/**
 * Pluralize word
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  const pluralForm = plural || `${singular}s`;
  return count === 1 ? singular : pluralForm;
}
