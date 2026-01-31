/**
 * Performance Monitoring Utility
 * 
 * Performance tracking and monitoring system for the StackSUSU application.
 * Provides Core Web Vitals tracking, custom performance metrics, and
 * performance reporting.
 * 
 * @module utils/performance
 * 
 * @example
 * ```typescript
 * import { performanceMonitor } from '@/utils/performance';
 * 
 * // Track custom metric
 * performanceMonitor.track('circle-load-time', 250);
 * 
 * // Measure function execution
 * const measure = performanceMonitor.measure('process-data');
 * await processData();
 * measure.end();
 * ```
 */

import { logger } from './logger';

/** Performance metric */
interface PerformanceMetric {
  name: string;
  value: number;
  unit: 'ms' | 'bytes' | 'count';
  timestamp: number;
  context?: Record<string, unknown>;
}

/** Performance observer entry */
interface PerformanceEntry {
  name: string;
  startTime: number;
  duration: number;
  entryType: string;
}

/** Performance config */
interface PerformanceConfig {
  enabled: boolean;
  sampleRate: number;
  reportThreshold: number;
  maxMetrics: number;
}

/** Default configuration */
const config: PerformanceConfig = {
  enabled: process.env.NODE_ENV === 'production',
  sampleRate: 0.1,
  reportThreshold: 100,
  maxMetrics: 1000,
};

/** Metrics storage */
const metrics: PerformanceMetric[] = [];

/** Active measurements */
const activeMeasurements = new Map<string, number>();

/**
 * Initialize performance monitoring
 * @param newConfig Partial configuration
 */
export function initPerformance(newConfig: Partial<PerformanceConfig>): void {
  Object.assign(config, newConfig);
  
  if (config.enabled) {
    observeWebVitals();
    observeLongTasks();
  }
}

/**
 * Check if metric should be sampled
 */
function shouldSample(): boolean {
  return Math.random() <= config.sampleRate;
}

/**
 * Record a performance metric
 * @param name Metric name
 * @param value Metric value
 * @param unit Unit of measurement
 * @param context Additional context
 */
export function track(
  name: string,
  value: number,
  unit: 'ms' | 'bytes' | 'count' = 'ms',
  context?: Record<string, unknown>
): void {
  if (!config.enabled || !shouldSample()) return;
  
  const metric: PerformanceMetric = {
    name,
    value,
    unit,
    timestamp: Date.now(),
    context,
  };
  
  metrics.push(metric);
  
  // Trim metrics if exceeding max
  if (metrics.length > config.maxMetrics) {
    metrics.shift();
  }
  
  // Log slow operations
  if (unit === 'ms' && value > config.reportThreshold) {
    logger.warn(`Slow operation detected: ${name} took ${value}ms`, context);
  }
}

/**
 * Start a performance measurement
 * @param name Measurement name
 * @returns Measurement control object
 */
export function measure(name: string): { end: () => void } {
  const startTime = performance.now();
  activeMeasurements.set(name, startTime);
  
  return {
    end: () => {
      const endTime = performance.now();
      const duration = endTime - startTime;
      activeMeasurements.delete(name);
      
      track(name, duration, 'ms');
    },
  };
}

/**
 * Measure async function execution time
 * @param name Measurement name
 * @param fn Function to measure
 */
export async function measureAsync<T>(
  name: string,
  fn: () => Promise<T>
): Promise<T> {
  const measure = performanceMonitor.measure(name);
  
  try {
    const result = await fn();
    return result;
  } finally {
    measure.end();
  }
}

/**
 * Observe Core Web Vitals
 */
function observeWebVitals(): void {
  if ('PerformanceObserver' in window) {
    // Largest Contentful Paint
    try {
      const lcpObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        const lastEntry = entries[entries.length - 1];
        track('LCP', lastEntry.startTime, 'ms');
      });
      lcpObserver.observe({ entryTypes: ['largest-contentful-paint'] });
    } catch (e) {
      // Browser doesn't support LCP
    }
    
    // First Input Delay
    try {
      const fidObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          track('FID', entry.processingStart - entry.startTime, 'ms');
        });
      });
      fidObserver.observe({ entryTypes: ['first-input'] });
    } catch (e) {
      // Browser doesn't support FID
    }
    
    // Cumulative Layout Shift
    try {
      let clsValue = 0;
      const clsObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry: any) => {
          if (!entry.hadRecentInput) {
            clsValue += entry.value;
          }
        });
        track('CLS', clsValue, 'count');
      });
      clsObserver.observe({ entryTypes: ['layout-shift'] });
    } catch (e) {
      // Browser doesn't support CLS
    }
  }
}

/**
 * Observe long tasks
 */
function observeLongTasks(): void {
  if ('PerformanceObserver' in window) {
    try {
      const longTaskObserver = new PerformanceObserver((list) => {
        const entries = list.getEntries();
        entries.forEach((entry) => {
          track('long-task', entry.duration, 'ms', {
            startTime: entry.startTime,
          });
        });
      });
      longTaskObserver.observe({ entryTypes: ['longtask'] });
    } catch (e) {
      // Browser doesn't support longtask
    }
  }
}

/**
 * Get all collected metrics
 */
export function getMetrics(): PerformanceMetric[] {
  return [...metrics];
}

/**
 * Get metrics summary
 */
export function getSummary(): Record<string, { count: number; avg: number; min: number; max: number }> {
  const summary: Record<string, { count: number; avg: number; min: number; max: number }> = {};
  
  metrics.forEach((metric) => {
    if (!summary[metric.name]) {
      summary[metric.name] = { count: 0, avg: 0, min: Infinity, max: 0 };
    }
    
    const stats = summary[metric.name];
    stats.count++;
    stats.avg = (stats.avg * (stats.count - 1) + metric.value) / stats.count;
    stats.min = Math.min(stats.min, metric.value);
    stats.max = Math.max(stats.max, metric.value);
  });
  
  return summary;
}

/**
 * Clear all metrics
 */
export function clearMetrics(): void {
  metrics.length = 0;
}

/**
 * Report metrics to endpoint
 */
export async function reportMetrics(): Promise<void> {
  if (metrics.length === 0) return;
  
  const payload = {
    metrics: [...metrics],
    summary: getSummary(),
    timestamp: Date.now(),
    url: window.location.href,
  };
  
  // Use sendBeacon if available
  if (navigator.sendBeacon) {
    navigator.sendBeacon(
      '/api/performance',
      JSON.stringify(payload)
    );
  } else {
    // Fallback to fetch
    try {
      await fetch('/api/performance', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
        keepalive: true,
      });
    } catch (e) {
      logger.error('Failed to report performance metrics', e as Error);
    }
  }
}

/**
 * Mark a performance milestone
 * @param name Mark name
 */
export function mark(name: string): void {
  if ('performance' in window) {
    performance.mark(name);
  }
}

/**
 * Measure between two marks
 * @param name Measurement name
 * @param startMark Start mark name
 * @param endMark End mark name
 */
export function measureBetween(name: string, startMark: string, endMark: string): void {
  if ('performance' in window) {
    try {
      performance.measure(name, startMark, endMark);
      const entries = performance.getEntriesByName(name);
      if (entries.length > 0) {
        track(name, entries[0].duration, 'ms');
      }
    } catch (e) {
      // Marks might not exist
    }
  }
}

/** Performance monitor API */
export const performanceMonitor = {
  init: initPerformance,
  track,
  measure,
  measureAsync,
  getMetrics,
  getSummary,
  clearMetrics,
  reportMetrics,
  mark,
  measureBetween,
};

// Report metrics on page unload
window.addEventListener('beforeunload', () => {
  reportMetrics();
});
