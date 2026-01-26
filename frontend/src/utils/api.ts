/**
 * API utility functions for StackSUSU
 * Handles Stacks blockchain API interactions
 */

import { NETWORK_CONFIG } from '../constants/contracts';

export interface ApiRequestOptions {
  method?: 'GET' | 'POST';
  body?: unknown;
  headers?: Record<string, string>;
  timeout?: number;
  retries?: number;
}

export interface ApiResponse<T> {
  data: T | null;
  error: string | null;
  status: number;
  success: boolean;
}

export interface AccountBalanceResponse {
  stx: {
    balance: string;
    total_sent: string;
    total_received: string;
    locked: string;
  };
  fungible_tokens: Record<string, { balance: string }>;
  non_fungible_tokens: Record<string, { count: string }>;
}

export interface TransactionResponse {
  tx_id: string;
  tx_status: 'pending' | 'success' | 'abort_by_response' | 'abort_by_post_condition';
  tx_type: string;
  fee_rate: string;
  sender_address: string;
  block_height?: number;
  block_time?: number;
}

export interface ContractCallResult {
  okay: boolean;
  result?: string;
  cause?: string;
}

/**
 * Base fetch with retry logic
 */
async function fetchWithRetry<T>(
  url: string,
  options: ApiRequestOptions = {}
): Promise<ApiResponse<T>> {
  const { method = 'GET', body, headers = {}, timeout = 30000, retries = 3 } = options;
  
  let lastError: Error | null = null;
  
  for (let attempt = 0; attempt < retries; attempt++) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), timeout);
      
      const response = await fetch(url, {
        method,
        headers: {
          'Content-Type': 'application/json',
          ...headers,
        },
        body: body ? JSON.stringify(body) : undefined,
        signal: controller.signal,
      });
      
      clearTimeout(timeoutId);
      
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const data = await response.json();
      return {
        data,
        error: null,
        status: response.status,
        success: true,
      };
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      // Don't retry on client errors (4xx)
      if (lastError.message.includes('HTTP 4')) {
        break;
      }
      
      // Wait before retrying (exponential backoff)
      if (attempt < retries - 1) {
        await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
      }
    }
  }
  
  return {
    data: null,
    error: lastError?.message || 'Unknown error',
    status: 0,
    success: false,
  };
}

/**
 * Get account balance from Stacks API
 */
export async function getAccountBalance(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<ApiResponse<AccountBalanceResponse>> {
  const baseUrl = network === 'mainnet' 
    ? NETWORK_CONFIG.MAINNET_API_URL 
    : NETWORK_CONFIG.TESTNET_API_URL;
    
  return fetchWithRetry<AccountBalanceResponse>(
    `${baseUrl}/extended/v1/address/${address}/balances`
  );
}

/**
 * Get STX balance in microstacks
 */
export async function getStxBalance(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<number> {
  const response = await getAccountBalance(address, network);
  if (!response.success || !response.data) return 0;
  return parseInt(response.data.stx.balance, 10);
}

/**
 * Get transaction details
 */
export async function getTransaction(
  txId: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<ApiResponse<TransactionResponse>> {
  const baseUrl = network === 'mainnet' 
    ? NETWORK_CONFIG.MAINNET_API_URL 
    : NETWORK_CONFIG.TESTNET_API_URL;
    
  return fetchWithRetry<TransactionResponse>(
    `${baseUrl}/extended/v1/tx/${txId}`
  );
}

/**
 * Get recent transactions for address
 */
export async function getAddressTransactions(
  address: string,
  limit = 20,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<ApiResponse<{ results: TransactionResponse[] }>> {
  const baseUrl = network === 'mainnet' 
    ? NETWORK_CONFIG.MAINNET_API_URL 
    : NETWORK_CONFIG.TESTNET_API_URL;
    
  return fetchWithRetry<{ results: TransactionResponse[] }>(
    `${baseUrl}/extended/v1/address/${address}/transactions?limit=${limit}`
  );
}

/**
 * Read from a read-only contract function
 */
export async function callReadOnlyFunction(
  contractAddress: string,
  contractName: string,
  functionName: string,
  args: string[],
  senderAddress: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<ApiResponse<ContractCallResult>> {
  const baseUrl = network === 'mainnet' 
    ? NETWORK_CONFIG.MAINNET_API_URL 
    : NETWORK_CONFIG.TESTNET_API_URL;
    
  return fetchWithRetry<ContractCallResult>(
    `${baseUrl}/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`,
    {
      method: 'POST',
      body: {
        sender: senderAddress,
        arguments: args,
      },
    }
  );
}

/**
 * Get current block height
 */
export async function getCurrentBlockHeight(
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<number> {
  const baseUrl = network === 'mainnet' 
    ? NETWORK_CONFIG.MAINNET_API_URL 
    : NETWORK_CONFIG.TESTNET_API_URL;
    
  const response = await fetchWithRetry<{ chain_tip: { block_height: number } }>(
    `${baseUrl}/extended/v1/status`
  );
  
  return response.data?.chain_tip?.block_height || 0;
}

/**
 * Get NFTs owned by address
 */
export async function getAddressNFTs(
  address: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<ApiResponse<{ results: Array<{ asset_identifier: string; value: { repr: string } }> }>> {
  const baseUrl = network === 'mainnet' 
    ? NETWORK_CONFIG.MAINNET_API_URL 
    : NETWORK_CONFIG.TESTNET_API_URL;
    
  return fetchWithRetry(
    `${baseUrl}/extended/v1/tokens/nft/holdings?principal=${address}`
  );
}

/**
 * Get contract interface (ABI)
 */
export async function getContractInterface(
  contractAddress: string,
  contractName: string,
  network: 'mainnet' | 'testnet' = 'mainnet'
): Promise<ApiResponse<{ functions: Array<{ name: string; access: string; args: unknown[] }> }>> {
  const baseUrl = network === 'mainnet' 
    ? NETWORK_CONFIG.MAINNET_API_URL 
    : NETWORK_CONFIG.TESTNET_API_URL;
    
  return fetchWithRetry(
    `${baseUrl}/v2/contracts/interface/${contractAddress}/${contractName}`
  );
}

/**
 * Format API error for display
 */
export function formatApiError(error: string): string {
  if (error.includes('timeout') || error.includes('abort')) {
    return 'Request timed out. Please try again.';
  }
  if (error.includes('404')) {
    return 'Resource not found.';
  }
  if (error.includes('429')) {
    return 'Too many requests. Please wait a moment.';
  }
  if (error.includes('500') || error.includes('502') || error.includes('503')) {
    return 'Server error. Please try again later.';
  }
  return error;
}

/**
 * Check if address is valid Stacks address
 */
export function isValidStacksAddress(address: string): boolean {
  if (!address || typeof address !== 'string') return false;
  // Mainnet addresses start with SP, testnet with ST
  const pattern = /^S[PT][A-Z0-9]{33,40}$/;
  return pattern.test(address);
}

/**
 * Check if transaction ID is valid
 */
export function isValidTxId(txId: string): boolean {
  if (!txId || typeof txId !== 'string') return false;
  // Must be 64 hex characters, optionally prefixed with 0x
  const cleanId = txId.startsWith('0x') ? txId.slice(2) : txId;
  return /^[a-fA-F0-9]{64}$/.test(cleanId);
}

/**
 * Poll for transaction confirmation
 */
export async function waitForTransaction(
  txId: string,
  network: 'mainnet' | 'testnet' = 'mainnet',
  maxAttempts = 60,
  intervalMs = 5000
): Promise<TransactionResponse | null> {
  for (let i = 0; i < maxAttempts; i++) {
    const response = await getTransaction(txId, network);
    
    if (response.success && response.data) {
      const status = response.data.tx_status;
      if (status === 'success' || status.startsWith('abort')) {
        return response.data;
      }
    }
    
    await new Promise(resolve => setTimeout(resolve, intervalMs));
  }
  
  return null;
}
