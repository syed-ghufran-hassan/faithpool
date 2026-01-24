/**
 * StackSusu Contract Configuration
 * Centralized contract addresses for mainnet and testnet
 */

export const DEPLOYER_MAINNET = 'SP3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';
export const DEPLOYER_TESTNET = 'ST3FKNEZ86RG5RT7SZ5FBRGH85FZNG94ZH1MCGG6N';

export type NetworkType = 'mainnet' | 'testnet';

export interface ContractAddresses {
  core: string;
  escrow: string;
  admin: string;
  reputation: string;
  referral: string;
  nft: string;
  governance: string;
  emergency: string;
  traits: string;
}

const createAddresses = (deployer: string): ContractAddresses => ({
  core: `${deployer}.stacksusu-core-v5`,
  escrow: `${deployer}.stacksusu-escrow-v5`,
  admin: `${deployer}.stacksusu-admin-v5`,
  reputation: `${deployer}.stacksusu-reputation-v5`,
  referral: `${deployer}.stacksusu-referral-v5`,
  nft: `${deployer}.stacksusu-nft-v5`,
  governance: `${deployer}.stacksusu-governance-v5`,
  emergency: `${deployer}.stacksusu-emergency-v5`,
  traits: `${deployer}.stacksusu-traits-v3`,
});

export const CONTRACTS: Record<NetworkType, ContractAddresses> = {
  mainnet: createAddresses(DEPLOYER_MAINNET),
  testnet: createAddresses(DEPLOYER_TESTNET),
};

/**
 * Get contract addresses for a specific network
 */
export function getContracts(network: NetworkType = 'mainnet'): ContractAddresses {
  return CONTRACTS[network];
}

/**
 * Get deployer address for a specific network
 */
export function getDeployer(network: NetworkType = 'mainnet'): string {
  return network === 'mainnet' ? DEPLOYER_MAINNET : DEPLOYER_TESTNET;
}

/**
 * Parse a full contract identifier into parts
 */
export function parseContractId(contractId: string): {
  deployer: string;
  name: string;
} {
  const [deployer, name] = contractId.split('.');
  return { deployer, name };
}

/**
 * Build a full contract identifier
 */
export function buildContractId(network: NetworkType, contractName: keyof ContractAddresses): string {
  const deployer = getDeployer(network);
  return `${deployer}.stacksusu-${contractName}-v5`;
}

// Contract function names for type-safe calls
export const CONTRACT_FUNCTIONS = {
  core: {
    createCircle: 'create-circle',
    createCircleSimple: 'create-circle-simple',
    joinCircle: 'join-circle',
    joinCircleWithReferral: 'join-circle-with-referral',
    startCircle: 'start-circle',
    getCircleInfo: 'get-circle-info',
    getCircleCount: 'get-circle-count',
    isMember: 'is-member',
    getMemberSlot: 'get-member-slot',
  },
  escrow: {
    deposit: 'deposit',
    claimPayout: 'claim-payout',
    contributeRound: 'contribute-round',
    getDeposit: 'get-deposit',
    hasDeposited: 'has-deposited',
    getRoundContribution: 'get-round-contribution',
  },
  admin: {
    setProtocolPaused: 'set-protocol-paused',
    setFeePercentage: 'set-fee-percentage',
    isProtocolPaused: 'is-protocol-paused',
    getFeePercentage: 'get-fee-percentage',
  },
  reputation: {
    getReputation: 'get-reputation',
    getMemberScore: 'get-member-score',
  },
  referral: {
    getReferralInfo: 'get-referral-info',
    getReferrerStats: 'get-referrer-stats',
    claimRewards: 'claim-rewards',
  },
} as const;
