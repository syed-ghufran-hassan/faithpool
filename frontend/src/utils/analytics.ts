/**
 * Analytics Utility
 * 
 * Analytics tracking system for the StackSUSU application.
 * Tracks user interactions, page views, and custom events
 * for product insights and optimization.
 * 
 * @module utils/analytics
 * 
 * @example
 * ```typescript
 * import { analytics } from '@/utils/analytics';
 * 
 * // Track page view
 * analytics.page('/dashboard');
 * 
 * // Track custom event
 * analytics.track('Circle Created', {
 *   circleId: 123,
 *   contributionAmount: 1000,
 *   memberCount: 5
 * });
 * ```
 */

/** Analytics event types */
type EventType = 'page' | 'track' | 'identify' | 'group';

/** Analytics event structure */
interface AnalyticsEvent {
  type: EventType;
  event?: string;
  properties?: Record<string, unknown>;
  userId?: string;
  timestamp: number;
  context: {
    url: string;
    userAgent: string;
    referrer?: string;
  };
}

/** Analytics configuration */
interface AnalyticsConfig {
  enabled: boolean;
  debug: boolean;
  endpoint?: string;
  writeKey?: string;
  sampleRate: number;
}

/** Default analytics configuration */
const config: AnalyticsConfig = {
  enabled: process.env.NODE_ENV === 'production',
  debug: process.env.NODE_ENV === 'development',
  sampleRate: 1.0,
};

/** Event queue for batching */
const eventQueue: AnalyticsEvent[] = [];

/** User properties cache */
const userProperties: Map<string, unknown> = new Map();

/**
 * Initialize analytics with configuration
 * @param newConfig Analytics configuration
 */
export function initAnalytics(newConfig: Partial<AnalyticsConfig>): void {
  Object.assign(config, newConfig);
  
  if (config.debug) {
    console.log('[Analytics] Initialized with config:', config);
  }
}

/**
 * Check if event should be sampled
 * @returns boolean indicating if event should be tracked
 */
function shouldSample(): boolean {
  return Math.random() <= config.sampleRate;
}

/**
 * Build event context
 * @returns Event context object
 */
function buildContext() {
  return {
    url: window.location.href,
    userAgent: navigator.userAgent,
    referrer: document.referrer || undefined,
  };
}

/**
 * Queue event for processing
 * @param event Analytics event
 */
function queueEvent(event: Omit<AnalyticsEvent, 'timestamp' | 'context'>): void {
  if (!config.enabled || !shouldSample()) return;
  
  const fullEvent: AnalyticsEvent = {
    ...event,
    timestamp: Date.now(),
    context: buildContext(),
  };
  
  eventQueue.push(fullEvent);
  
  // Process queue immediately in debug mode
  if (config.debug) {
    console.log('[Analytics] Event queued:', fullEvent);
  }
  
  // Flush queue if it gets large
  if (eventQueue.length >= 20) {
    flushEvents();
  }
}

/**
 * Flush event queue to endpoint
 */
async function flushEvents(): Promise<void> {
  if (eventQueue.length === 0 || !config.endpoint) return;
  
  const events = [...eventQueue];
  eventQueue.length = 0;
  
  try {
    await fetch(config.endpoint, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        ...(config.writeKey && { Authorization: `Bearer ${config.writeKey}` }),
      },
      body: JSON.stringify({ events }),
    });
    
    if (config.debug) {
      console.log('[Analytics] Events flushed:', events.length);
    }
  } catch (err) {
    if (config.debug) {
      console.error('[Analytics] Failed to flush events:', err);
    }
  }
}

/**
 * Identify user for tracking
 * @param userId User identifier
 * @param traits User traits/properties
 */
export function identify(userId: string, traits?: Record<string, unknown>): void {
  // Store user properties
  Object.entries(traits || {}).forEach(([key, value]) => {
    userProperties.set(key, value);
  });
  
  queueEvent({
    type: 'identify',
    userId,
    properties: traits,
  });
  
  if (config.debug) {
    console.log('[Analytics] User identified:', userId, traits);
  }
}

/**
 * Track page view
 * @param name Page name
 * @param properties Additional properties
 */
export function page(name: string, properties?: Record<string, unknown>): void {
  queueEvent({
    type: 'page',
    event: 'Page View',
    properties: {
      name,
      path: window.location.pathname,
      ...properties,
    },
  });
  
  if (config.debug) {
    console.log('[Analytics] Page viewed:', name);
  }
}

/**
 * Track custom event
 * @param eventName Event name
 * @param properties Event properties
 */
export function track(eventName: string, properties?: Record<string, unknown>): void {
  queueEvent({
    type: 'track',
    event: eventName,
    properties: {
      ...Object.fromEntries(userProperties),
      ...properties,
    },
  });
  
  if (config.debug) {
    console.log('[Analytics] Event tracked:', eventName, properties);
  }
}

/**
 * Group user into organization
 * @param groupId Group identifier
 * @param traits Group traits
 */
export function group(groupId: string, traits?: Record<string, unknown>): void {
  queueEvent({
    type: 'group',
    event: 'Group',
    properties: {
      groupId,
      ...traits,
    },
  });
}

/**
 * Track wallet connection
 * @param walletType Wallet type (leather, xverse, etc.)
 * @param address Wallet address (truncated)
 */
export function trackWalletConnect(walletType: string, address: string): void {
  track('Wallet Connected', {
    walletType,
    addressPrefix: address.slice(0, 6),
    network: window.location.hostname.includes('testnet') ? 'testnet' : 'mainnet',
  });
}

/**
 * Track transaction submission
 * @param txType Transaction type
 * @param contractName Contract being called
 * @param estimatedFee Estimated fee in microSTX
 */
export function trackTransactionSubmit(
  txType: string,
  contractName: string,
  estimatedFee: number
): void {
  track('Transaction Submitted', {
    txType,
    contractName,
    estimatedFee,
  });
}

/**
 * Track circle creation
 * @param circleId Circle identifier
 * @param params Circle creation parameters
 */
export function trackCircleCreate(
  circleId: number,
  params: {
    contributionAmount: number;
    memberCount: number;
    frequency: string;
    mode: string;
  }
): void {
  track('Circle Created', {
    circleId,
    ...params,
  });
}

/**
 * Track contribution made
 * @param circleId Circle identifier
 * @param amount Contribution amount
 * @param round Current round
 */
export function trackContribution(
  circleId: number,
  amount: number,
  round: number
): void {
  track('Contribution Made', {
    circleId,
    amount,
    round,
  });
}

/**
 * Track error occurrence
 * @param errorType Error type/category
 * @param errorMessage Error message
 * @param context Additional context
 */
export function trackError(
  errorType: string,
  errorMessage: string,
  context?: Record<string, unknown>
): void {
  track('Error Occurred', {
    errorType,
    errorMessage,
    ...context,
  });
}

/** Analytics API object */
export const analytics = {
  init: initAnalytics,
  identify,
  page,
  track,
  group,
  trackWalletConnect,
  trackTransactionSubmit,
  trackCircleCreate,
  trackContribution,
  trackError,
  
  /**
   * Manually flush event queue
   */
  flush: flushEvents,
  
  /**
   * Enable or disable analytics
   * @param enabled Whether analytics should be enabled
   */
  setEnabled: (enabled: boolean): void => {
    config.enabled = enabled;
  },
  
  /**
   * Set debug mode
   * @param debug Whether to enable debug logging
   */
  setDebug: (debug: boolean): void => {
    config.debug = debug;
  },
};

// Flush events periodically
setInterval(flushEvents, 30000);

// Flush on page unload
window.addEventListener('beforeunload', () => {
  flushEvents();
});
