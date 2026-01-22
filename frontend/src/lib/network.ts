/**
 * Stacks blockchain network configuration
 */

import { STACKS_MAINNET, STACKS_TESTNET, STACKS_DEVNET } from '@stacks/network';

export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

interface NetworkConfig {
  network: typeof STACKS_MAINNET | typeof STACKS_TESTNET | typeof STACKS_DEVNET;
  apiUrl: string;
  explorerUrl: string;
  chainId: number;
}

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

// Default to mainnet for production
const currentNetwork: NetworkType = 
  (import.meta.env.VITE_NETWORK as NetworkType) || 'mainnet';

export const networkConfig = networks[currentNetwork];

export function getExplorerUrl(txId: string): string {
  return `${networkConfig.explorerUrl}/txid/${txId}`;
}

export function getAddressUrl(address: string): string {
  return `${networkConfig.explorerUrl}/address/${address}`;
}

export function getContractUrl(contractId: string): string {
  return `${networkConfig.explorerUrl}/txid/${contractId}`;
}

export { networks, currentNetwork };
