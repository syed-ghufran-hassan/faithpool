/**
 * Log Service
 * 
 * Structured logging with levels and context.
 */

export type LogLevel = 'debug' | 'info' | 'warn' | 'error';

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: Date;
  context?: string;
  data?: unknown;
}

interface LogConfig {
  minLevel: LogLevel;
  enabled: boolean;
  persistLogs: boolean;
  maxPersistedLogs: number;
}

const LogLevelPriority: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3,
};

const STORAGE_KEY = 'stacksusu_logs';

class LogService {
  private config: LogConfig = {
    minLevel: import.meta.env.DEV ? 'debug' : 'warn',
    enabled: true,
    persistLogs: false,
    maxPersistedLogs: 100,
  };

  private logs: LogEntry[] = [];

  /**
   * Configure the logger
   */
  configure(config: Partial<LogConfig>): void {
    this.config = { ...this.config, ...config };
  }

  /**
   * Check if log level should be output
   */
  private shouldLog(level: LogLevel): boolean {
    if (!this.config.enabled) return false;
    return LogLevelPriority[level] >= LogLevelPriority[this.config.minLevel];
  }

  /**
   * Format log message
   */
  private format(entry: LogEntry): string {
    const time = entry.timestamp.toISOString();
    const ctx = entry.context ? `[${entry.context}]` : '';
    return `${time} ${entry.level.toUpperCase()} ${ctx} ${entry.message}`;
  }

  /**
   * Store log entry
   */
  private store(entry: LogEntry): void {
    this.logs.unshift(entry);

    // Trim logs if too many
    if (this.logs.length > this.config.maxPersistedLogs) {
      this.logs = this.logs.slice(0, this.config.maxPersistedLogs);
    }

    // Persist if configured
    if (this.config.persistLogs) {
      try {
        localStorage.setItem(STORAGE_KEY, JSON.stringify(this.logs));
      } catch {
        // Storage full or disabled
      }
    }
  }

  /**
   * Create a log entry
   */
  private log(level: LogLevel, message: string, data?: unknown, context?: string): void {
    if (!this.shouldLog(level)) return;

    const entry: LogEntry = {
      level,
      message,
      timestamp: new Date(),
      context,
      data,
    };

    this.store(entry);

    // Output to console
    const formatted = this.format(entry);
    const consoleMethod = level === 'debug' ? 'log' : level;

    if (data !== undefined) {
      console[consoleMethod](formatted, data);
    } else {
      console[consoleMethod](formatted);
    }
  }

  /**
   * Debug level logging
   */
  debug(message: string, data?: unknown, context?: string): void {
    this.log('debug', message, data, context);
  }

  /**
   * Info level logging
   */
  info(message: string, data?: unknown, context?: string): void {
    this.log('info', message, data, context);
  }

  /**
   * Warning level logging
   */
  warn(message: string, data?: unknown, context?: string): void {
    this.log('warn', message, data, context);
  }

  /**
   * Error level logging
   */
  error(message: string, data?: unknown, context?: string): void {
    this.log('error', message, data, context);
  }

  /**
   * Create a scoped logger with context
   */
  scope(context: string): ScopedLogger {
    return new ScopedLogger(this, context);
  }

  /**
   * Get stored logs
   */
  getLogs(options?: { level?: LogLevel; limit?: number }): LogEntry[] {
    let result = [...this.logs];

    if (options?.level) {
      result = result.filter(e => e.level === options.level);
    }

    if (options?.limit) {
      result = result.slice(0, options.limit);
    }

    return result;
  }

  /**
   * Clear stored logs
   */
  clearLogs(): void {
    this.logs = [];
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignore
    }
  }

  /**
   * Load persisted logs
   */
  loadPersistedLogs(): void {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (stored) {
        this.logs = JSON.parse(stored);
      }
    } catch {
      // Ignore
    }
  }

  /**
   * Export logs as JSON
   */
  exportLogs(): string {
    return JSON.stringify(this.logs, null, 2);
  }
}

/**
 * Scoped logger with preset context
 */
class ScopedLogger {
  constructor(
    private logger: LogService,
    private context: string
  ) {}

  debug(message: string, data?: unknown): void {
    this.logger.debug(message, data, this.context);
  }

  info(message: string, data?: unknown): void {
    this.logger.info(message, data, this.context);
  }

  warn(message: string, data?: unknown): void {
    this.logger.warn(message, data, this.context);
  }

  error(message: string, data?: unknown): void {
    this.logger.error(message, data, this.context);
  }
}

// Singleton instance
export const logger = new LogService();

// Pre-configured scoped loggers
export const circleLogger = logger.scope('Circle');
export const walletLogger = logger.scope('Wallet');
export const apiLogger = logger.scope('API');
export const contractLogger = logger.scope('Contract');

export default logger;
