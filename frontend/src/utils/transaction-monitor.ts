/**
 * Transaction Monitoring Utilities
 * Track and monitor Stacks transactions
 * @module transaction-monitor
 */

export interface TransactionStatus {
  txId: string;
  status: 'pending' | 'success' | 'failed';
  blockHeight?: number;
  result?: any;
  error?: string;
}

export interface TransactionMonitorOptions {
  maxAttempts?: number;
  intervalMs?: number;
  onUpdate?: (status: TransactionStatus) => void;
}

/**
 * Monitor transaction until completion
 */
export async function monitorTransaction(
  txId: string,
  options: TransactionMonitorOptions = {}
): Promise<TransactionStatus> {
  const {
    maxAttempts = 30,
    intervalMs = 10000,
    onUpdate,
  } = options;

  let attempts = 0;
  
  while (attempts < maxAttempts) {
    const status = await checkTransactionStatus(txId);
    
    if (onUpdate) {
      onUpdate(status);
    }
    
    if (status.status === 'success' || status.status === 'failed') {
      return status;
    }
    
    await sleep(intervalMs);
    attempts++;
  }
  
  return {
    txId,
    status: 'failed',
    error: 'Transaction monitoring timeout',
  };
}

/**
 * Check transaction status via API
 */
async function checkTransactionStatus(txId: string): Promise<TransactionStatus> {
  try {
    const response = await fetch(
      `https://api.testnet.hiro.so/extended/v1/tx/${txId}`
    );
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    const data = await response.json();
    
    return {
      txId,
      status: parseStatus(data.tx_status),
      blockHeight: data.block_height,
      result: data.tx_result,
    };
  } catch (error) {
    return {
      txId,
      status: 'pending',
      error: error instanceof Error ? error.message : 'Unknown error',
    };
  }
}

function parseStatus(txStatus: string): 'pending' | 'success' | 'failed' {
  if (txStatus === 'success') return 'success';
  if (txStatus === 'abort_by_response' || txStatus === 'abort_by_post_condition') {
    return 'failed';
  }
  return 'pending';
}

function sleep(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms));
}

/**
 * Transaction storage for persistence
 */
const TX_STORAGE_KEY = 'hearthcircle_transactions';

export function saveTransaction(txId: string, metadata: any) {
  const transactions = getStoredTransactions();
  transactions[txId] = {
    ...metadata,
    timestamp: Date.now(),
  };
  localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(transactions));
}

export function getStoredTransactions(): Record<string, any> {
  const stored = localStorage.getItem(TX_STORAGE_KEY);
  return stored ? JSON.parse(stored) : {};
}

export function clearOldTransactions(maxAgeMs: number = 7 * 24 * 60 * 60 * 1000) {
  const transactions = getStoredTransactions();
  const now = Date.now();
  const filtered = Object.entries(transactions).reduce((acc, [txId, data]) => {
    if (now - data.timestamp < maxAgeMs) {
      acc[txId] = data;
    }
    return acc;
  }, {} as Record<string, any>);
  localStorage.setItem(TX_STORAGE_KEY, JSON.stringify(filtered));
}
