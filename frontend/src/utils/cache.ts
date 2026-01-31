/**
 * Cache Utility
 * 
 * Client-side caching system for the StackSUSU application.
 * Provides in-memory caching with TTL support and localStorage persistence.
 * 
 * @module utils/cache
 * 
 * @example
 * ```typescript
 * import { cache } from '@/utils/cache';
 * 
 * // Cache data with 5 minute TTL
 * cache.set('circle-123', circleData, { ttl: 300000 });
 * 
 * // Retrieve cached data
 * const data = cache.get('circle-123');
 * 
 * // Clear specific key
 * cache.delete('circle-123');
 * ```
 */

/** Cache entry structure */
interface CacheEntry<T> {
  value: T;
  expiresAt: number | null;
  createdAt: number;
  accessCount: number;
  lastAccessed: number;
}

/** Cache configuration */
interface CacheConfig {
  maxSize: number;
  defaultTtl: number | null;
  persistenceEnabled: boolean;
  persistenceKey: string;
}

/** Default cache configuration */
const config: CacheConfig = {
  maxSize: 100,
  defaultTtl: null,
  persistenceEnabled: true,
  persistenceKey: 'stacksusu_cache',
};

/** In-memory cache storage */
const cacheStore = new Map<string, CacheEntry<unknown>>();

/** Cache statistics */
const stats = {
  hits: 0,
  misses: 0,
  evictions: 0,
  sets: 0,
};

/**
 * Initialize cache configuration
 * @param newConfig Partial cache configuration
 */
export function initCache(newConfig: Partial<CacheConfig>): void {
  Object.assign(config, newConfig);
  
  if (config.persistenceEnabled) {
    loadFromStorage();
  }
}

/**
 * Load cache from localStorage
 */
function loadFromStorage(): void {
  try {
    const stored = localStorage.getItem(config.persistenceKey);
    if (stored) {
      const parsed = JSON.parse(stored);
      const now = Date.now();
      
      Object.entries(parsed).forEach(([key, entry]) => {
        const cacheEntry = entry as CacheEntry<unknown>;
        if (!cacheEntry.expiresAt || cacheEntry.expiresAt > now) {
          cacheStore.set(key, cacheEntry);
        }
      });
    }
  } catch (err) {
    console.warn('Failed to load cache from storage:', err);
  }
}

/**
 * Save cache to localStorage
 */
function saveToStorage(): void {
  if (!config.persistenceEnabled) return;
  
  try {
    const toStore: Record<string, CacheEntry<unknown>> = {};
    cacheStore.forEach((entry, key) => {
      toStore[key] = entry;
    });
    localStorage.setItem(config.persistenceKey, JSON.stringify(toStore));
  } catch (err) {
    console.warn('Failed to save cache to storage:', err);
  }
}

/**
 * Evict oldest entries when cache is full
 */
function evictIfNeeded(): void {
  if (cacheStore.size < config.maxSize) return;
  
  let oldestKey: string | null = null;
  let oldestTime = Infinity;
  
  cacheStore.forEach((entry, key) => {
    if (entry.lastAccessed < oldestTime) {
      oldestTime = entry.lastAccessed;
      oldestKey = key;
    }
  });
  
  if (oldestKey) {
    cacheStore.delete(oldestKey);
    stats.evictions++;
  }
}

/**
 * Clean up expired entries
 */
export function cleanup(): void {
  const now = Date.now();
  let removed = 0;
  
  cacheStore.forEach((entry, key) => {
    if (entry.expiresAt && entry.expiresAt <= now) {
      cacheStore.delete(key);
      removed++;
    }
  });
  
  if (removed > 0) {
    saveToStorage();
  }
  
  return removed;
}

/**
 * Set cache entry
 * @param key Cache key
 * @param value Value to cache
 * @param options Caching options
 */
export function set<T>(
  key: string,
  value: T,
  options?: { ttl?: number; persistent?: boolean }
): void {
  evictIfNeeded();
  
  const ttl = options?.ttl ?? config.defaultTtl;
  
  cacheStore.set(key, {
    value,
    expiresAt: ttl ? Date.now() + ttl : null,
    createdAt: Date.now(),
    accessCount: 0,
    lastAccessed: Date.now(),
  });
  
  stats.sets++;
  
  if (options?.persistent !== false && config.persistenceEnabled) {
    saveToStorage();
  }
}

/**
 * Get cache entry
 * @param key Cache key
 * @returns Cached value or undefined
 */
export function get<T>(key: string): T | undefined {
  const entry = cacheStore.get(key);
  
  if (!entry) {
    stats.misses++;
    return undefined;
  }
  
  // Check expiration
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    stats.misses++;
    return undefined;
  }
  
  // Update access stats
  entry.accessCount++;
  entry.lastAccessed = Date.now();
  
  stats.hits++;
  return entry.value as T;
}

/**
 * Check if key exists in cache and is not expired
 * @param key Cache key
 */
export function has(key: string): boolean {
  const entry = cacheStore.get(key);
  
  if (!entry) return false;
  if (entry.expiresAt && entry.expiresAt <= Date.now()) {
    cacheStore.delete(key);
    return false;
  }
  
  return true;
}

/**
 * Delete cache entry
 * @param key Cache key
 */
export function del(key: string): boolean {
  const existed = cacheStore.delete(key);
  if (existed && config.persistenceEnabled) {
    saveToStorage();
  }
  return existed;
}

/**
 * Clear all cache entries
 */
export function clear(): void {
  cacheStore.clear();
  stats.hits = 0;
  stats.misses = 0;
  stats.evictions = 0;
  stats.sets = 0;
  
  if (config.persistenceEnabled) {
    localStorage.removeItem(config.persistenceKey);
  }
}

/**
 * Get cache statistics
 */
export function getStats() {
  return {
    ...stats,
    size: cacheStore.size,
    maxSize: config.maxSize,
    hitRate: stats.hits + stats.misses > 0 
      ? (stats.hits / (stats.hits + stats.misses)).toFixed(2)
      : '0',
  };
}

/**
 * Get all cache keys
 */
export function keys(): string[] {
  return Array.from(cacheStore.keys());
}

/**
 * Get cache size
 */
export function size(): number {
  return cacheStore.size;
}

/**
 * Memoize a function with caching
 * @param fn Function to memoize
 * @param keyFn Function to generate cache key
 * @param ttl Time to live in milliseconds
 */
export function memoize<T, Args extends unknown[]>(
  fn: (...args: Args) => T,
  keyFn?: (...args: Args) => string,
  ttl?: number
): (...args: Args) => T {
  return (...args: Args): T => {
    const key = keyFn ? keyFn(...args) : JSON.stringify(args);
    
    const cached = get<T>(key);
    if (cached !== undefined) {
      return cached;
    }
    
    const result = fn(...args);
    set(key, result, { ttl });
    return result;
  };
}

/** Cache API object */
export const cache = {
  init: initCache,
  set,
  get,
  has,
  delete: del,
  clear,
  cleanup,
  getStats,
  keys,
  size,
  memoize,
};

// Periodic cleanup every 5 minutes
setInterval(cleanup, 300000);
