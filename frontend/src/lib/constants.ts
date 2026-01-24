/**
 * Application Constants
 * 
 * Centralized constants for the StackSUSU application.
 * Includes configuration values, UI strings, and limits.
 * 
 * @module lib/constants
 */

// ============================================================
// Circle Configuration
// ============================================================

/** Available contribution frequency options */
export const CONTRIBUTION_FREQUENCIES = [
  { value: 'daily', label: 'Daily' },
  { value: 'weekly', label: 'Weekly' },
  { value: 'biweekly', label: 'Bi-Weekly' },
  { value: 'monthly', label: 'Monthly' },
] as const;

/** Circle status values */
export const CIRCLE_STATUSES = {
  OPEN: 'open',
  ACTIVE: 'active',
  PAUSED: 'paused',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
} as const;

/** Member role values */
export const MEMBER_ROLES = {
  ADMIN: 'admin',
  MEMBER: 'member',
} as const;

/** Transaction type values */
export const TRANSACTION_TYPES = {
  DEPOSIT: 'deposit',
  PAYOUT: 'payout',
  REFUND: 'refund',
  FEE: 'fee',
} as const;

// ============================================================
// Limits & Validation
// ============================================================

/** Application limits for validation */
export const LIMITS = {
  MIN_MEMBERS: 2,
  MAX_MEMBERS: 20,
  MIN_CONTRIBUTION: 10,      // 10 STX
  MAX_CONTRIBUTION: 100000,  // 100,000 STX
  MIN_NAME_LENGTH: 3,
  MAX_NAME_LENGTH: 50,
} as const;

// ============================================================
// Storage & API
// ============================================================

/** Local storage keys */
export const STORAGE_KEYS = {
  SETTINGS: 'stacksusu-settings',
  THEME: 'stacksusu-theme',
  WALLET: 'stacksusu-wallet',
  RECENT_CIRCLES: 'stacksusu-recent-circles',
} as const;

/** External API endpoints */
export const API_ENDPOINTS = {
  STACKS_API: 'https://api.mainnet.hiro.so',
  EXPLORER: 'https://explorer.stacks.co',
} as const;

// ============================================================
// UI Strings
// ============================================================

/** Error messages for user display */
export const ERROR_MESSAGES = {
  WALLET_NOT_CONNECTED: 'Please connect your wallet to continue',
  INSUFFICIENT_BALANCE: 'Insufficient balance for this transaction',
  CIRCLE_FULL: 'This circle is already full',
  ALREADY_MEMBER: 'You are already a member of this circle',
  NOT_MEMBER: 'You are not a member of this circle',
  CONTRIBUTION_MISSED: 'You have missed a contribution deadline',
  NETWORK_ERROR: 'Network error. Please try again.',
  UNKNOWN_ERROR: 'An unexpected error occurred',
} as const;

/** Success messages for user display */
export const SUCCESS_MESSAGES = {
  WALLET_CONNECTED: 'Wallet connected successfully',
  CONTRIBUTION_MADE: 'Contribution submitted successfully',
  CIRCLE_CREATED: 'Circle created successfully',
  CIRCLE_JOINED: 'Successfully joined the circle',
  SETTINGS_SAVED: 'Settings saved successfully',
} as const;

// ============================================================
// Type Exports
// ============================================================

/** Type for contribution frequency values */
export type ContributionFrequency = typeof CONTRIBUTION_FREQUENCIES[number]['value'];

/** Type for circle status values */
export type CircleStatus = typeof CIRCLE_STATUSES[keyof typeof CIRCLE_STATUSES];

/** Type for member role values */
export type MemberRole = typeof MEMBER_ROLES[keyof typeof MEMBER_ROLES];

/** Type for transaction type values */
export type TransactionType = typeof TRANSACTION_TYPES[keyof typeof TRANSACTION_TYPES];
