/**
 * Validation utilities for form inputs and data
 * 
 * Provides reusable validation functions for:
 * - Stacks addresses
 * - Circle creation forms
 * - General input validation
 * 
 * @module lib/validation
 */

// ============================================================
// Address Validation
// ============================================================

/**
 * Validate a Stacks blockchain address
 * @param address - The address to validate
 * @returns true if valid Stacks address (SP for mainnet, ST for testnet)
 */
export function isValidStacksAddress(address: string): boolean {
  const stacksAddressRegex = /^(SP|ST)[A-Z0-9]{38,39}$/;
  return stacksAddressRegex.test(address);
}

// ============================================================
// Circle Validation
// ============================================================

/**
 * Validate a circle name
 * @param name - Circle name to validate
 * @returns Validation result with error message if invalid
 */
export function isValidCircleName(name: string): { valid: boolean; error?: string } {
  if (!name || name.trim().length === 0) {
    return { valid: false, error: 'Circle name is required' };
  }
  if (name.length < 3) {
    return { valid: false, error: 'Circle name must be at least 3 characters' };
  }
  if (name.length > 50) {
    return { valid: false, error: 'Circle name must be less than 50 characters' };
  }
  const validNameRegex = /^[a-zA-Z0-9\s\-_.']+$/;
  if (!validNameRegex.test(name)) {
    return { valid: false, error: 'Circle name contains invalid characters' };
  }
  return { valid: true };
}

/**
 * Validate contribution amount in STX
 * @param amount - Amount to validate
 * @param min - Minimum allowed (default: 10 STX)
 * @param max - Maximum allowed (default: 100,000 STX)
 */
export function isValidContribution(
  amount: number,
  min = 10,
  max = 100000
): { valid: boolean; error?: string } {
  if (isNaN(amount) || amount <= 0) {
    return { valid: false, error: 'Please enter a valid amount' };
  }
  if (amount < min) {
    return { valid: false, error: `Minimum contribution is ${min} STX` };
  }
  if (amount > max) {
    return { valid: false, error: `Maximum contribution is ${max} STX` };
  }
  return { valid: true };
}

/**
 * Validate circle member count
 * @param count - Number of members
 * @param min - Minimum members (default: 2)
 * @param max - Maximum members (default: 20)
 */
export function isValidMemberCount(
  count: number,
  min = 2,
  max = 20
): { valid: boolean; error?: string } {
  if (!Number.isInteger(count)) {
    return { valid: false, error: 'Member count must be a whole number' };
  }
  if (count < min) {
    return { valid: false, error: `Minimum ${min} members required` };
  }
  if (count > max) {
    return { valid: false, error: `Maximum ${max} members allowed` };
  }
  return { valid: true };
}

// ============================================================
// General Validation
// ============================================================

/**
 * Validate email address format
 * @param email - Email to validate
 */
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

/**
 * Validate URL format
 * @param url - URL to validate
 */
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if value is within a numeric range
 * @param value - Number to check
 * @param min - Minimum value (inclusive)
 * @param max - Maximum value (inclusive)
 */
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

/**
 * Check if a value is present (not empty)
 * @param value - Value to check
 */
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// ============================================================
// Form Validation
// ============================================================

/** Result of form validation */
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

/** Validation rule function type */
export type ValidationRule = (value: unknown) => { valid: boolean; error?: string };

/**
 * Validate an entire form object against rules
 * @param data - Form data object
 * @param rules - Validation rules for each field
 * @returns Validation result with all errors
 */
export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, ValidationRule>
): ValidationResult {
  const errors: Record<string, string> = {};
  let valid = true;

  for (const field of Object.keys(rules) as Array<keyof T>) {
    const result = rules[field](data[field]);
    if (!result.valid && result.error) {
      errors[field as string] = result.error;
      valid = false;
    }
  }

  return { valid, errors };
}
