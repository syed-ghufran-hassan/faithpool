/**
 * Wallet Service
 * 
 * Handles Hiro Wallet connection and transaction signing for
 * interacting with StackSUSU smart contracts.
 * 
 * @module services/wallet
 */

import { CONTRACTS, TX_DEFAULTS, ERROR_CODES } from '../config/constants';
import type { 
  CreateCircleParams, 
  JoinCircleParams, 
  DepositParams, 
  ClaimPayoutParams,
  EmergencyWithdrawParams,
} from '../types';
import type { TransactionResult, BroadcastResult } from '../types/blockchain';

// ============================================================
// Types
// ============================================================

/** Wallet connection state */
interface WalletConnection {
  isConnected: boolean;
  address: string | null;
  publicKey: string | null;
}

/** Wallet state change listener */
type WalletListener = (state: WalletConnection) => void;

// ============================================================
// State Management
// ============================================================

/** Current wallet connection state */
let walletState: WalletConnection = {
  isConnected: false,
  address: null,
  publicKey: null,
};

/** Registered state change listeners */
const listeners: WalletListener[] = [];

/**
 * Subscribe to wallet state changes
 * @param listener - Callback for state changes
 * @returns Unsubscribe function
 */
export function subscribeToWallet(listener: WalletListener): () => void {
  listeners.push(listener);
  return () => {
    const index = listeners.indexOf(listener);
    if (index > -1) listeners.splice(index, 1);
  };
}

/** Notify all listeners of state change */
function notifyListeners() {
  listeners.forEach(listener => listener(walletState));
}

// ============================================================
// Wallet Connection
// ============================================================

/**
 * Check if Hiro Wallet extension is installed
 * @returns true if wallet is available
 */
export function isWalletAvailable(): boolean {
  return typeof window !== 'undefined' && 'StacksProvider' in window;
}

/**
 * Get current wallet state (copy to prevent mutation)
 * @returns Current wallet connection state
 */
export function getWalletState(): WalletConnection {
  return { ...walletState };
}

/**
 * Connect to Hiro Wallet
 * @returns Connected wallet state
 * @throws Error if wallet not installed or user cancels
 */
export async function connectWallet(): Promise<WalletConnection> {
  if (!isWalletAvailable()) {
    throw new Error('Hiro Wallet is not installed. Please install it from wallet.hiro.so');
  }

  try {
    // Dynamic import to avoid SSR issues
    const { showConnect } = await import('@stacks/connect');
    
    return new Promise((resolve, reject) => {
      showConnect({
        appDetails: {
          name: 'StackSUSU',
          icon: window.location.origin + '/logo.png',
        },
        onFinish: (data) => {
          walletState = {
            isConnected: true,
            address: data.userSession.loadUserData().profile.stxAddress.mainnet,
            publicKey: data.userSession.loadUserData().appPrivateKey,
          };
          notifyListeners();
          resolve(walletState);
        },
        onCancel: () => {
          reject(new Error('User cancelled connection'));
        },
        userSession: undefined,
      });
    });
  } catch (error) {
    console.error('Failed to connect wallet:', error);
    throw error;
  }
}

// Disconnect wallet
export function disconnectWallet(): void {
  walletState = {
    isConnected: false,
    address: null,
    publicKey: null,
  };
  notifyListeners();
  
  // Clear session storage
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('blockstack-session');
  }
}

// Generic contract call helper
async function callContract(
  contractId: string,
  functionName: string,
  functionArgs: unknown[],
  postConditions: unknown[] = [],
  fee: number = TX_DEFAULTS.DEFAULT_FEE
): Promise<TransactionResult> {
  if (!walletState.isConnected || !walletState.address) {
    throw new Error('Wallet not connected');
  }

  try {
    const { openContractCall } = await import('@stacks/connect');
    const { uintCV, stringAsciiCV, boolCV, principalCV } = await import('@stacks/transactions');
    
    const [address, name] = contractId.split('.');
    
    return new Promise((resolve, reject) => {
      openContractCall({
        contractAddress: address,
        contractName: name,
        functionName,
        functionArgs: functionArgs as any[],
        postConditions: postConditions as any[],
        network: 'mainnet',
        fee,
        onFinish: (data) => {
          resolve({
            txId: data.txId,
            txRaw: data.txRaw,
            stacksTransaction: data.stacksTransaction,
          });
        },
        onCancel: () => {
          reject(new Error('Transaction cancelled by user'));
        },
      });
    });
  } catch (error) {
    console.error('Contract call failed:', error);
    throw error;
  }
}

// Create a new circle
export async function createCircle(params: CreateCircleParams): Promise<TransactionResult> {
  const { uintCV, stringAsciiCV } = await import('@stacks/transactions');
  
  const contributionMicroSTX = Math.floor(params.contribution * 1_000_000);
  const payoutIntervalBlocks = params.payoutIntervalDays * 144; // ~144 blocks per day
  
  return callContract(
    CONTRACTS.CORE,
    'create-circle',
    [
      stringAsciiCV(params.name),
      uintCV(contributionMicroSTX),
      uintCV(params.maxMembers),
      uintCV(payoutIntervalBlocks),
    ]
  );
}

// Join an existing circle
export async function joinCircle(params: JoinCircleParams): Promise<TransactionResult> {
  const { uintCV, principalCV } = await import('@stacks/transactions');
  
  if (params.referrer) {
    return callContract(
      CONTRACTS.CORE,
      'join-circle-with-referral',
      [
        uintCV(params.circleId),
        principalCV(params.referrer),
      ]
    );
  }
  
  return callContract(
    CONTRACTS.CORE,
    'join-circle',
    [uintCV(params.circleId)]
  );
}

// Deposit to circle
export async function depositToCircle(params: DepositParams): Promise<TransactionResult> {
  const { uintCV } = await import('@stacks/transactions');
  
  return callContract(
    CONTRACTS.CORE,
    'deposit-to-circle',
    [uintCV(params.circleId)]
  );
}

// Claim payout
export async function claimPayout(params: ClaimPayoutParams): Promise<TransactionResult> {
  const { uintCV } = await import('@stacks/transactions');
  
  return callContract(
    CONTRACTS.CORE,
    'claim-payout',
    [uintCV(params.circleId)]
  );
}

// Leave circle (before it starts)
export async function leaveCircle(circleId: number): Promise<TransactionResult> {
  const { uintCV } = await import('@stacks/transactions');
  
  return callContract(
    CONTRACTS.CORE,
    'leave-circle',
    [uintCV(circleId)]
  );
}

// Emergency withdraw
export async function emergencyWithdraw(params: EmergencyWithdrawParams): Promise<TransactionResult> {
  const { uintCV } = await import('@stacks/transactions');
  
  return callContract(
    CONTRACTS.EMERGENCY,
    'emergency-withdraw',
    [uintCV(params.circleId)]
  );
}

// Set NFT minting preference
export async function setNFTMinting(enabled: boolean): Promise<TransactionResult> {
  const { boolCV } = await import('@stacks/transactions');
  
  return callContract(
    CONTRACTS.CORE,
    'set-nft-minting',
    [boolCV(enabled)]
  );
}

// Set circle trading enabled (creator only)
export async function setCircleTrading(circleId: number, enabled: boolean): Promise<TransactionResult> {
  const { uintCV, boolCV } = await import('@stacks/transactions');
  
  return callContract(
    CONTRACTS.CORE,
    'set-circle-trading',
    [uintCV(circleId), boolCV(enabled)]
  );
}

// Mint slot NFT
export async function mintSlotNFT(circleId: number): Promise<TransactionResult> {
  const { uintCV } = await import('@stacks/transactions');
  
  return callContract(
    CONTRACTS.CORE,
    'mint-slot-nft',
    [uintCV(circleId)]
  );
}

// List NFT for sale
export async function listNFTForSale(tokenId: number, price: number): Promise<TransactionResult> {
  const { uintCV } = await import('@stacks/transactions');
  
  const priceMicroSTX = Math.floor(price * 1_000_000);
  
  return callContract(
    CONTRACTS.NFT,
    'list-for-sale',
    [uintCV(tokenId), uintCV(priceMicroSTX)]
  );
}

// Unlist NFT
export async function unlistNFT(tokenId: number): Promise<TransactionResult> {
  const { uintCV } = await import('@stacks/transactions');
  
  return callContract(
    CONTRACTS.NFT,
    'unlist',
    [uintCV(tokenId)]
  );
}

// Buy NFT
export async function buyNFT(tokenId: number): Promise<TransactionResult> {
  const { uintCV } = await import('@stacks/transactions');
  
  return callContract(
    CONTRACTS.NFT,
    'buy',
    [uintCV(tokenId)]
  );
}

// Parse error code to message
export function getErrorMessage(errorCode: number): string {
  return ERROR_CODES[errorCode] || `Unknown error (${errorCode})`;
}

// Parse transaction result for error
export function parseTransactionError(result: unknown): string | null {
  if (!result) return null;
  
  const resultStr = String(result);
  const match = resultStr.match(/\(err u(\d+)\)/);
  if (match) {
    const code = parseInt(match[1]);
    return getErrorMessage(code);
  }
  
  return null;
}
