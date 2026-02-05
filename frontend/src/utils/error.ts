/**
 * Error Handling Utility
 * 
 * Centralized error handling system for the StackSUSU application.
 * Provides error classification, user-friendly messages, and error tracking.
 * 
 * @module utils/error
 * 
 * @example
 * ```typescript
 * import { errorHandler, AppError } from '@/utils/error';
 * 
 * try {
 *   await riskyOperation();
 * } catch (err) {
 *   const appError = errorHandler.handle(err, { context: 'circleCreation' });
 *   showToast(appError.userMessage);
 * }
 * ```
 */

import { analytics } from './analytics';
import { logger } from './logger';

/** Error severity levels */
export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';

/** Error categories */
export type ErrorCategory = 
  | 'network'
  | 'blockchain'
  | 'validation'
  | 'authentication'
  | 'authorization'
  | 'not_found'
  | 'unknown';

/** Application error structure */
export interface AppError {
  code: string;
  message: string;
  userMessage: string;
  category: ErrorCategory;
  severity: ErrorSeverity;
  originalError?: Error;
  context?: Record<string, unknown>;
  recoverable: boolean;
}

/** Error handler options */
interface ErrorHandlerOptions {
  context?: Record<string, unknown>;
  showToast?: boolean;
  logToAnalytics?: boolean;
}

/** Default user-friendly error messages */
const defaultMessages: Record<ErrorCategory, string> = {
  network: 'Network connection issue. Please check your internet and try again.',
  blockchain: 'Blockchain transaction failed. Please verify your wallet balance and try again.',
  validation: 'Invalid input provided. Please check your entries and try again.',
  authentication: 'Please connect your wallet to continue.',
  authorization: 'You do not have permission to perform this action.',
  not_found: 'The requested resource was not found.',
  unknown: 'An unexpected error occurred. Please try again later.',
};

/**
 * Create an application error
 * @param category Error category
 * @param code Error code
 * @param message Technical message
 * @param options Additional options
 */
export function createError(
  category: ErrorCategory,
  code: string,
  message: string,
  options?: {
    userMessage?: string;
    severity?: ErrorSeverity;
    originalError?: Error;
    context?: Record<string, unknown>;
    recoverable?: boolean;
  }
): AppError {
  return {
    code,
    message,
    userMessage: options?.userMessage || defaultMessages[category],
    category,
    severity: options?.severity || 'medium',
    originalError: options?.originalError,
    context: options?.context,
    recoverable: options?.recoverable ?? true,
  };
}

/**
 * Classify an error into a category
 * @param error Error to classify
 */
function classifyError(error: Error): ErrorCategory {
  const message = error.message.toLowerCase();
  
  if (message.includes('network') || message.includes('fetch') || message.includes('connection')) {
    return 'network';
  }
  
  if (message.includes('stx') || message.includes('contract') || message.includes('transaction')) {
    return 'blockchain';
  }
  
  if (message.includes('validation') || message.includes('invalid') || message.includes('required')) {
    return 'validation';
  }
  
  if (message.includes('auth') || message.includes('unauthorized') || message.includes('forbidden')) {
    return 'authorization';
  }
  
  if (message.includes('not found') || message.includes('404')) {
    return 'not_found';
  }
  
  if (message.includes('wallet') || message.includes('connect')) {
    return 'authentication';
  }
  
  return 'unknown';
}

/**
 * Handle an error and convert to AppError
 * @param error Error to handle
 * @param options Handler options
 */
export function handleError(
  error: unknown,
  options?: ErrorHandlerOptions
): AppError {
  const context = options?.context || {};
  
  // If already an AppError, just log and return
  if (isAppError(error)) {
    logError(error, options);
    return error;
  }
  
  // Convert to Error if needed
  const err = error instanceof Error ? error : new Error(String(error));
  const category = classifyError(err);
  
  // Create AppError based on category
  const appError = createError(
    category,
    `ERR_${category.toUpperCase()}_001`,
    err.message,
    {
      originalError: err,
      context,
      severity: getSeverityForCategory(category),
    }
  );
  
  logError(appError, options);
  
  return appError;
}

/**
 * Check if error is an AppError
 * @param error Error to check
 */
function isAppError(error: unknown): error is AppError {
  return (
    typeof error === 'object' &&
    error !== null &&
    'code' in error &&
    'category' in error &&
    'severity' in error
  );
}

/**
 * Get severity for error category
 * @param category Error category
 */
function getSeverityForCategory(category: ErrorCategory): ErrorSeverity {
  switch (category) {
    case 'critical':
      return 'critical';
    case 'blockchain':
    case 'authorization':
      return 'high';
    case 'network':
    case 'validation':
      return 'medium';
    default:
      return 'low';
  }
}

/**
 * Log error to various destinations
 * @param error AppError to log
 * @param options Logging options
 */
function logError(error: AppError, options?: ErrorHandlerOptions): void {
  // Log to console
  logger.error(error.message, error.originalError, error.context);
  
  // Track in analytics if enabled
  if (options?.logToAnalytics !== false) {
    analytics.trackError(error.category, error.message, {
      code: error.code,
      severity: error.severity,
      ...error.context,
    });
  }
}

/**
 * Wrap a function with error handling
 * @param fn Function to wrap
 * @param options Error handler options
 */
export function withErrorHandling<T, Args extends unknown[]>(
  fn: (...args: Args) => Promise<T>,
  options?: ErrorHandlerOptions
): (...args: Args) => Promise<T> {
  return async (...args: Args): Promise<T> => {
    try {
      return await fn(...args);
    } catch (err) {
      const appError = handleError(err, {
        ...options,
        context: {
          ...options?.context,
          functionArgs: args,
        },
      });
      
      throw appError;
    }
  };
}

/**
 * Safe async operation wrapper
 * @param promise Promise to wrap
 * @param options Error handler options
 */
export async function safeAsync<T>(
  promise: Promise<T>,
  options?: ErrorHandlerOptions
): Promise<{ data: T | null; error: AppError | null }> {
  try {
    const data = await promise;
    return { data, error: null };
  } catch (err) {
    const error = handleError(err, options);
    return { data: null, error };
  }
}

/**
 * Create error boundary for React components
 * @param componentName Name of the component
 */
export function createErrorBoundary(componentName: string) {
  return {
    onError: (error: Error, errorInfo: { componentStack: string }) => {
      handleError(error, {
        context: {
          component: componentName,
          componentStack: errorInfo.componentStack,
        },
        severity: 'high',
      });
    },
  };
}

/** Common blockchain errors */
export const blockchainErrors = {
  INSUFFICIENT_FUNDS: createError(
    'blockchain',
    'ERR_BLOCKCHAIN_INSUFFICIENT_FUNDS',
    'Insufficient STX balance for transaction',
    { userMessage: 'You do not have enough STX to complete this transaction. Please add funds to your wallet.', severity: 'high' }
  ),
  
  TRANSACTION_FAILED: createError(
    'blockchain',
    'ERR_BLOCKCHAIN_TX_FAILED',
    'Transaction failed on chain',
    { userMessage: 'Your transaction failed. Please try again or contact support.', severity: 'high' }
  ),
  
  USER_REJECTED: createError(
    'blockchain',
    'ERR_BLOCKCHAIN_USER_REJECTED',
    'User rejected transaction',
    { userMessage: 'You declined the transaction in your wallet. No changes were made.', severity: 'low', recoverable: true }
  ),
  
  CONTRACT_CALL_FAILED: createError(
    'blockchain',
    'ERR_BLOCKCHAIN_CONTRACT_CALL',
    'Smart contract call failed',
    { userMessage: 'The smart contract call failed. This might be a temporary issue.', severity: 'medium' }
  ),
};

/** Error handler API */
export const errorHandler = {
  handle: handleError,
  create: createError,
  withHandling: withErrorHandling,
  safeAsync,
  createErrorBoundary,
  blockchainErrors,
};
