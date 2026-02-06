/**
 * Error Handling Utilities
 * Centralized error handling and user-friendly messages
 */

export interface AppError {
  code: string;
  message: string;
  details?: any;
}

export function parseContractError(error: any): AppError {
  // Parse Clarity error codes
  if (typeof error === 'object' && error.value) {
    const errorCode = Number(error.value);
    return {
      code: `CONTRACT_ERROR_${errorCode}`,
      message: getErrorMessage(errorCode),
      details: error,
    };
  }
  
  // Parse transaction errors
  if (error?.tx_result) {
    return {
      code: 'TRANSACTION_FAILED',
      message: 'Transaction failed. Please try again.',
      details: error.tx_result,
    };
  }
  
  // Default error
  return {
    code: 'UNKNOWN_ERROR',
    message: error?.message || 'An unexpected error occurred',
    details: error,
  };
}

function getErrorMessage(errorCode: number): string {
  const messages: Record<number, string> = {
    100: 'You do not have permission for this action',
    101: 'Circle is already full',
    102: 'Invalid contribution amount',
    103: 'Circle not found',
    104: 'You are not a member of this circle',
    105: 'Cannot withdraw at this time',
    106: 'Insufficient balance',
    107: 'Circle is not active',
    108: 'Invalid duration',
    109: 'Maximum members exceeded',
    110: 'Contribution period ended',
  };
  
  return messages[errorCode] || `Error code: ${errorCode}`;
}

export function logError(error: any, context?: string): void {
  console.error(`[${context || 'Error'}]:`, error);
  
  // In production, send to error tracking service
  if (import.meta.env.PROD) {
    // sendToErrorTracking(error, context);
  }
}
