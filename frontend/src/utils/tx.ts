/**
 * Transaction Utilities
 * 
 * Helper functions for Stacks transaction management.
 */

export type TransactionStatus = 'pending' | 'success' | 'failed' | 'abandoned';

export interface TransactionInfo {
  txId: string;
  status: TransactionStatus;
  sender: string;
  fee: number;
  nonce: number;
  blockHeight?: number;
  blockTime?: number;
  result?: unknown;
  error?: string;
}

// API configuration
const API_URL = 'https://api.mainnet.hiro.so';
const DEFAULT_POLL_INTERVAL = 5000;
const MAX_POLL_ATTEMPTS = 60; // 5 minutes at 5s intervals

// ===== Transaction Status =====

/**
 * Get transaction status from API
 */
export async function getTransactionStatus(txId: string): Promise<TransactionInfo | null> {
  try {
    const cleanTxId = txId.startsWith('0x') ? txId : `0x${txId}`;
    const response = await fetch(`${API_URL}/extended/v1/tx/${cleanTxId}`);
    
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      txId: data.tx_id,
      status: mapApiStatus(data.tx_status),
      sender: data.sender_address,
      fee: data.fee_rate,
      nonce: data.nonce,
      blockHeight: data.block_height,
      blockTime: data.block_time,
      result: data.tx_result,
      error: data.tx_status === 'abort_by_response' ? data.tx_result?.repr : undefined,
    };
  } catch (error) {
    console.error('Failed to get transaction status:', error);
    return null;
  }
}

/**
 * Map API status to our status type
 */
function mapApiStatus(apiStatus: string): TransactionStatus {
  switch (apiStatus) {
    case 'success':
      return 'success';
    case 'abort_by_response':
    case 'abort_by_post_condition':
      return 'failed';
    case 'pending':
      return 'pending';
    default:
      return 'abandoned';
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txId: string,
  options: {
    pollInterval?: number;
    maxAttempts?: number;
    onStatusChange?: (status: TransactionStatus) => void;
  } = {}
): Promise<TransactionInfo> {
  const {
    pollInterval = DEFAULT_POLL_INTERVAL,
    maxAttempts = MAX_POLL_ATTEMPTS,
    onStatusChange,
  } = options;

  let attempts = 0;
  let lastStatus: TransactionStatus = 'pending';

  while (attempts < maxAttempts) {
    const info = await getTransactionStatus(txId);
    
    if (info) {
      if (info.status !== lastStatus) {
        lastStatus = info.status;
        onStatusChange?.(info.status);
      }
      
      if (info.status === 'success' || info.status === 'failed') {
        return info;
      }
    }
    
    attempts++;
    await sleep(pollInterval);
  }

  throw new Error(`Transaction ${txId} did not confirm after ${maxAttempts} attempts`);
}

// ===== Transaction History =====

/**
 * Get recent transactions for an address
 */
export async function getAddressTransactions(
  address: string,
  limit = 20,
  offset = 0
): Promise<TransactionInfo[]> {
  try {
    const response = await fetch(
      `${API_URL}/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return data.results.map((tx: Record<string, unknown>) => ({
      txId: tx.tx_id,
      status: mapApiStatus(tx.tx_status as string),
      sender: tx.sender_address,
      fee: tx.fee_rate,
      nonce: tx.nonce,
      blockHeight: tx.block_height,
      blockTime: tx.block_time,
    }));
  } catch (error) {
    console.error('Failed to get address transactions:', error);
    return [];
  }
}

// ===== Transaction Formatting =====

/**
 * Format transaction ID for display
 */
export function formatTxId(txId: string, length = 8): string {
  if (!txId) return '';
  const clean = txId.startsWith('0x') ? txId : `0x${txId}`;
  if (clean.length <= length * 2 + 2) return clean;
  return `${clean.slice(0, length + 2)}...${clean.slice(-length)}`;
}

/**
 * Get status display info
 */
export function getStatusDisplay(status: TransactionStatus): {
  label: string;
  color: string;
  icon: string;
} {
  switch (status) {
    case 'success':
      return { label: 'Confirmed', color: 'green', icon: '✓' };
    case 'failed':
      return { label: 'Failed', color: 'red', icon: '✗' };
    case 'pending':
      return { label: 'Pending', color: 'yellow', icon: '⋯' };
    case 'abandoned':
      return { label: 'Abandoned', color: 'gray', icon: '○' };
  }
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerUrl(txId: string, network: 'mainnet' | 'testnet' = 'mainnet'): string {
  const base = 'https://explorer.stacks.co/txid';
  const chain = network === 'testnet' ? '?chain=testnet' : '';
  const clean = txId.startsWith('0x') ? txId : `0x${txId}`;
  return `${base}/${clean}${chain}`;
}

// ===== Fee Estimation =====

/**
 * Estimate transaction fee based on priority
 */
export function estimateFee(
  priority: 'low' | 'medium' | 'high' = 'medium'
): number {
  const fees = {
    low: 500,     // 0.0005 STX
    medium: 1000, // 0.001 STX
    high: 2000,   // 0.002 STX
  };
  return fees[priority];
}

/**
 * Format fee in STX
 */
export function formatFee(microStx: number): string {
  const stx = microStx / 1_000_000;
  return `${stx.toFixed(6)} STX`;
}

// ===== Utility Functions =====

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Check if transaction is in a final state
 */
export function isFinalStatus(status: TransactionStatus): boolean {
  return status === 'success' || status === 'failed' || status === 'abandoned';
}

/**
 * Calculate time since transaction
 */
export function getTimeSince(blockTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - blockTime;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}
