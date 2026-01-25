/**
 * Transaction utility functions for StackSusu
 */

const HIRO_API_BASE = 'https://api.hiro.so';

export interface TransactionStatus {
  txId: string;
  status: 'pending' | 'success' | 'failed' | 'not_found';
  blockHeight?: number;
  blockTime?: number;
  fee?: number;
  nonce?: number;
  error?: string;
}

export interface AccountInfo {
  address: string;
  balance: number;
  nonce: number;
  lockedBalance: number;
}

/**
 * Get transaction status from Hiro API
 */
export async function getTransactionStatus(txId: string): Promise<TransactionStatus> {
  try {
    const response = await fetch(`${HIRO_API_BASE}/extended/v1/tx/${txId}`);
    
    if (response.status === 404) {
      return { txId, status: 'not_found' };
    }
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    let status: TransactionStatus['status'] = 'pending';
    if (data.tx_status === 'success') {
      status = 'success';
    } else if (data.tx_status === 'abort_by_response' || data.tx_status === 'abort_by_post_condition') {
      status = 'failed';
    }
    
    return {
      txId,
      status,
      blockHeight: data.block_height,
      blockTime: data.burn_block_time,
      fee: data.fee_rate,
      nonce: data.nonce,
      error: data.tx_status === 'abort_by_response' ? data.tx_result?.repr : undefined,
    };
  } catch (error) {
    console.error('Failed to get transaction status:', error);
    return {
      txId,
      status: 'not_found',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

/**
 * Wait for transaction confirmation
 */
export async function waitForTransaction(
  txId: string,
  options: { timeout?: number; interval?: number } = {}
): Promise<TransactionStatus> {
  const { timeout = 120000, interval = 5000 } = options;
  const startTime = Date.now();
  
  while (Date.now() - startTime < timeout) {
    const status = await getTransactionStatus(txId);
    
    if (status.status === 'success' || status.status === 'failed') {
      return status;
    }
    
    await new Promise(resolve => setTimeout(resolve, interval));
  }
  
  return {
    txId,
    status: 'pending',
    error: 'Transaction confirmation timeout',
  };
}

/**
 * Get account information
 */
export async function getAccountInfo(address: string): Promise<AccountInfo | null> {
  try {
    const response = await fetch(`${HIRO_API_BASE}/extended/v1/address/${address}/stx`);
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      address,
      balance: parseInt(data.balance, 10),
      nonce: data.nonce || 0,
      lockedBalance: parseInt(data.locked, 10) || 0,
    };
  } catch (error) {
    console.error('Failed to get account info:', error);
    return null;
  }
}

/**
 * Get next nonce for an address
 */
export async function getNextNonce(address: string): Promise<number> {
  const info = await getAccountInfo(address);
  return info ? info.nonce : 0;
}

/**
 * Format STX amount from microSTX
 */
export function formatSTX(microSTX: number | string): string {
  const amount = typeof microSTX === 'string' ? parseInt(microSTX, 10) : microSTX;
  return (amount / 1_000_000).toFixed(6);
}

/**
 * Parse STX amount to microSTX
 */
export function parseSTX(stx: number | string): number {
  const amount = typeof stx === 'string' ? parseFloat(stx) : stx;
  return Math.floor(amount * 1_000_000);
}

/**
 * Validate Stacks address format
 */
export function isValidStacksAddress(address: string): boolean {
  // Mainnet addresses start with SP, testnet with ST
  const mainnetRegex = /^SP[A-Z0-9]{38,40}$/;
  const testnetRegex = /^ST[A-Z0-9]{38,40}$/;
  return mainnetRegex.test(address) || testnetRegex.test(address);
}

/**
 * Get explorer URL for transaction
 */
export function getExplorerTxUrl(txId: string, network: 'mainnet' | 'testnet' = 'mainnet'): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://explorer.stacks.co' 
    : 'https://explorer.stacks.co/?chain=testnet';
  return `${baseUrl}/txid/${txId}`;
}

/**
 * Get explorer URL for address
 */
export function getExplorerAddressUrl(address: string, network: 'mainnet' | 'testnet' = 'mainnet'): string {
  const baseUrl = network === 'mainnet' 
    ? 'https://explorer.stacks.co' 
    : 'https://explorer.stacks.co/?chain=testnet';
  return `${baseUrl}/address/${address}`;
}
