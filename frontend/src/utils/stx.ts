/**
 * STX Utilities
 * 
 * Helper functions for STX and micro-STX conversions and formatting.
 */

// 1 STX = 1,000,000 micro-STX
const MICRO_STX_PER_STX = 1_000_000;

// ===== Conversion =====

/**
 * Convert STX to micro-STX
 */
export function stxToMicroStx(stx: number): number {
  return Math.round(stx * MICRO_STX_PER_STX);
}

/**
 * Convert micro-STX to STX
 */
export function microStxToStx(microStx: number): number {
  return microStx / MICRO_STX_PER_STX;
}

/**
 * Convert micro-STX to STX string with specified decimals
 */
export function microStxToStxString(microStx: number, decimals = 6): string {
  const stx = microStxToStx(microStx);
  return stx.toFixed(decimals);
}

// ===== Formatting =====

/**
 * Format STX amount with symbol
 */
export function formatStx(
  amount: number,
  options: {
    isMicroStx?: boolean;
    decimals?: number;
    showSymbol?: boolean;
    compact?: boolean;
  } = {}
): string {
  const {
    isMicroStx = false,
    decimals = 2,
    showSymbol = true,
    compact = false,
  } = options;

  const stx = isMicroStx ? microStxToStx(amount) : amount;
  
  let formatted: string;
  
  if (compact && stx >= 1000) {
    formatted = formatCompactNumber(stx);
  } else {
    formatted = stx.toLocaleString('en-US', {
      minimumFractionDigits: 0,
      maximumFractionDigits: decimals,
    });
  }

  return showSymbol ? `${formatted} STX` : formatted;
}

/**
 * Format micro-STX with symbol
 */
export function formatMicroStx(microStx: number, decimals = 2): string {
  return formatStx(microStx, { isMicroStx: true, decimals });
}

/**
 * Format large numbers compactly
 */
function formatCompactNumber(num: number): string {
  const suffixes = ['', 'K', 'M', 'B', 'T'];
  let tier = Math.floor(Math.log10(Math.abs(num)) / 3);
  
  if (tier === 0) return num.toString();
  
  tier = Math.min(tier, suffixes.length - 1);
  const suffix = suffixes[tier];
  const scaled = num / Math.pow(10, tier * 3);
  
  return scaled.toFixed(1).replace(/\.0$/, '') + suffix;
}

// ===== Validation =====

/**
 * Check if amount is valid for transaction
 */
export function isValidStxAmount(
  amount: number,
  options: {
    min?: number;
    max?: number;
    isMicroStx?: boolean;
  } = {}
): boolean {
  const { min = 0, max = Infinity, isMicroStx = false } = options;
  
  if (!Number.isFinite(amount) || amount < 0) return false;
  
  const stx = isMicroStx ? microStxToStx(amount) : amount;
  return stx >= min && stx <= max;
}

/**
 * Parse STX input string to micro-STX
 * Returns null if invalid
 */
export function parseStxInput(input: string): number | null {
  // Remove commas and whitespace
  const cleaned = input.replace(/[,\s]/g, '').trim();
  
  // Check for valid number format
  if (!/^\d*\.?\d*$/.test(cleaned) || cleaned === '') {
    return null;
  }
  
  const num = parseFloat(cleaned);
  
  if (!Number.isFinite(num) || num < 0) {
    return null;
  }
  
  return stxToMicroStx(num);
}

// ===== Calculations =====

/**
 * Calculate transaction fee in micro-STX
 */
export function calculateFee(
  gasLimit: number,
  gasPrice: number = 1
): number {
  return gasLimit * gasPrice;
}

/**
 * Calculate total contribution with fee
 */
export function calculateTotalWithFee(
  amountMicroStx: number,
  feeMicroStx: number
): number {
  return amountMicroStx + feeMicroStx;
}

/**
 * Calculate percentage change
 */
export function calculatePercentChange(
  oldValue: number,
  newValue: number
): number {
  if (oldValue === 0) return newValue === 0 ? 0 : 100;
  return ((newValue - oldValue) / oldValue) * 100;
}

// ===== Address Utilities =====

/**
 * Validate Stacks address format
 */
export function isValidStacksAddress(address: string): boolean {
  // Mainnet: SP..., Testnet: ST...
  return /^S[PT][A-Z0-9]{38,40}$/i.test(address);
}

/**
 * Truncate address for display
 */
export function truncateAddress(
  address: string,
  startChars = 6,
  endChars = 4
): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Get address type (mainnet/testnet)
 */
export function getAddressNetwork(address: string): 'mainnet' | 'testnet' | null {
  if (address.startsWith('SP')) return 'mainnet';
  if (address.startsWith('ST')) return 'testnet';
  return null;
}

// ===== Transaction Utilities =====

/**
 * Format transaction ID for display
 */
export function formatTxId(txId: string, length = 8): string {
  if (!txId) return '';
  const cleanId = txId.startsWith('0x') ? txId.slice(2) : txId;
  if (cleanId.length <= length * 2) return `0x${cleanId}`;
  return `0x${cleanId.slice(0, length)}...${cleanId.slice(-length)}`;
}

/**
 * Build explorer URL for transaction
 */
export function getExplorerTxUrl(
  txId: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const baseUrl = 'https://explorer.stacks.co/txid';
  const chain = network === 'testnet' ? '?chain=testnet' : '';
  return `${baseUrl}/${txId}${chain}`;
}

/**
 * Build explorer URL for address
 */
export function getExplorerAddressUrl(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const baseUrl = 'https://explorer.stacks.co/address';
  const chain = network === 'testnet' ? '?chain=testnet' : '';
  return `${baseUrl}/${address}${chain}`;
}
