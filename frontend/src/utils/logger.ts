/**
 * Logger Utility
 * 
 * Centralized logging system for the StackSUSU application.
 * Provides structured logging with different log levels and
 * formatting for development and production environments.
 * 
 * @module utils/logger
 * 
 * @example
 * ```typescript
 * import { logger } from '@/utils/logger';
 * 
 * logger.info('User joined circle', { circleId: 1, user: 'SP...' });
 * logger.error('Transaction failed', error, { txId: '0x...' });
 * ```
 */

/** Log level types */
type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

/** Log entry structure */
interface LogEntry {
  timestamp: string;
  level: LogLevel;
  message: string;
  context?: Record<string, unknown>;
  error?: Error;
}

/** Logger configuration */
interface LoggerConfig {
  minLevel: LogLevel;
  enableConsole: boolean;
  enableRemote: boolean;
  remoteEndpoint?: string;
}

/** Default configuration */
const defaultConfig: LoggerConfig = {
  minLevel: process.env.NODE_ENV === 'production' ? 'info' : 'debug',
  enableConsole: true,
  enableRemote: false,
};

/** Log level priorities */
const levelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
  fatal: 4,
};

/**
 * Format log entry for output
 * @param entry Log entry to format
 */
function formatLogEntry(entry: LogEntry): string {
  const base = `[${entry.timestamp}] [${entry.level.toUpperCase()}] ${entry.message}`;
  
  if (entry.context && Object.keys(entry.context).length > 0) {
    return `${base} ${JSON.stringify(entry.context)}`;
  }
  
  return base;
}

/**
 * Send log to remote endpoint
 * @param entry Log entry to send
 */
async function sendToRemote(entry: LogEntry): Promise<void> {
  if (!defaultConfig.enableRemote || !defaultConfig.remoteEndpoint) return;
  
  try {
    await fetch(defaultConfig.remoteEndpoint, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(entry),
    });
  } catch (err) {
    // Silently fail to avoid infinite loops
    console.error('Failed to send log to remote:', err);
  }
}

/**
 * Core logging function
 * @param level Log level
 * @param message Log message
 * @param context Optional context data
 * @param error Optional error object
 */
function log(
  level: LogLevel,
  message: string,
  context?: Record<string, unknown>,
  error?: Error
): void {
  // Check minimum level
  if (levelPriority[level] < levelPriority[defaultConfig.minLevel]) {
    return;
  }
  
  const entry: LogEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    context,
    error,
  };
  
  // Console output
  if (defaultConfig.enableConsole) {
    const formatted = formatLogEntry(entry);
    
    switch (level) {
      case 'debug':
        console.debug(formatted, error || '');
        break;
      case 'info':
        console.info(formatted, error || '');
        break;
      case 'warn':
        console.warn(formatted, error || '');
        break;
      case 'error':
      case 'fatal':
        console.error(formatted, error || '');
        break;
    }
  }
  
  // Remote logging
  sendToRemote(entry).catch(() => {
    // Ignore errors
  });
}

/** Logger object with level-specific methods */
export const logger = {
  /**
   * Log debug message
   * @param message Log message
   * @param context Optional context
   */
  debug: (message: string, context?: Record<string, unknown>): void => {
    log('debug', message, context);
  },
  
  /**
   * Log info message
   * @param message Log message
   * @param context Optional context
   */
  info: (message: string, context?: Record<string, unknown>): void => {
    log('info', message, context);
  },
  
  /**
   * Log warning message
   * @param message Log message
   * @param context Optional context
   */
  warn: (message: string, context?: Record<string, unknown>): void => {
    log('warn', message, context);
  },
  
  /**
   * Log error message
   * @param message Log message
   * @param error Error object
   * @param context Optional context
   */
  error: (message: string, error?: Error, context?: Record<string, unknown>): void => {
    log('error', message, context, error);
  },
  
  /**
   * Log fatal message
   * @param message Log message
   * @param error Error object
   * @param context Optional context
   */
  fatal: (message: string, error?: Error, context?: Record<string, unknown>): void => {
    log('fatal', message, context, error);
  },
  
  /**
   * Configure logger settings
   * @param config New configuration
   */
  configure: (config: Partial<LoggerConfig>): void => {
    Object.assign(defaultConfig, config);
  },
  
  /**
   * Create a child logger with default context
   * @param defaultContext Context to include in all logs
   */
  child: (defaultContext: Record<string, unknown>) => ({
    debug: (message: string, context?: Record<string, unknown>) => {
      log('debug', message, { ...defaultContext, ...context });
    },
    info: (message: string, context?: Record<string, unknown>) => {
      log('info', message, { ...defaultContext, ...context });
    },
    warn: (message: string, context?: Record<string, unknown>) => {
      log('warn', message, { ...defaultContext, ...context });
    },
    error: (message: string, error?: Error, context?: Record<string, unknown>) => {
      log('error', message, { ...defaultContext, ...context }, error);
    },
    fatal: (message: string, error?: Error, context?: Record<string, unknown>) => {
      log('fatal', message, { ...defaultContext, ...context }, error);
    },
  }),
};

/**
 * Create a performance logger for tracking operation timing
 * @param operationName Name of the operation
 */
export function createPerformanceLogger(operationName: string) {
  const startTime = performance.now();
  
  return {
    /**
     * End the performance measurement and log the result
     * @param context Additional context
     */
    end: (context?: Record<string, unknown>): void => {
      const duration = performance.now() - startTime;
      logger.info(`${operationName} completed`, {
        ...context,
        duration: `${duration.toFixed(2)}ms`,
        operation: operationName,
      });
    },
    
    /**
     * Log an intermediate step
     * @param stepName Name of the step
     * @param context Additional context
     */
    step: (stepName: string, context?: Record<string, unknown>): void => {
      const stepTime = performance.now() - startTime;
      logger.debug(`${operationName} - ${stepName}`, {
        ...context,
        elapsed: `${stepTime.toFixed(2)}ms`,
        operation: operationName,
        step: stepName,
      });
    },
  };
}

/**
 * Log a blockchain transaction
 * @param txType Type of transaction
 * @param txId Transaction ID
 * @param status Transaction status
 * @param metadata Additional metadata
 */
export function logTransaction(
  txType: string,
  txId: string,
  status: 'pending' | 'success' | 'failed',
  metadata?: Record<string, unknown>
): void {
  logger.info(`Transaction ${status}`, {
    type: txType,
    txId,
    status,
    ...metadata,
  });
}
