// StackSUSU Contract Addresses
export const CONTRACTS = {
  CORE: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-core-v4',
  ADMIN: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-admin-v4',
  ESCROW: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-escrow-v4',
  EMERGENCY: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-emergency-v4',
  NFT: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-nft-v4',
  TRAITS: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-traits-v2',
} as const;

// Network Configuration
export const NETWORK = {
  MAINNET: {
    url: 'https://stacks-node-api.mainnet.stacks.co',
    chainId: 1,
  },
  TESTNET: {
    url: 'https://stacks-node-api.testnet.stacks.co',
    chainId: 2147483648,
  },
} as const;

// Contract function names
export const CORE_FUNCTIONS = {
  // Read-only
  GET_CIRCLE: 'get-circle',
  GET_MEMBER: 'get-member',
  GET_CIRCLE_COUNT: 'get-circle-count',
  IS_MEMBER: 'is-member',
  
  // Public
  CREATE_CIRCLE: 'create-circle',
  JOIN_CIRCLE: 'join-circle',
  DEPOSIT: 'deposit',
  CLAIM_PAYOUT: 'claim-payout',
  ADVANCE_ROUND: 'advance-round',
} as const;

export const ESCROW_FUNCTIONS = {
  // Read-only
  GET_BALANCE: 'get-balance',
  GET_TOTAL_ESCROW: 'get-total-escrow',
  
  // Public
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
} as const;

export const EMERGENCY_FUNCTIONS = {
  // Public
  REQUEST_PAYOUT: 'request-emergency-payout',
  APPROVE_PAYOUT: 'approve-emergency-payout',
  CLAIM_PAYOUT: 'claim-emergency-payout',
} as const;

export const NFT_FUNCTIONS = {
  // Read-only
  GET_OWNER: 'get-owner',
  GET_TOKEN_URI: 'get-token-uri',
  GET_LAST_TOKEN_ID: 'get-last-token-id',
  
  // Public
  MINT: 'mint',
  TRANSFER: 'transfer',
  SET_TOKEN_URI: 'set-token-uri',
} as const;

// Circle status
export const CIRCLE_STATUS = {
  FORMING: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const;

// Error codes
export const ERROR_CODES = {
  ERR_NOT_AUTHORIZED: 100,
  ERR_CIRCLE_NOT_FOUND: 101,
  ERR_ALREADY_MEMBER: 102,
  ERR_NOT_MEMBER: 103,
  ERR_CIRCLE_FULL: 104,
  ERR_ALREADY_DEPOSITED: 105,
  ERR_NOT_YOUR_TURN: 106,
  ERR_INSUFFICIENT_BALANCE: 107,
  ERR_INVALID_AMOUNT: 108,
} as const;
