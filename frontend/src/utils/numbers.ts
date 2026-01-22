/**
 * Number and currency formatting utilities
 */

// Format number with commas (e.g., 1,234,567)
export function formatNumber(num: number, decimals: number = 0): string {
  return new Intl.NumberFormat('en-US', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(num);
}

// Format STX amount (e.g., "1,234.56 STX")
export function formatStx(amount: number, decimals: number = 2): string {
  return `${formatNumber(amount, decimals)} STX`;
}

// Format STX amount with microstacks conversion
export function formatMicroStx(microStx: number, decimals: number = 6): string {
  const stx = microStx / 1_000_000;
  return formatStx(stx, decimals);
}

// Format as compact number (e.g., 1.2K, 3.4M)
export function formatCompact(num: number): string {
  return new Intl.NumberFormat('en-US', {
    notation: 'compact',
    compactDisplay: 'short',
  }).format(num);
}

// Format as percentage
export function formatPercent(value: number, decimals: number = 1): string {
  return new Intl.NumberFormat('en-US', {
    style: 'percent',
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  }).format(value / 100);
}

// Format as currency (USD)
export function formatUsd(amount: number): string {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

// Convert STX to USD (requires price)
export function stxToUsd(stxAmount: number, stxPrice: number): string {
  return formatUsd(stxAmount * stxPrice);
}

// Format file size (bytes to KB, MB, GB)
export function formatFileSize(bytes: number): string {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
}

// Parse number from formatted string
export function parseFormattedNumber(str: string): number {
  return parseFloat(str.replace(/[^0-9.-]/g, ''));
}

// Clamp number within range
export function clamp(value: number, min: number, max: number): number {
  return Math.min(Math.max(value, min), max);
}

// Round to specific decimal places
export function roundTo(value: number, decimals: number): number {
  const multiplier = Math.pow(10, decimals);
  return Math.round(value * multiplier) / multiplier;
}

// Calculate percentage
export function calculatePercent(value: number, total: number): number {
  if (total === 0) return 0;
  return (value / total) * 100;
}
