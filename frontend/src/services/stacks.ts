// Stacks Blockchain API Service
// Direct interaction with the Stacks blockchain via Hiro API

import { CURRENT_NETWORK, CONTRACTS, CONTRACT_DEPLOYER } from '../config/constants';
import type { 
  AccountBalance, 
  AddressTransaction, 
  MempoolTransaction,
  ContractCallResponse,
  BlockInfo,
} from '../types/blockchain';

const API_BASE = CURRENT_NETWORK.url;

// Generic fetch wrapper with error handling
async function fetchApi<T>(endpoint: string, options?: RequestInit): Promise<T> {
  const url = `${API_BASE}${endpoint}`;
  
  try {
    const response = await fetch(url, {
      ...options,
      headers: {
        'Content-Type': 'application/json',
        ...options?.headers,
      },
    });

    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`API Error ${response.status}: ${errorText}`);
    }

    return response.json();
  } catch (error) {
    console.error(`Failed to fetch ${endpoint}:`, error);
    throw error;
  }
}

// Account APIs
export async function getAccountBalance(address: string): Promise<AccountBalance> {
  return fetchApi(`/extended/v1/address/${address}/stx`);
}

export async function getAccountBalanceSTX(address: string): Promise<number> {
  const data = await getAccountBalance(address);
  return parseInt(data.balance) / 1_000_000;
}

export async function getAccountNonce(address: string): Promise<number> {
  const data = await fetchApi<{ possible_next_nonce: number }>(
    `/extended/v1/address/${address}/nonces`
  );
  return data.possible_next_nonce;
}

export async function getAccountTransactions(
  address: string, 
  limit = 20,
  offset = 0
): Promise<{ results: AddressTransaction[]; total: number }> {
  return fetchApi(`/extended/v1/address/${address}/transactions?limit=${limit}&offset=${offset}`);
}

export async function getAccountMempoolTransactions(
  address: string
): Promise<{ results: MempoolTransaction[]; total: number }> {
  return fetchApi(`/extended/v1/address/${address}/mempool`);
}

// Transaction APIs
export async function getTransaction(txId: string): Promise<AddressTransaction> {
  // Ensure txId has 0x prefix
  const formattedTxId = txId.startsWith('0x') ? txId : `0x${txId}`;
  return fetchApi(`/extended/v1/tx/${formattedTxId}`);
}

export async function getTransactionStatus(txId: string): Promise<string> {
  const tx = await getTransaction(txId);
  return tx.tx_status;
}

export async function broadcastTransaction(txHex: string): Promise<{ txid: string } | { error: string }> {
  return fetchApi('/v2/transactions', {
    method: 'POST',
    body: txHex,
    headers: {
      'Content-Type': 'application/octet-stream',
    },
  });
}

// Block APIs
export async function getCurrentBlockHeight(): Promise<number> {
  const data = await fetchApi<{ stacks_tip_height: number }>('/v2/info');
  return data.stacks_tip_height;
}

export async function getBlockInfo(heightOrHash: number | string): Promise<BlockInfo> {
  const data = await fetchApi<{
    height: number;
    hash: string;
    time: number;
    burn_block_height: number;
  }>(`/extended/v2/blocks/${heightOrHash}`);
  
  return {
    height: data.height,
    hash: data.hash,
    time: data.time,
    burnBlockHeight: data.burn_block_height,
  };
}

// Contract read-only call
export async function callReadOnly(
  contractAddress: string,
  contractName: string,
  functionName: string,
  args: string[] = [],
  senderAddress: string = CONTRACT_DEPLOYER
): Promise<ContractCallResponse> {
  return fetchApi(`/v2/contracts/call-read/${contractAddress}/${contractName}/${functionName}`, {
    method: 'POST',
    body: JSON.stringify({
      sender: senderAddress,
      arguments: args,
    }),
  });
}

// Helper to call contract with full contract ID
export async function callContractReadOnly(
  contractId: string,
  functionName: string,
  args: string[] = [],
  senderAddress?: string
): Promise<ContractCallResponse> {
  const [address, name] = contractId.split('.');
  return callReadOnly(address, name, functionName, args, senderAddress);
}

// Contract info
export async function getContractSource(contractId: string): Promise<string> {
  const [address, name] = contractId.split('.');
  const data = await fetchApi<{ source: string }>(`/v2/contracts/source/${address}/${name}`);
  return data.source;
}

export async function getContractInterface(contractId: string): Promise<unknown> {
  const [address, name] = contractId.split('.');
  return fetchApi(`/v2/contracts/interface/${address}/${name}`);
}

// StackSUSU specific API calls
export async function getCircleCount(): Promise<number> {
  const result = await callContractReadOnly(
    CONTRACTS.CORE,
    'get-circle-count'
  );
  
  if (result.okay && result.result) {
    // Parse uint from hex: 0x0100000000000000000000000000000001 -> 1
    const hex = result.result;
    if (hex.startsWith('0x01')) { // uint type indicator
      return parseInt(hex.slice(34), 16);
    }
  }
  return 0;
}

export async function getEscrowBalance(): Promise<number> {
  const data = await getAccountBalance(`${CONTRACT_DEPLOYER}.stacksusu-escrow-v4`);
  return parseInt(data.balance) / 1_000_000;
}

export async function getProtocolPaused(): Promise<boolean> {
  const result = await callContractReadOnly(
    CONTRACTS.ADMIN,
    'is-paused'
  );
  
  if (result.okay && result.result) {
    // 0x03 = true, 0x04 = false
    return result.result === '0x03';
  }
  return false;
}

// Explorer URL helpers
export function getExplorerTxUrl(txId: string): string {
  const formattedTxId = txId.startsWith('0x') ? txId : `0x${txId}`;
  return `${CURRENT_NETWORK.explorerUrl}/txid/${formattedTxId}`;
}

export function getExplorerAddressUrl(address: string): string {
  return `${CURRENT_NETWORK.explorerUrl}/address/${address}`;
}

export function getExplorerContractUrl(contractId: string): string {
  return `${CURRENT_NETWORK.explorerUrl}/txid/${contractId}`;
}
