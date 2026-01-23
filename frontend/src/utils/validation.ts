// Form validation utilities

export interface ValidationRule {
  validate: (value: any) => boolean;
  message: string;
}

export interface ValidationResult {
  isValid: boolean;
  errors: string[];
}

/**
 * Required field validation
 */
export function required(message: string = 'This field is required'): ValidationRule {
  return {
    validate: (value: any) => {
      if (value === null || value === undefined) return false;
      if (typeof value === 'string') return value.trim().length > 0;
      if (Array.isArray(value)) return value.length > 0;
      return true;
    },
    message,
  };
}

/**
 * Minimum length validation
 */
export function minLength(min: number, message?: string): ValidationRule {
  return {
    validate: (value: any) => {
      if (!value) return true; // Let required handle empty
      return String(value).length >= min;
    },
    message: message || `Must be at least ${min} characters`,
  };
}

/**
 * Maximum length validation
 */
export function maxLength(max: number, message?: string): ValidationRule {
  return {
    validate: (value: any) => {
      if (!value) return true;
      return String(value).length <= max;
    },
    message: message || `Must be at most ${max} characters`,
  };
}

/**
 * Minimum value validation
 */
export function min(minValue: number, message?: string): ValidationRule {
  return {
    validate: (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) >= minValue;
    },
    message: message || `Must be at least ${minValue}`,
  };
}

/**
 * Maximum value validation
 */
export function max(maxValue: number, message?: string): ValidationRule {
  return {
    validate: (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) <= maxValue;
    },
    message: message || `Must be at most ${maxValue}`,
  };
}

/**
 * Pattern validation
 */
export function pattern(regex: RegExp, message: string): ValidationRule {
  return {
    validate: (value: any) => {
      if (!value) return true;
      return regex.test(String(value));
    },
    message,
  };
}

/**
 * Email validation
 */
export function email(message: string = 'Invalid email address'): ValidationRule {
  return pattern(
    /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    message
  );
}

/**
 * Stacks address validation
 */
export function stacksAddress(message: string = 'Invalid Stacks address'): ValidationRule {
  return pattern(
    /^(SP|ST)[0-9A-HJ-NP-Z]{38,40}$/,
    message
  );
}

/**
 * Positive number validation
 */
export function positive(message: string = 'Must be a positive number'): ValidationRule {
  return {
    validate: (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      return Number(value) > 0;
    },
    message,
  };
}

/**
 * Integer validation
 */
export function integer(message: string = 'Must be a whole number'): ValidationRule {
  return {
    validate: (value: any) => {
      if (value === null || value === undefined || value === '') return true;
      return Number.isInteger(Number(value));
    },
    message,
  };
}

/**
 * Circle name validation
 */
export function circleName(): ValidationRule[] {
  return [
    required('Circle name is required'),
    minLength(3, 'Circle name must be at least 3 characters'),
    maxLength(50, 'Circle name must be at most 50 characters'),
    pattern(/^[a-zA-Z0-9\s\-_]+$/, 'Circle name can only contain letters, numbers, spaces, hyphens, and underscores'),
  ];
}

/**
 * Contribution amount validation
 */
export function contributionAmount(): ValidationRule[] {
  return [
    required('Contribution amount is required'),
    positive('Contribution must be greater than 0'),
    min(0.1, 'Minimum contribution is 0.1 STX'),
    max(10000, 'Maximum contribution is 10,000 STX'),
  ];
}

/**
 * Max members validation
 */
export function maxMembers(): ValidationRule[] {
  return [
    required('Maximum members is required'),
    integer('Must be a whole number'),
    min(2, 'Minimum 2 members required'),
    max(20, 'Maximum 20 members allowed'),
  ];
}

/**
 * Payout interval validation
 */
export function payoutInterval(): ValidationRule[] {
  return [
    required('Payout interval is required'),
    integer('Must be a whole number'),
    min(1, 'Minimum 1 day interval'),
    max(30, 'Maximum 30 day interval'),
  ];
}

/**
 * Validate a value against rules
 */
export function validate(value: any, rules: ValidationRule[]): ValidationResult {
  const errors: string[] = [];
  
  for (const rule of rules) {
    if (!rule.validate(value)) {
      errors.push(rule.message);
    }
  }
  
  return {
    isValid: errors.length === 0,
    errors,
  };
}

/**
 * Validate an object against field rules
 */
export function validateForm<T extends Record<string, any>>(
  values: T,
  fieldRules: Partial<Record<keyof T, ValidationRule[]>>
): Record<keyof T, ValidationResult> {
  const results = {} as Record<keyof T, ValidationResult>;
  
  for (const [field, rules] of Object.entries(fieldRules)) {
    if (rules) {
      results[field as keyof T] = validate(values[field], rules as ValidationRule[]);
    }
  }
  
  return results;
}

/**
 * Check if form is valid
 */
export function isFormValid<T extends Record<string, any>>(
  results: Record<keyof T, ValidationResult>
): boolean {
  return Object.values(results).every(r => (r as ValidationResult).isValid);
}

/**
 * Get first error for a field
 */
export function getFirstError(result: ValidationResult): string | undefined {
  return result.errors[0];
}
