/**
 * Debug Utilities
 * 
 * Development and debugging helpers for the StackSUSU application.
 * Provides debugging tools, React DevTools integration, and
 * development-time utilities.
 * 
 * @module utils/debug
 * 
 * @example
 * ```typescript
 * import { debug, measureRender } from '@/utils/debug';
 * 
 * debug.log('Component state', { data });
 * const measuredComponent = measureRender(MyComponent);
 * ```
 */

import { useEffect, useRef } from 'react';
import type { ComponentType } from 'react';

// ============================================================================
// Debug Configuration
// ============================================================================

/** Debug configuration */
interface DebugConfig {
  enabled: boolean;
  logLevel: 'verbose' | 'info' | 'warn' | 'error';
  enableComponentTracking: boolean;
  enablePerformanceTracking: boolean;
  enableNetworkTracking: boolean;
}

/** Default configuration */
const config: DebugConfig = {
  enabled: process.env.NODE_ENV === 'development',
  logLevel: 'verbose',
  enableComponentTracking: true,
  enablePerformanceTracking: true,
  enableNetworkTracking: false,
};

/** Active debug sessions */
const activeSessions = new Map<string, DebugSession>();

interface DebugSession {
  startTime: number;
  logs: DebugLog[];
  metrics: Map<string, number>;
}

interface DebugLog {
  timestamp: number;
  level: string;
  message: string;
  data?: unknown;
}

// ============================================================================
// Core Debug Functions
// ============================================================================

/**
 * Log debug information
 * @param message Log message
 * @param data Additional data
 */
export function log(message: string, data?: unknown): void {
  if (!config.enabled || config.logLevel === 'error') return;
  
  const logEntry: DebugLog = {
    timestamp: Date.now(),
    level: 'log',
    message,
    data,
  };
  
  // Store in session
  const session = getCurrentSession();
  session?.logs.push(logEntry);
  
  // Output to console
  console.log(
    `%c[DEBUG] %c${message}`,
    'color: #3b82f6; font-weight: bold;',
    'color: inherit;',
    data || ''
  );
}

/**
 * Log warning
 * @param message Warning message
 * @param data Additional data
 */
export function warn(message: string, data?: unknown): void {
  if (!config.enabled || config.logLevel === 'error') return;
  
  console.warn(
    `%c[WARN] %c${message}`,
    'color: #f59e0b; font-weight: bold;',
    'color: inherit;',
    data || ''
  );
}

/**
 * Log error
 * @param message Error message
 * @param error Error object
 */
export function error(message: string, error?: Error | unknown): void {
  if (!config.enabled) return;
  
  console.error(
    `%c[ERROR] %c${message}`,
    'color: #ef4444; font-weight: bold;',
    'color: inherit;',
    error || ''
  );
}

/**
 * Group related logs
 * @param label Group label
 * @param fn Function to execute within group
 */
export function group(label: string, fn: () => void): void {
  if (!config.enabled) {
    fn();
    return;
  }
  
  console.group(`%c[GROUP] %c${label}`, 'color: #8b5cf6; font-weight: bold;', 'color: inherit;');
  fn();
  console.groupEnd();
}

/**
 * Create a labeled debug session
 * @param label Session label
 * @returns Session control object
 */
export function createSession(label: string): { end: () => void; getLogs: () => DebugLog[] } {
  if (!config.enabled) {
    return {
      end: () => {},
      getLogs: () => [],
    };
  }
  
  const sessionId = `${label}-${Date.now()}`;
  const session: DebugSession = {
    startTime: performance.now(),
    logs: [],
    metrics: new Map(),
  };
  
  activeSessions.set(sessionId, session);
  
  log(`Session started: ${label}`);
  
  return {
    end: () => {
      const duration = performance.now() - session.startTime;
      log(`Session ended: ${label} (${duration.toFixed(2)}ms)`);
      
      // Output summary
      console.table({
        session: label,
        duration: `${duration.toFixed(2)}ms`,
        logs: session.logs.length,
      });
      
      activeSessions.delete(sessionId);
    },
    getLogs: () => session.logs,
  };
}

/**
 * Get current debug session
 */
function getCurrentSession(): DebugSession | undefined {
  const entries = Array.from(activeSessions.entries());
  return entries.length > 0 ? entries[entries.length - 1][1] : undefined;
}

// ============================================================================
// React Component Debugging
// ============================================================================

/**
 * Hook to track component renders
 * @param componentName Component name
 */
export function useRenderCount(componentName: string): number {
  const renderCount = useRef(0);
  
  useEffect(() => {
    renderCount.current += 1;
    
    if (config.enabled && config.enableComponentTracking) {
      log(`${componentName} rendered`, { count: renderCount.current });
    }
  });
  
  return renderCount.current;
}

/**
 * Hook to measure render performance
 * @param componentName Component name
 */
export function useRenderPerformance(componentName: string): void {
  const startTime = useRef(performance.now());
  
  useEffect(() => {
    const duration = performance.now() - startTime.current;
    
    if (config.enabled && config.enablePerformanceTracking && duration > 16) {
      warn(`${componentName} slow render detected`, { duration: `${duration.toFixed(2)}ms` });
    }
    
    startTime.current = performance.now();
  });
}

/**
 * Higher-order component to measure render performance
 * @param Component Component to wrap
 * @param displayName Component display name
 */
export function measureRender<P extends object>(
  Component: ComponentType<P>,
  displayName?: string
): ComponentType<P> {
  const name = displayName || Component.displayName || Component.name || 'Component';
  
  const WrappedComponent = (props: P) => {
    const startTime = useRef(performance.now());
    
    useEffect(() => {
      const duration = performance.now() - startTime.current;
      
      if (config.enabled && duration > 16) {
        warn(`${name} slow render`, { duration: `${duration.toFixed(2)}ms` });
      }
    });
    
    return <Component {...props} />;
  };
  
  WrappedComponent.displayName = `MeasureRender(${name})`;
  return WrappedComponent;
}

/**
 * Hook to track why a component re-rendered
 * @param componentName Component name
 * @param props Component props
 */
export function useWhyDidYouUpdate<T extends object>(
  componentName: string,
  props: T
): void {
  const previousProps = useRef<T>();
  
  useEffect(() => {
    if (previousProps.current) {
      const allKeys = Object.keys({ ...previousProps.current, ...props });
      const changesObj: Record<string, { from: unknown; to: unknown }> = {};
      
      allKeys.forEach((key) => {
        if (previousProps.current && previousProps.current[key as keyof T] !== props[key as keyof T]) {
          changesObj[key] = {
            from: previousProps.current[key as keyof T],
            to: props[key as keyof T],
          };
        }
      });
      
      if (Object.keys(changesObj).length > 0) {
        log(`${componentName} re-rendered due to prop changes:`, changesObj);
      }
    }
    
    previousProps.current = props;
  });
}

// ============================================================================
// Performance Debugging
// ============================================================================

/**
 * Mark a performance milestone
 * @param label Milestone label
 */
export function mark(label: string): void {
  if (!config.enabled) return;
  
  performance.mark(label);
  log(`Mark: ${label}`);
}

/**
 * Measure between two marks
 * @param label Measurement label
 * @param startMark Start mark name
 * @param endMark End mark name
 */
export function measure(label: string, startMark: string, endMark: string): void {
  if (!config.enabled) return;
  
  try {
    performance.measure(label, startMark, endMark);
    const entries = performance.getEntriesByName(label);
    
    if (entries.length > 0) {
      log(`Measure: ${label}`, { duration: `${entries[0].duration.toFixed(2)}ms` });
    }
  } catch (e) {
    warn(`Failed to measure ${label}: marks not found`);
  }
}

/**
 * Profile a function execution
 * @param fn Function to profile
 * @param label Profile label
 */
export function profile<T>(fn: () => T, label: string): T {
  if (!config.enabled) return fn();
  
  const startMark = `${label}-start`;
  const endMark = `${label}-end`;
  
  performance.mark(startMark);
  const result = fn();
  performance.mark(endMark);
  
  measure(label, startMark, endMark);
  
  return result;
}

// ============================================================================
// Network Debugging
// ============================================================================

/**
 * Enable network request tracking
 */
export function enableNetworkTracking(): void {
  if (!config.enabled || !config.enableNetworkTracking) return;
  
  const originalFetch = window.fetch;
  
  window.fetch = async (...args) => {
    const [url, options] = args;
    const startTime = performance.now();
    
    log(`Network Request: ${options?.method || 'GET'} ${url}`);
    
    try {
      const response = await originalFetch(...args);
      const duration = performance.now() - startTime;
      
      log(`Network Response: ${url}`, {
        status: response.status,
        duration: `${duration.toFixed(2)}ms`,
      });
      
      return response;
    } catch (error) {
      const duration = performance.now() - startTime;
      error(`Network Error: ${url}`, { duration: `${duration.toFixed(2)}ms`, error });
      throw error;
    }
  };
}

// ============================================================================
// Configuration
// ============================================================================

/**
 * Configure debug settings
 * @param newConfig Partial configuration
 */
export function configure(newConfig: Partial<DebugConfig>): void {
  Object.assign(config, newConfig);
  log('Debug configuration updated', config);
}

/**
 * Enable/disable debugging
 * @param enabled Whether debugging is enabled
 */
export function setEnabled(enabled: boolean): void {
  config.enabled = enabled;
}

/**
 * Get current configuration
 */
export function getConfig(): DebugConfig {
  return { ...config };
}

// ============================================================================
// Debug API
// ============================================================================

export const debug = {
  log,
  warn,
  error,
  group,
  createSession,
  mark,
  measure,
  profile,
  configure,
  setEnabled,
  getConfig,
  enableNetworkTracking,
};

// Expose to window for console access
if (typeof window !== 'undefined') {
  (window as any).__DEBUG__ = debug;
}

export default debug;
