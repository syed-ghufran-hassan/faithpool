/**
 * Application Constants
 * 
 * Central location for all application-wide constants.
 */

// ===== Network Configuration =====
export const NETWORK = {
  MAINNET_API: 'https://api.mainnet.hiro.so',
  TESTNET_API: 'https://api.testnet.hiro.so',
  EXPLORER_MAINNET: 'https://explorer.stacks.co',
  EXPLORER_TESTNET: 'https://explorer.stacks.co/?chain=testnet',
} as const;

// ===== Contract Addresses =====
export const CONTRACTS = {
  DEPLOYER: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N',
  
  // V7 Contracts (Current)
  CORE_V7: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-core-v7',
  ADMIN_V7: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-admin-v7',
  ESCROW_V7: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-escrow-v7',
  NFT_V7: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-nft-v7',
  EMERGENCY_V7: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-emergency-v7',
  GOVERNANCE_V7: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-governance-v7',
  REPUTATION_V7: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-reputation-v7',
  REFERRAL_V7: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-referral-v7',
  TRAITS_V5: 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N.stacksusu-traits-v5',
} as const;

// ===== Circle Configuration =====
export const CIRCLE = {
  MIN_MEMBERS: 3,
  MAX_MEMBERS: 12,
  MIN_CONTRIBUTION_STX: 10, // 10 STX minimum
  MAX_CONTRIBUTION_STX: 10000, // 10,000 STX maximum
  DEFAULT_ROUND_DURATION_DAYS: 7,
  ROUND_DURATION_OPTIONS: [7, 14, 30] as const,
} as const;

// ===== STX Conversion =====
export const STX = {
  MICRO_STX_PER_STX: 1_000_000,
  DEFAULT_TX_FEE: 0.001, // 0.001 STX
  DEFAULT_TX_FEE_MICRO: 1000, // 1000 micro-STX
} as const;

// ===== UI Constants =====
export const UI = {
  DEBOUNCE_MS: 300,
  THROTTLE_MS: 100,
  TOAST_DURATION_MS: 5000,
  ANIMATION_DURATION_MS: 200,
  POLLING_INTERVAL_MS: 30000,
  CACHE_TTL_MS: 5 * 60 * 1000, // 5 minutes
} as const;

// ===== Pagination =====
export const PAGINATION = {
  DEFAULT_PAGE_SIZE: 10,
  PAGE_SIZE_OPTIONS: [10, 25, 50, 100] as const,
  MAX_PAGE_SIZE: 100,
} as const;

// ===== Local Storage Keys =====
export const STORAGE_KEYS = {
  THEME: 'stacksusu_theme',
  WALLET_CONNECTED: 'stacksusu_wallet_connected',
  LAST_WALLET: 'stacksusu_last_wallet',
  CACHE_PREFIX: 'stacksusu_cache_',
  LOGS: 'stacksusu_logs',
  PREFERENCES: 'stacksusu_preferences',
} as const;

// ===== Error Codes =====
export const ERROR_CODES = {
  // Contract errors (matching Clarity error codes)
  ERR_NOT_AUTHORIZED: 100,
  ERR_CIRCLE_NOT_FOUND: 101,
  ERR_CIRCLE_FULL: 102,
  ERR_ALREADY_MEMBER: 103,
  ERR_NOT_MEMBER: 104,
  ERR_ROUND_NOT_ACTIVE: 105,
  ERR_ALREADY_CONTRIBUTED: 106,
  ERR_INSUFFICIENT_FUNDS: 107,
  ERR_INVALID_AMOUNT: 108,
  ERR_PAYOUT_NOT_READY: 109,
  ERR_ALREADY_CLAIMED: 110,
} as const;

// ===== Status Values =====
export const CIRCLE_STATUS = {
  PENDING: 'pending',
  ACTIVE: 'active',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

export const MEMBER_STATUS = {
  ACTIVE: 'active',
  DEFAULTED: 'defaulted',
  COMPLETED: 'completed',
} as const;

export const TRANSACTION_STATUS = {
  PENDING: 'pending',
  SUCCESS: 'success',
  FAILED: 'failed',
  ABANDONED: 'abandoned',
} as const;

// ===== Routes =====
export const ROUTES = {
  HOME: '/',
  DASHBOARD: '/dashboard',
  CIRCLES: '/circles',
  CIRCLE_DETAILS: '/circles/:id',
  CREATE_CIRCLE: '/circles/create',
  PROFILE: '/profile',
  SETTINGS: '/settings',
  HELP: '/help',
  LEADERBOARD: '/leaderboard',
} as const;

// ===== Reputation Tiers =====
export const REPUTATION_TIERS = {
  BRONZE: { min: 0, max: 99, name: 'Bronze', color: '#CD7F32' },
  SILVER: { min: 100, max: 499, name: 'Silver', color: '#C0C0C0' },
  GOLD: { min: 500, max: 999, name: 'Gold', color: '#FFD700' },
  PLATINUM: { min: 1000, max: 4999, name: 'Platinum', color: '#E5E4E2' },
  DIAMOND: { min: 5000, max: Infinity, name: 'Diamond', color: '#B9F2FF' },
} as const;

// ===== External Links =====
export const EXTERNAL_LINKS = {
  DOCS: 'https://docs.stacksusu.com',
  DISCORD: 'https://discord.gg/stacksusu',
  TWITTER: 'https://twitter.com/stacksusu',
  GITHUB: 'https://github.com/AdekunleBamz/Stacksusu',
} as const;
