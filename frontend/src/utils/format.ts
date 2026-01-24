/**
 * Formatting Utilities
 * Helper functions for formatting STX amounts, addresses, and time
 */

const MICRO_STX = 1_000_000;

/**
 * Convert microSTX to STX
 */
export function microToSTX(microSTX: number): number {
  return microSTX / MICRO_STX;
}

/**
 * Convert STX to microSTX
 */
export function stxToMicro(stx: number): number {
  return Math.floor(stx * MICRO_STX);
}

/**
 * Format STX amount for display
 * @param microSTX Amount in microSTX
 * @param decimals Number of decimal places (default 6)
 * @param showUnit Whether to append 'STX' (default true)
 */
export function formatSTX(
  microSTX: number,
  decimals = 6,
  showUnit = true
): string {
  const stx = microToSTX(microSTX);
  const formatted = stx.toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: decimals,
  });
  return showUnit ? `${formatted} STX` : formatted;
}

/**
 * Format large STX amounts with K/M suffixes
 */
export function formatSTXCompact(microSTX: number): string {
  const stx = microToSTX(microSTX);
  if (stx >= 1_000_000) {
    return `${(stx / 1_000_000).toFixed(2)}M STX`;
  }
  if (stx >= 1_000) {
    return `${(stx / 1_000).toFixed(2)}K STX`;
  }
  return formatSTX(microSTX, 2);
}

/**
 * Format address for display (truncated)
 * @param address Full Stacks address
 * @param chars Number of characters to show on each end (default 4)
 */
export function formatAddress(address: string, chars = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format block height to approximate time
 * Assumes ~10 minutes per block
 */
export function blocksToTime(blocks: number): string {
  const minutes = blocks * 10;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days > 0) {
    return `${days} day${days > 1 ? 's' : ''}`;
  }
  if (hours > 0) {
    return `${hours} hour${hours > 1 ? 's' : ''}`;
  }
  return `${minutes} min`;
}

/**
 * Format blocks remaining to human-readable countdown
 */
export function blocksToCountdown(blocks: number): string {
  if (blocks <= 0) return 'Now';
  
  const minutes = blocks * 10;
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);
  const remainingHours = hours % 24;
  
  if (days > 0) {
    return remainingHours > 0 
      ? `${days}d ${remainingHours}h`
      : `${days}d`;
  }
  if (hours > 0) {
    const remainingMins = minutes % 60;
    return remainingMins > 0
      ? `${hours}h ${remainingMins}m`
      : `${hours}h`;
  }
  return `${minutes}m`;
}

/**
 * Format percentage
 */
export function formatPercent(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`;
}

/**
 * Format basis points to percentage
 */
export function bpsToPercent(bps: number): string {
  return formatPercent(bps / 100, 2);
}

/**
 * Format date from block height (approximate)
 * @param blockHeight Block height
 * @param currentBlock Current block height
 */
export function formatBlockDate(blockHeight: number, currentBlock: number): string {
  const blocksDiff = currentBlock - blockHeight;
  const minutesAgo = blocksDiff * 10;
  const date = new Date(Date.now() - minutesAgo * 60 * 1000);
  
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

/**
 * Format number with commas
 */
export function formatNumber(num: number): string {
  return num.toLocaleString('en-US');
}

/**
 * Pluralize a word based on count
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  return count === 1 ? singular : (plural || `${singular}s`);
}
