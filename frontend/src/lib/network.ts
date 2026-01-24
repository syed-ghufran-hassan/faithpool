/**
 * Stacks blockchain network configuration
 * 
 * Provides network-specific settings for mainnet, testnet, and devnet.
 * Automatically detects network from environment variables.
 * 
 * @module lib/network
 */

import { STACKS_MAINNET, STACKS_TESTNET, STACKS_DEVNET } from '@stacks/network';

/** Supported Stacks network types */
export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

/** Network configuration structure */
interface NetworkConfig {
  /** Stacks network instance */
  network: typeof STACKS_MAINNET | typeof STACKS_TESTNET | typeof STACKS_DEVNET;
  /** API base URL for the network */
  apiUrl: string;
  /** Block explorer URL */
  explorerUrl: string;
  /** Network chain ID */
  chainId: number;
}

/** Network configurations for each environment */
const networks: Record<NetworkType, NetworkConfig> = {
  mainnet: {
    network: STACKS_MAINNET,
    apiUrl: 'https://api.mainnet.hiro.so',
    explorerUrl: 'https://explorer.stacks.co',
    chainId: 1,
  },
  testnet: {
    network: STACKS_TESTNET,
    apiUrl: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.stacks.co/?chain=testnet',
    chainId: 2147483648,
  },
  devnet: {
    network: STACKS_DEVNET,
    apiUrl: 'http://localhost:3999',
    explorerUrl: 'http://localhost:8000',
    chainId: 2147483648,
  },
};

/** Current active network (defaults to mainnet) */
const currentNetwork: NetworkType = 
  (import.meta.env.VITE_STACKS_NETWORK as NetworkType) || 'mainnet';

/** Current network configuration */
export const networkConfig = networks[currentNetwork];

/**
 * Get explorer URL for a transaction
 * @param txId - Transaction ID
 */
export function getExplorerUrl(txId: string): string {
  return `${networkConfig.explorerUrl}/txid/${txId}`;
}

/**
 * Get explorer URL for an address
 * @param address - Stacks address
 */
export function getAddressUrl(address: string): string {
  return `${networkConfig.explorerUrl}/address/${address}`;
}

/**
 * Get explorer URL for a contract
 * @param contractId - Contract ID (address.contract-name)
 */
export function getContractUrl(contractId: string): string {
  return `${networkConfig.explorerUrl}/txid/${contractId}`;
}

export { networks, currentNetwork };
