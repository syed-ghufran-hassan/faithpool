/**
 * Error Service
 * 
 * Centralized error handling and reporting.
 */

export type ErrorSeverity = 'low' | 'medium' | 'high' | 'critical';
export type ErrorCategory = 'network' | 'contract' | 'wallet' | 'validation' | 'auth' | 'unknown';

export interface AppError {
  id: string;
  message: string;
  code?: string;
  severity: ErrorSeverity;
  category: ErrorCategory;
  timestamp: Date;
  context?: Record<string, unknown>;
  stack?: string;
  originalError?: Error;
}

export interface ErrorHandler {
  (error: AppError): void | Promise<void>;
}

// Common error codes for the app
export const ErrorCodes = {
  // Network errors
  NETWORK_TIMEOUT: 'NETWORK_TIMEOUT',
  NETWORK_OFFLINE: 'NETWORK_OFFLINE',
  API_ERROR: 'API_ERROR',
  
  // Wallet errors
  WALLET_NOT_CONNECTED: 'WALLET_NOT_CONNECTED',
  WALLET_REJECTED: 'WALLET_REJECTED',
  INSUFFICIENT_FUNDS: 'INSUFFICIENT_FUNDS',
  
  // Contract errors
  CONTRACT_CALL_FAILED: 'CONTRACT_CALL_FAILED',
  CONTRACT_NOT_FOUND: 'CONTRACT_NOT_FOUND',
  INVALID_CONTRACT_STATE: 'INVALID_CONTRACT_STATE',
  
  // Circle errors
  CIRCLE_NOT_FOUND: 'CIRCLE_NOT_FOUND',
  CIRCLE_FULL: 'CIRCLE_FULL',
  ALREADY_MEMBER: 'ALREADY_MEMBER',
  NOT_MEMBER: 'NOT_MEMBER',
  ROUND_NOT_ACTIVE: 'ROUND_NOT_ACTIVE',
  ALREADY_CONTRIBUTED: 'ALREADY_CONTRIBUTED',
  
  // Auth errors
  UNAUTHORIZED: 'UNAUTHORIZED',
  SESSION_EXPIRED: 'SESSION_EXPIRED',
  
  // Validation errors
  INVALID_INPUT: 'INVALID_INPUT',
  INVALID_ADDRESS: 'INVALID_ADDRESS',
  INVALID_AMOUNT: 'INVALID_AMOUNT',
} as const;

// User-friendly error messages
const ErrorMessages: Record<string, string> = {
  [ErrorCodes.NETWORK_TIMEOUT]: 'Request timed out. Please try again.',
  [ErrorCodes.NETWORK_OFFLINE]: 'No internet connection. Please check your network.',
  [ErrorCodes.API_ERROR]: 'Server error. Please try again later.',
  [ErrorCodes.WALLET_NOT_CONNECTED]: 'Please connect your wallet to continue.',
  [ErrorCodes.WALLET_REJECTED]: 'Transaction was rejected in your wallet.',
  [ErrorCodes.INSUFFICIENT_FUNDS]: 'Insufficient STX balance for this transaction.',
  [ErrorCodes.CONTRACT_CALL_FAILED]: 'Contract call failed. Please try again.',
  [ErrorCodes.CIRCLE_NOT_FOUND]: 'Circle not found.',
  [ErrorCodes.CIRCLE_FULL]: 'This circle is already full.',
  [ErrorCodes.ALREADY_MEMBER]: 'You are already a member of this circle.',
  [ErrorCodes.NOT_MEMBER]: 'You are not a member of this circle.',
  [ErrorCodes.ROUND_NOT_ACTIVE]: 'The current round is not active.',
  [ErrorCodes.ALREADY_CONTRIBUTED]: 'You have already contributed this round.',
  [ErrorCodes.UNAUTHORIZED]: 'You are not authorized to perform this action.',
  [ErrorCodes.SESSION_EXPIRED]: 'Your session has expired. Please reconnect.',
  [ErrorCodes.INVALID_INPUT]: 'Invalid input. Please check your entries.',
  [ErrorCodes.INVALID_ADDRESS]: 'Invalid wallet address.',
  [ErrorCodes.INVALID_AMOUNT]: 'Invalid amount. Please enter a valid number.',
};

class ErrorService {
  private handlers: ErrorHandler[] = [];
  private errorLog: AppError[] = [];
  private maxLogSize = 100;

  /**
   * Generate unique error ID
   */
  private generateId(): string {
    return `err_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }

  /**
   * Register an error handler
   */
  addHandler(handler: ErrorHandler): () => void {
    this.handlers.push(handler);
    return () => {
      this.handlers = this.handlers.filter(h => h !== handler);
    };
  }

  /**
   * Create and handle an error
   */
  report(
    error: Error | string,
    options: {
      code?: string;
      severity?: ErrorSeverity;
      category?: ErrorCategory;
      context?: Record<string, unknown>;
    } = {}
  ): AppError {
    const {
      code,
      severity = 'medium',
      category = 'unknown',
      context,
    } = options;

    const originalError = error instanceof Error ? error : undefined;
    const message = error instanceof Error ? error.message : error;

    const appError: AppError = {
      id: this.generateId(),
      message: code ? ErrorMessages[code] || message : message,
      code,
      severity,
      category,
      timestamp: new Date(),
      context,
      stack: originalError?.stack,
      originalError,
    };

    this.log(appError);
    this.notify(appError);

    return appError;
  }

  /**
   * Log error
   */
  private log(error: AppError): void {
    this.errorLog.unshift(error);
    
    // Trim log if too large
    if (this.errorLog.length > this.maxLogSize) {
      this.errorLog = this.errorLog.slice(0, this.maxLogSize);
    }

    // Console log in development
    if (import.meta.env.DEV) {
      console.error(`[${error.severity.toUpperCase()}] ${error.category}:`, error);
    }
  }

  /**
   * Notify handlers
   */
  private async notify(error: AppError): Promise<void> {
    for (const handler of this.handlers) {
      try {
        await handler(error);
      } catch (e) {
        console.error('Error handler failed:', e);
      }
    }
  }

  /**
   * Get error log
   */
  getLog(options?: { limit?: number; severity?: ErrorSeverity }): AppError[] {
    let log = [...this.errorLog];

    if (options?.severity) {
      log = log.filter(e => e.severity === options.severity);
    }

    if (options?.limit) {
      log = log.slice(0, options.limit);
    }

    return log;
  }

  /**
   * Clear error log
   */
  clearLog(): void {
    this.errorLog = [];
  }

  /**
   * Get user-friendly message for error code
   */
  getMessage(code: string): string {
    return ErrorMessages[code] || 'An unexpected error occurred.';
  }

  /**
   * Helper to parse Stacks/Clarity errors
   */
  parseContractError(error: unknown): AppError {
    const errorStr = String(error);
    
    // Parse common Clarity errors
    if (errorStr.includes('u101')) {
      return this.report('Circle not found', {
        code: ErrorCodes.CIRCLE_NOT_FOUND,
        category: 'contract',
        severity: 'medium',
      });
    }
    
    if (errorStr.includes('u102')) {
      return this.report('Circle is full', {
        code: ErrorCodes.CIRCLE_FULL,
        category: 'contract',
        severity: 'low',
      });
    }
    
    if (errorStr.includes('u103')) {
      return this.report('Already a member', {
        code: ErrorCodes.ALREADY_MEMBER,
        category: 'contract',
        severity: 'low',
      });
    }

    if (errorStr.includes('u104')) {
      return this.report('Not a member', {
        code: ErrorCodes.NOT_MEMBER,
        category: 'contract',
        severity: 'medium',
      });
    }

    // Generic contract error
    return this.report(errorStr, {
      code: ErrorCodes.CONTRACT_CALL_FAILED,
      category: 'contract',
      severity: 'high',
    });
  }
}

// Singleton instance
export const errorService = new ErrorService();

export default errorService;
