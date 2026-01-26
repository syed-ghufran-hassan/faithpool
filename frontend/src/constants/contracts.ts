/**
 * StackSUSU Smart Contract Constants
 * Maps to values in the Clarity v7 contracts
 */

// Contract deployer address
export const DEPLOYER_ADDRESS = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

// Contract names (v7)
export const CONTRACTS = {
  CORE: 'stacksusu-core-v7',
  ADMIN: 'stacksusu-admin-v7',
  ESCROW: 'stacksusu-escrow-v7',
  NFT: 'stacksusu-nft-v7',
  GOVERNANCE: 'stacksusu-governance-v7',
  REFERRAL: 'stacksusu-referral-v7',
  REPUTATION: 'stacksusu-reputation-v7',
  EMERGENCY: 'stacksusu-emergency-v7',
  TRAITS: 'stacksusu-traits-v5',
} as const;

// Full contract identifiers
export const CONTRACT_IDS = {
  CORE: `${DEPLOYER_ADDRESS}.${CONTRACTS.CORE}`,
  ADMIN: `${DEPLOYER_ADDRESS}.${CONTRACTS.ADMIN}`,
  ESCROW: `${DEPLOYER_ADDRESS}.${CONTRACTS.ESCROW}`,
  NFT: `${DEPLOYER_ADDRESS}.${CONTRACTS.NFT}`,
  GOVERNANCE: `${DEPLOYER_ADDRESS}.${CONTRACTS.GOVERNANCE}`,
  REFERRAL: `${DEPLOYER_ADDRESS}.${CONTRACTS.REFERRAL}`,
  REPUTATION: `${DEPLOYER_ADDRESS}.${CONTRACTS.REPUTATION}`,
  EMERGENCY: `${DEPLOYER_ADDRESS}.${CONTRACTS.EMERGENCY}`,
} as const;

// Circle status values (matches contract)
export const CIRCLE_STATUS = {
  FORMING: 0,
  ACTIVE: 1,
  COMPLETED: 2,
  CANCELLED: 3,
  PAUSED: 4,
} as const;

export const CIRCLE_STATUS_LABELS: Record<number, string> = {
  [CIRCLE_STATUS.FORMING]: 'Forming',
  [CIRCLE_STATUS.ACTIVE]: 'Active',
  [CIRCLE_STATUS.COMPLETED]: 'Completed',
  [CIRCLE_STATUS.CANCELLED]: 'Cancelled',
  [CIRCLE_STATUS.PAUSED]: 'Paused',
};

// Member status values
export const MEMBER_STATUS = {
  ACTIVE: 0,
  REMOVED: 1,
  LEFT: 2,
} as const;

// Circle constraints (from contract)
export const CIRCLE_CONSTRAINTS = {
  MIN_MEMBERS: 3,
  MAX_MEMBERS: 20,
  MIN_CONTRIBUTION: 1_000_000, // 1 STX in microSTX
  MAX_CONTRIBUTION: 1_000_000_000_000, // 1M STX in microSTX
  MIN_DURATION: 1, // blocks
  MAX_DURATION: 52560, // ~1 year in blocks
} as const;

// Reputation tier thresholds
export const REPUTATION_TIERS = {
  BRONZE: { min: 0, max: 99, name: 'Bronze' },
  SILVER: { min: 100, max: 499, name: 'Silver' },
  GOLD: { min: 500, max: 999, name: 'Gold' },
  PLATINUM: { min: 1000, max: 4999, name: 'Platinum' },
  DIAMOND: { min: 5000, max: Infinity, name: 'Diamond' },
} as const;

// Reputation point values
export const REPUTATION_POINTS = {
  CONTRIBUTION_ON_TIME: 10,
  CONTRIBUTION_EARLY: 15,
  CONTRIBUTION_LATE: 5,
  CIRCLE_COMPLETION: 50,
  CIRCLE_CREATION: 25,
  REFERRAL_BONUS: 20,
  MISSED_CONTRIBUTION: -20,
} as const;

// Fee percentages (in basis points, 100 = 1%)
export const FEES = {
  PLATFORM_FEE: 100, // 1%
  EARLY_WITHDRAWAL_FEE: 500, // 5%
  REFERRAL_BONUS: 50, // 0.5%
} as const;

// Block time constants
export const BLOCK_TIMES = {
  AVG_BLOCK_TIME_SECONDS: 600, // ~10 minutes
  BLOCKS_PER_HOUR: 6,
  BLOCKS_PER_DAY: 144,
  BLOCKS_PER_WEEK: 1008,
  BLOCKS_PER_MONTH: 4320,
} as const;

// Error codes from contracts
export const ERROR_CODES: Record<number, string> = {
  100: 'Not authorized',
  101: 'Circle not found',
  102: 'Already a member',
  103: 'Not a member',
  104: 'Circle is full',
  105: 'Circle not active',
  106: 'Invalid contribution amount',
  107: 'Already contributed this round',
  108: 'Round not started',
  109: 'Cannot claim payout',
  110: 'Insufficient escrow balance',
  111: 'Invalid circle parameters',
  112: 'Circle already started',
  113: 'Not enough members',
  114: 'Payout already claimed',
  115: 'Round not complete',
  200: 'NFT not found',
  201: 'Not NFT owner',
  202: 'NFT not for sale',
  203: 'Invalid price',
  300: 'Governance proposal not found',
  301: 'Voting period ended',
  302: 'Already voted',
  400: 'Emergency mode active',
  401: 'Not in emergency mode',
};

// Function names for common operations
export const FUNCTIONS = {
  // Core
  CREATE_CIRCLE: 'create-circle',
  JOIN_CIRCLE: 'join-circle',
  CONTRIBUTE: 'contribute',
  CLAIM_PAYOUT: 'claim-payout',
  GET_CIRCLE: 'get-circle',
  GET_MEMBER: 'get-member',
  GET_CIRCLES_BY_MEMBER: 'get-circles-by-member',
  
  // Escrow
  GET_ESCROW_BALANCE: 'get-escrow-balance',
  DEPOSIT: 'deposit',
  WITHDRAW: 'withdraw',
  
  // NFT
  MINT_COMPLETION_NFT: 'mint-completion-nft',
  GET_NFT_METADATA: 'get-nft-metadata',
  LIST_NFT: 'list-nft',
  BUY_NFT: 'buy-nft',
  
  // Reputation
  GET_REPUTATION: 'get-reputation',
  GET_TIER: 'get-tier',
  
  // Governance
  CREATE_PROPOSAL: 'create-proposal',
  VOTE: 'vote',
  EXECUTE_PROPOSAL: 'execute-proposal',
} as const;

export type ContractName = keyof typeof CONTRACTS;
export type CircleStatus = typeof CIRCLE_STATUS[keyof typeof CIRCLE_STATUS];
export type MemberStatus = typeof MEMBER_STATUS[keyof typeof MEMBER_STATUS];
