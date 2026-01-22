/**
 * Validation utilities for form inputs and data
 */

// Stacks address validation
export function isValidStacksAddress(address: string): boolean {
  // Stacks addresses start with SP (mainnet) or ST (testnet)
  const stacksAddressRegex = /^(SP|ST)[A-Z0-9]{38,39}$/;
  return stacksAddressRegex.test(address);
}

// Circle name validation
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
  // Only allow alphanumeric, spaces, and common punctuation
  const validNameRegex = /^[a-zA-Z0-9\s\-_.']+$/;
  if (!validNameRegex.test(name)) {
    return { valid: false, error: 'Circle name contains invalid characters' };
  }
  return { valid: true };
}

// Contribution amount validation
export function isValidContribution(amount: number, min = 10, max = 100000): { valid: boolean; error?: string } {
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

// Member count validation
export function isValidMemberCount(count: number, min = 2, max = 20): { valid: boolean; error?: string } {
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

// Email validation
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
}

// URL validation
export function isValidUrl(url: string): boolean {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

// Number range validation
export function isInRange(value: number, min: number, max: number): boolean {
  return value >= min && value <= max;
}

// Required field validation
export function isRequired(value: unknown): boolean {
  if (value === null || value === undefined) return false;
  if (typeof value === 'string') return value.trim().length > 0;
  if (Array.isArray(value)) return value.length > 0;
  return true;
}

// Combined validator
export interface ValidationResult {
  valid: boolean;
  errors: Record<string, string>;
}

export function validateForm<T extends Record<string, unknown>>(
  data: T,
  rules: Record<keyof T, (value: unknown) => { valid: boolean; error?: string }>
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
