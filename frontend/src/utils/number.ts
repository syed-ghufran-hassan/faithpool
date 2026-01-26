/**
 * Number Utility Functions
 * 
 * Comprehensive number formatting and manipulation utilities for financial applications.
 */

/**
 * Format a number with commas as thousand separators
 */
export function formatNumber(value: number, decimals: number = 0): string {
  return value.toLocaleString('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

/**
 * Format a number as currency
 */
export function formatCurrency(
  value: number,
  currency: string = 'USD',
  locale: string = 'en-US'
): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value);
}

/**
 * Format STX amount (convert from microSTX)
 */
export function formatSTX(microSTX: number | bigint, decimals: number = 6): string {
  const stx = Number(microSTX) / 1_000_000;
  return `${formatNumber(stx, decimals)} STX`;
}

/**
 * Convert STX to microSTX
 */
export function stxToMicroSTX(stx: number): bigint {
  return BigInt(Math.floor(stx * 1_000_000));
}

/**
 * Convert microSTX to STX
 */
export function microSTXToSTX(microSTX: number | bigint): number {
  return Number(microSTX) / 1_000_000;
}

/**
 * Format a percentage
 */
export function formatPercent(value: number, decimals: number = 2): string {
  return `${(value * 100).toFixed(decimals)}%`;
}

/**
 * Format a number in compact notation (e.g., 1.2K, 3.4M)
 */
export function formatCompact(value: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(value);
}

/**
 * Clamp a number between min and max
 */
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

/**
 * Round a number to a specific number of decimal places
 */
export function round(value: number, decimals: number = 0): number {
  const factor = Math.pow(10, decimals);
  return Math.round(value * factor) / factor;
}

/**
 * Calculate percentage of a value
 */
export function percentage(value: number, percent: number): number {
  return (value * percent) / 100;
}

/**
 * Calculate what percentage one number is of another
 */
export function getPercentage(part: number, whole: number): number {
  if (whole === 0) return 0;
  return (part / whole) * 100;
}

/**
 * Check if a value is a valid number
 */
export function isValidNumber(value: unknown): value is number {
  return typeof value === 'number' && !isNaN(value) && isFinite(value);
}

/**
 * Parse a number from string, handling commas and currency symbols
 */
export function parseNumber(value: string): number | null {
  // Remove currency symbols, commas, spaces
  const cleaned = value.replace(/[$,\s]/g, '').trim();
  const parsed = parseFloat(cleaned);
  return isNaN(parsed) ? null : parsed;
}

/**
 * Format bytes to human readable size
 */
export function formatBytes(bytes: number, decimals: number = 2): string {
  if (bytes === 0) return '0 Bytes';

  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(decimals))} ${sizes[i]}`;
}

/**
 * Generate a random integer between min and max (inclusive)
 */
export function randomInt(min: number, max: number): number {
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

/**
 * Calculate the sum of an array of numbers
 */
export function sum(numbers: number[]): number {
  return numbers.reduce((acc, n) => acc + n, 0);
}

/**
 * Calculate the average of an array of numbers
 */
export function average(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  return sum(numbers) / numbers.length;
}

/**
 * Calculate the median of an array of numbers
 */
export function median(numbers: number[]): number {
  if (numbers.length === 0) return 0;
  const sorted = [...numbers].sort((a, b) => a - b);
  const mid = Math.floor(sorted.length / 2);
  return sorted.length % 2 !== 0
    ? sorted[mid]
    : (sorted[mid - 1] + sorted[mid]) / 2;
}

/**
 * Find the minimum value in an array
 */
export function min(numbers: number[]): number {
  return Math.min(...numbers);
}

/**
 * Find the maximum value in an array
 */
export function max(numbers: number[]): number {
  return Math.max(...numbers);
}

/**
 * Linear interpolation between two values
 */
export function lerp(start: number, end: number, t: number): number {
  return start + (end - start) * t;
}

/**
 * Map a value from one range to another
 */
export function mapRange(
  value: number,
  inMin: number,
  inMax: number,
  outMin: number,
  outMax: number
): number {
  return ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;
}

/**
 * Format ordinal number (1st, 2nd, 3rd, etc.)
 */
export function formatOrdinal(n: number): string {
  const s = ['th', 'st', 'nd', 'rd'];
  const v = n % 100;
  return n + (s[(v - 20) % 10] || s[v] || s[0]);
}

/**
 * Calculate compound interest
 */
export function compoundInterest(
  principal: number,
  rate: number,
  periods: number,
  compoundsPerPeriod: number = 1
): number {
  return principal * Math.pow(1 + rate / compoundsPerPeriod, compoundsPerPeriod * periods);
}

/**
 * Format a number as a block height
 */
export function formatBlockHeight(height: number): string {
  return `#${formatNumber(height, 0)}`;
}

/**
 * Calculate the fee for a transaction
 */
export function calculateFee(amount: number, feePercent: number, minFee: number = 0): number {
  const fee = amount * (feePercent / 100);
  return Math.max(fee, minFee);
}

export default {
  formatNumber,
  formatCurrency,
  formatSTX,
  stxToMicroSTX,
  microSTXToSTX,
  formatPercent,
  formatCompact,
  clamp,
  round,
  percentage,
  getPercentage,
  isValidNumber,
  parseNumber,
  formatBytes,
  randomInt,
  sum,
  average,
  median,
  min,
  max,
  lerp,
  mapRange,
  formatOrdinal,
  compoundInterest,
  formatBlockHeight,
  calculateFee,
};
