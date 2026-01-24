/**
 * StackSusu Error Codes
 * Maps contract error codes to user-friendly messages
 */

// Core Contract Errors (1000-1099)
export const CORE_ERRORS: Record<number, string> = {
  1000: 'Not authorized to perform this action',
  1001: 'Circle not found',
  1002: 'Circle is full',
  1003: 'Circle is not pending',
  1004: 'Already a member of this circle',
  1005: 'Not a member of this circle',
  1006: 'Invalid contribution amount',
  1007: 'Invalid member count (must be 3-50)',
  1008: 'Invalid payout interval (must be 1-30 days)',
  1015: 'Circle is not active',
  1016: 'Circle has not started yet',
  1020: 'Invalid circle status',
  1021: 'Protocol is paused',
  1025: 'Invalid contribution mode',
  1026: 'Maximum circles limit reached',
  1027: 'Reputation score too low to join this circle',
  1028: 'Invalid reputation requirement',
};

// Escrow Contract Errors
export const ESCROW_ERRORS: Record<number, string> = {
  1009: 'Already deposited to this circle',
  1010: 'Deposit required before this action',
  1011: 'Insufficient deposit amount',
  1012: 'Payout is not yet due',
  1013: 'Payout already claimed for this round',
  1014: 'Not your turn for payout',
  1017: 'STX transfer failed',
  1018: 'Invalid payout amount',
  1019: 'Round not ready for payout',
  1023: 'Amount cannot be zero',
  1024: 'Insufficient balance in escrow',
  1029: 'Invalid round number',
  1030: 'Not all contributions received yet',
  1031: 'Already contributed this round',
  1032: 'Round contribution not open',
};

// Reputation Contract Errors (2000+)
export const REPUTATION_ERRORS: Record<number, string> = {
  2000: 'Not authorized for reputation updates',
  2001: 'Member not found in reputation system',
  2002: 'Invalid reputation score value',
  2003: 'Reputation already initialized',
};

// Referral Contract Errors (3000+)
export const REFERRAL_ERRORS: Record<number, string> = {
  3000: 'Referral program not active',
  3001: 'Already referred by someone else',
  3002: 'Cannot refer yourself',
  3003: 'Referrer not found',
  3004: 'No pending referral rewards',
  3005: 'Referral reward already claimed',
};

// Governance Contract Errors (4000+)
export const GOVERNANCE_ERRORS: Record<number, string> = {
  4000: 'Governance not enabled for this circle',
  4001: 'Invalid proposal type',
  4002: 'Proposal not found',
  4003: 'Already voted on this proposal',
  4004: 'Proposal voting period has expired',
  4005: 'Proposal already executed',
  4006: 'Quorum not reached',
  4007: 'Only circle members can vote',
};

// NFT Contract Errors (5000+)
export const NFT_ERRORS: Record<number, string> = {
  5000: 'NFT not enabled for this circle',
  5001: 'Token not found',
  5002: 'Token not listed for sale',
  5003: 'Not the token owner',
  5004: 'Insufficient payment for NFT',
  5005: 'Cannot transfer during active round',
  5006: 'Listing expired',
};

// Emergency Contract Errors (6000+)
export const EMERGENCY_ERRORS: Record<number, string> = {
  6000: 'Emergency withdrawal not available',
  6001: 'Still in cooldown period',
  6002: 'Maximum emergency exits reached for this circle',
  6003: 'No funds available for emergency withdrawal',
  6004: 'Emergency request already pending',
};

// Combined error lookup
export const ALL_ERRORS: Record<number, string> = {
  ...CORE_ERRORS,
  ...ESCROW_ERRORS,
  ...REPUTATION_ERRORS,
  ...REFERRAL_ERRORS,
  ...GOVERNANCE_ERRORS,
  ...NFT_ERRORS,
  ...EMERGENCY_ERRORS,
};

/**
 * Get human-readable error message from error code
 */
export function getErrorMessage(code: number): string {
  return ALL_ERRORS[code] || `Unknown error (code: ${code})`;
}

/**
 * Parse error from contract response
 */
export function parseContractError(error: unknown): string {
  if (typeof error === 'number') {
    return getErrorMessage(error);
  }
  if (typeof error === 'object' && error !== null) {
    const err = error as { value?: number; message?: string };
    if (err.value) return getErrorMessage(err.value);
    if (err.message) return err.message;
  }
  return 'An unexpected error occurred';
}
