/**
 * Number and currency formatting utilities
 * 
 * @module utils/numbers
 */

/** Microstacks to STX conversion factor */
const MICROSTX_FACTOR = 1_000_000;

/**
 * Format number with commas (e.g., 1,234,567)
 */
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

/**
 * Format STX amount (e.g., "1,234.56 STX")
 */
export function formatStx(amount: number, decimals: number = 2): string {
  return `${formatNumber(amount, decimals)} STX`;
}

/**
 * Format STX amount with microstacks conversion
 */
export function formatMicroStx(microStx: number, decimals: number = 6): string {
  const stx = microStx / MICROSTX_FACTOR;
  return formatStx(stx, decimals);
}

/**
 * Convert microSTX to STX
 */
export function microToStx(microStx: number): number {
  return microStx / MICROSTX_FACTOR;
}

/**
 * Convert STX to microSTX
 */
export function stxToMicro(stx: number): number {
  return stx * MICROSTX_FACTOR;
}

/**
 * Format as compact number (e.g., 1.2K, 3.4M)
 */
export function formatCompact(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

/**
 * Format as percentage
 * @param value - Percentage value (0-100)
 * @param decimals - Decimal places
 */
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// ============================================================================
// Currency Formatting
// ============================================================================

/**
 * Format as currency (USD)
 * @param amount - Dollar amount
 */
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

/**
 * Convert STX to USD (requires price)
 * @param stxAmount - Amount in STX
 * @param stxPrice - Current STX price in USD
 */
export function stxToUsd(stxAmount: number, stxPrice: number): string {
  return formatUsd(stxAmount * stxPrice);
}

// ============================================================================
// File Size Formatting
// ============================================================================

/** File size units */
const SIZE_UNITS = ['Bytes', 'KB', 'MB', 'GB', 'TB'] as const;

/** Bytes per kilobyte */
const BYTES_PER_KB = 1024;

/**
 * Format file size (bytes to KB, MB, GB)
 * @param bytes - Size in bytes
 */
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const i = Math.floor(Math.log(bytes) / Math.log(BYTES_PER_KB));
  const size = parseFloat((bytes / Math.pow(BYTES_PER_KB, i)).toFixed(2));
  
  return `${size} ${SIZE_UNITS[i]}`;
}

// ============================================================================
// Number Utilities
// ============================================================================

/**
 * Parse number from formatted string
 * @param str - Formatted number string
 */
export function parseFormattedNumber(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, ''));
}

/**
 * Clamp number within range
 * @param value - Value to clamp
 * @param min - Minimum value
 * @param max - Maximum value
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round to specific decimal places
 * @param value - Value to round
 * @param decimals - Number of decimal places
 */
export function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

/**
 * Calculate percentage
 * @param value - Part value
 * @param total - Total value
 * @returns Percentage (0-100)
 */
export function calculatePercent(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}
