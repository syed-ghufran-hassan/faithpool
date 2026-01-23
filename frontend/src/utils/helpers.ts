// Utility functions for StackSUSU

/**
 * Truncate a Stacks address for display
 */
export function truncateAddress(address: string, chars: number = 4): string {
  if (!address) return '';
  if (address.length <= chars * 2 + 3) return address;
  return `${address.slice(0, chars + 2)}...${address.slice(-chars)}`;
}

/**
 * Format STX amount for display
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
 * Format STX with compact notation
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

/**
 * Convert microSTX to STX
 */
export function microSTXToSTX(microSTX: number): number {
  return microSTX / 1_000_000;
}

/**
 * Convert STX to microSTX
 */
export function stxToMicroSTX(stx: number): number {
  return Math.floor(stx * 1_000_000);
}

/**
 * Format date for display
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

/**
 * Calculate blocks to time estimate
 * ~10 minutes per block on Stacks
 */
export function blocksToTime(blocks: number): string {
  const minutes = blocks * 10;
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
 * Calculate time to blocks
 */
export function timeToBlocks(days: number): number {
  return Math.ceil(days * 144); // ~144 blocks per day
}

/**
 * Format block height
 */
export function formatBlockHeight(height: number): string {
  return height.toLocaleString();
}

/**
 * Validate Stacks address
 */
export function isValidStacksAddress(address: string): boolean {
  if (!address) return false;
  // Mainnet addresses start with SP, testnet with ST
  const pattern = /^(SP|ST)[0-9A-HJ-NP-Z]{38,40}$/;
  return pattern.test(address);
}

/**
 * Validate circle name
 */
export function isValidCircleName(name: string): boolean {
  if (!name) return false;
  // 3-50 characters, alphanumeric and spaces
  return name.length >= 3 && name.length <= 50;
}

/**
 * Generate a random color from address
 */
export function addressToColor(address: string): string {
  if (!address) return '#6366f1';
  
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
