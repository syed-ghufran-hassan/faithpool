// Blockchain-specific types for Stacks integration

import { CircleStatus } from './index';

// Clarity value representations
export interface ClarityUint {
  type: 'uint';
  value: string;
}

export interface ClarityInt {
  type: 'int';
  value: string;
}

export interface ClarityBool {
  type: 'bool';
  value: boolean;
}

export interface ClarityPrincipal {
  type: 'principal';
  value: string;
}

export interface ClarityString {
  type: 'string-ascii' | 'string-utf8';
  value: string;
}

export interface ClarityBuffer {
  type: 'buffer';
  value: string;
}

export interface ClarityList {
  type: 'list';
  value: ClarityValue[];
}

export interface ClarityTuple {
  type: 'tuple';
  value: Record<string, ClarityValue>;
}

export interface ClarityOptional {
  type: 'optional';
  value: ClarityValue | null;
}

export interface ClarityResponse {
  type: 'response';
  success: boolean;
  value: ClarityValue;
}

export type ClarityValue =
  | ClarityUint
  | ClarityInt
  | ClarityBool
  | ClarityPrincipal
  | ClarityString
  | ClarityBuffer
  | ClarityList
  | ClarityTuple
  | ClarityOptional
  | ClarityResponse;

// Contract call response
export interface ContractCallResponse {
  okay: boolean;
  result: string;
  cause?: string;
}

// Circle info from blockchain
export interface OnChainCircleInfo {
  name: string;
  creator: string;
  contribution: bigint;
  'max-members': bigint;
  'member-count': bigint;
  'current-round': bigint;
  'payout-interval': bigint;
  'start-block': bigint;
  status: bigint;
  'next-payout-block'?: bigint;
  'trading-enabled'?: boolean;
}

// Member info from blockchain
export interface OnChainMemberInfo {
  slot: bigint;
  deposited: boolean;
  'deposit-amount': bigint;
}

// Escrow balance from blockchain
export interface OnChainEscrowBalance {
  balance: bigint;
  locked: bigint;
}

// NFT info from blockchain
export interface OnChainNFTInfo {
  owner: string;
  'circle-id': bigint;
  slot: bigint;
  'minted-at': bigint;
}

// NFT listing info
export interface OnChainNFTListing {
  seller: string;
  price: bigint;
}

// Transaction options
export interface TransactionOptions {
  fee?: number;
  nonce?: number;
  postConditions?: PostCondition[];
  onFinish?: (data: TransactionResult) => void;
  onCancel?: () => void;
}

// Post condition types
export interface PostCondition {
  type: 'stx' | 'fungible' | 'non-fungible';
  principal: string;
  conditionCode: string;
  amount?: bigint;
  asset?: string;
  tokenId?: bigint;
}

// Transaction result
export interface TransactionResult {
  txId: string;
  txRaw: string;
  stacksTransaction?: unknown;
}

// Broadcast result
export interface BroadcastResult {
  success: boolean;
  txId?: string;
  error?: string;
  reason?: string;
}

// Address transaction from API
export interface AddressTransaction {
  tx_id: string;
  nonce: number;
  fee_rate: string;
  sender_address: string;
  tx_status: string;
  tx_type: string;
  block_height?: number;
  block_time?: number;
  burn_block_time?: number;
  contract_call?: {
    contract_id: string;
    function_name: string;
    function_signature: string;
    function_args?: Array<{
      hex: string;
      repr: string;
      name: string;
      type: string;
    }>;
  };
  token_transfer?: {
    recipient_address: string;
    amount: string;
    memo: string;
  };
  smart_contract?: {
    contract_id: string;
    source_code: string;
  };
  tx_result?: {
    hex: string;
    repr: string;
  };
}

// Mempool transaction
export interface MempoolTransaction extends AddressTransaction {
  receipt_time: number;
  receipt_time_iso: string;
}

// Account balance response
export interface AccountBalance {
  balance: string;
  total_sent: string;
  total_received: string;
  total_fees_sent: string;
  total_miner_rewards_received: string;
  lock_tx_id: string;
  locked: string;
  lock_height: number;
  burnchain_lock_height: number;
  burnchain_unlock_height: number;
}

// Contract info response
export interface ContractInfo {
  tx_id: string;
  canonical: boolean;
  contract_id: string;
  block_height: number;
  clarity_version: number | null;
  source_code: string;
  abi: string;
}

// Block info
export interface BlockInfo {
  height: number;
  hash: string;
  time: number;
  burnBlockHeight: number;
}

// Wallet state
export interface WalletState {
  isConnected: boolean;
  address: string | null;
  publicKey: string | null;
  balance: number;
  nonce: number;
}

// Contract function argument
export interface FunctionArg {
  name: string;
  type: string;
}

// Contract function info
export interface ContractFunction {
  name: string;
  access: 'public' | 'read_only' | 'private';
  args: FunctionArg[];
  outputs: {
    type: string;
  };
}

// Contract ABI
export interface ContractABI {
  functions: ContractFunction[];
  variables: Array<{
    name: string;
    type: string;
    access: string;
  }>;
  maps: Array<{
    name: string;
    key: string;
    value: string;
  }>;
  fungible_tokens: Array<{ name: string }>;
  non_fungible_tokens: Array<{ name: string; type: string }>;
}
