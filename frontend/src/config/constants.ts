/**
 * StackSUSU Configuration Constants
 * 
 * @module config/constants
 */

export const APP_NAME = 'StackSUSU';
export const APP_VERSION = '1.0.0';
export const APP_DESCRIPTION = 'Decentralized savings circles on Stacks';

// Network Configuration
export const NETWORK_CONFIG = {
  MAINNET: {
    name: 'mainnet',
    url: 'https://api.mainnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so',
    chainId: 1,
  },
  TESTNET: {
    name: 'testnet', 
    url: 'https://api.testnet.hiro.so',
    explorerUrl: 'https://explorer.hiro.so/?chain=testnet',
    chainId: 2147483648,
  },
} as const;

// Default to mainnet
export const CURRENT_NETWORK = NETWORK_CONFIG.MAINNET;

// Contract Addresses (V4 - Production)
export const CONTRACT_DEPLOYER = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

export const CONTRACTS = {
  CORE: `${CONTRACT_DEPLOYER}.stacksusu-core-v4`,
  ADMIN: `${CONTRACT_DEPLOYER}.stacksusu-admin-v4`,
  ESCROW: `${CONTRACT_DEPLOYER}.stacksusu-escrow-v4`,
  EMERGENCY: `${CONTRACT_DEPLOYER}.stacksusu-emergency-v4`,
  NFT: `${CONTRACT_DEPLOYER}.stacksusu-nft-v4`,
  TRAITS: `${CONTRACT_DEPLOYER}.stacksusu-traits-v2`,
} as const;

// Circle Configuration
export const CIRCLE_CONFIG = {
  MIN_MEMBERS: 3,
  MAX_MEMBERS: 50,
  MIN_CONTRIBUTION_USTX: 10000, // 0.01 STX
  MAX_CONTRIBUTION_USTX: 10000000000, // 10,000 STX
  MIN_PAYOUT_INTERVAL_DAYS: 1,
  MAX_PAYOUT_INTERVAL_DAYS: 90,
} as const;

// Circle Status
export const CIRCLE_STATUS = {
  FORMING: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  CANCELLED: 3,
} as const;

export const CIRCLE_STATUS_LABELS: Record<number, string> = {
  0: 'Forming',
  1: 'Active',
  2: 'Completed',
  3: 'Cancelled',
};

export const CIRCLE_STATUS_COLORS: Record<number, string> = {
  0: 'warning',
  1: 'success',
  2: 'info',
  3: 'error',
};

// Fee Configuration (in basis points)
export const FEES = {
  ADMIN_FEE_BPS: 50, // 0.5%
  EMERGENCY_FEE_BPS: 200, // 2%
  REFERRAL_FEE_BPS: 25, // 0.25%
  LATE_FEE_BPS: 100, // 1%
} as const;

// Contribution Modes
export const CONTRIBUTION_MODES = {
  UPFRONT: 0,
  ROUND_BY_ROUND: 1,
} as const;

// Error Codes
export const ERROR_CODES: Record<number, string> = {
  1000: 'Not authorized',
  1001: 'Circle not found',
  1002: 'Invalid circle status',
  1003: 'Not a member',
  1004: 'Already a member',
  1005: 'Not your turn',
  1006: 'Invalid amount',
  1007: 'Invalid member count',
  1008: 'Circle is full',
  1009: 'Already deposited',
  1010: 'Insufficient balance',
  1011: 'Payout not ready',
  1012: 'Already claimed',
  1013: 'Invalid interval',
  1014: 'Circle not active',
  1015: 'Deposit required',
  1016: 'Cannot leave active circle',
  1017: 'Invalid name',
  1018: 'Protocol paused',
  1019: 'Already completed',
  1020: 'Round not complete',
  1021: 'Invalid position',
  1022: 'Transfer failed',
  1023: 'NFT not found',
  1024: 'Not NFT owner',
  1025: 'Invalid fee',
  1026: 'Emergency not approved',
  1027: 'Insufficient votes',
  1028: 'Already voted',
  1029: 'Invalid mode',
  1030: 'Insufficient reputation',
};

// Transaction defaults
export const TX_DEFAULTS = {
  DEFAULT_FEE: 2000, // 0.002 STX
  HIGH_FEE: 5000, // 0.005 STX
  LOW_FEE: 1000, // 0.001 STX
} as const;

// Pagination
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  MAX_PAGE_SIZE: 50,
} as const;

// Time intervals
export const TIME = {
  BLOCK_TIME_SECONDS: 10,
  BLOCKS_PER_DAY: 144,
  REFRESH_INTERVAL_MS: 30000, // 30 seconds
  CACHE_DURATION_MS: 60000, // 1 minute
} as const;
