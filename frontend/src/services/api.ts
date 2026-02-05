/**
 * API Service for StackSUSU
 * 
 * Provides HTTP client for:
 * - Stacks blockchain API interactions
 * - Optional backend API endpoints
 * 
 * @module services/api
 */

/** Base URL for optional backend API */
const API_BASE = import.meta.env.VITE_API_URL || '';

/** Stacks blockchain API endpoint */
const STACKS_API = 'https://stacks-node-api.mainnet.stacks.co';

/** Options for fetch requests */
interface FetchOptions {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE';
  body?: unknown;
  headers?: Record<string, string>;
}

/**
 * Generic fetch wrapper with error handling
 * @param endpoint - API endpoint path
 * @param options - Fetch options
 * @returns Parsed JSON response
 */
async function fetchApi<T>(endpoint: string, options: FetchOptions = {}): Promise<T> {
  const { method = 'GET', body, headers = {} } = options;
  
  const config: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body) {
    config.body = JSON.stringify(body);
  }

  const response = await fetch(`${API_BASE}${endpoint}`, config);
  
  if (!response.ok) {
    throw new Error(`API Error: ${response.status} ${response.statusText}`);
  }

  return response.json();
}

// ============================================================
// Stacks Blockchain API
// ============================================================

/**
 * Get STX balance for an address
 * @param address - Stacks address
 * @returns Balance in STX
 */
export async function getAccountBalance(address: string): Promise<number> {
  try {
    const response = await fetch(`${STACKS_API}/extended/v1/address/${address}/stx`);
    const data = await response.json();
    return parseInt(data.balance) / 1_000_000;
  } catch (error) {
    console.error('Failed to fetch balance:', error);
    return 0;
  }
}

/**
 * Get transaction history for an address
 * @param address - Stacks address
 * @param limit - Maximum transactions to return
 */
export async function getAccountTransactions(address: string, limit = 20) {
  try {
    const response = await fetch(
      `${STACKS_API}/extended/v1/address/${address}/transactions?limit=${limit}`
    );
    return response.json();
  } catch (error) {
    console.error('Failed to fetch transactions:', error);
    return { results: [] };
  }
}

/**
 * Get contract interface/ABI
 * @param contractId - Contract ID (address.contract-name)
 */
export async function getContractInfo(contractId: string) {
  try {
    const [address, name] = contractId.split('.');
    const response = await fetch(
      `${STACKS_API}/v2/contracts/interface/${address}/${name}`
    );
    return response.json();
  } catch (error) {
    console.error('Failed to fetch contract info:', error);
    return null;
  }
}

/**
 * Call a read-only contract function
 * @param contractId - Contract ID (address.contract-name)
 * @param functionName - Function to call
 * @param args - Clarity-encoded arguments
 * @param senderAddress - Address making the call
 */
export async function callReadOnlyFunction(
  contractId: string,
  functionName: string,
  args: string[] = [],
  senderAddress: string
) {
  try {
    const [address, name] = contractId.split('.');
    const response = await fetch(
      `${STACKS_API}/v2/contracts/call-read/${address}/${name}/${functionName}`,
      {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sender: senderAddress,
          arguments: args,
        }),
      }
    );
    return response.json();
  } catch (error) {
    console.error('Failed to call read-only function:', error);
    return null;
  }
}

/**
 * Get transaction status by ID
 * @param txId - Transaction ID
 */
export async function getTransactionStatus(txId: string) {
  try {
    const response = await fetch(`${STACKS_API}/extended/v1/tx/${txId}`);
    return response.json();
  } catch (error) {
    console.error('Failed to fetch transaction status:', error);
    return null;
  }
}

// ============================================================
// Backend API Endpoints (Optional)
// ============================================================

/** Circle API endpoints */
export const circleApi = {
  getAll: () => fetchApi<unknown>('/api/circles'),
  getById: (id: number) => fetchApi<unknown>(`/api/circles/${id}`),
  getByCreator: (address: string) => fetchApi<unknown>(`/api/circles/creator/${address}`),
  getMembers: (id: number) => fetchApi<unknown>(`/api/circles/${id}/members`),
};

/** User API endpoints */
export const userApi = {
  getProfile: (address: string) => fetchApi<unknown>(`/api/users/${address}`),
  getCircles: (address: string) => fetchApi<unknown>(`/api/users/${address}/circles`),
  getActivity: (address: string) => fetchApi<unknown>(`/api/users/${address}/activity`),
  getNFTs: (address: string) => fetchApi<unknown>(`/api/users/${address}/nfts`),
};

/** Statistics API endpoints */
export const statsApi = {
  getGlobal: () => fetchApi<unknown>('/api/stats'),
  getCircleStats: (id: number) => fetchApi<unknown>(`/api/stats/circles/${id}`),
};

/** Default export with all API functions */
export default {
  getAccountBalance,
  getAccountTransactions,
  getContractInfo,
  callReadOnlyFunction,
  getTransactionStatus,
  circleApi,
  userApi,
  statsApi,
};
