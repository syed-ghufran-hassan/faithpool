/**
 * Cache Service
 * 
 * In-memory and persistent caching with TTL support.
 */

export interface CacheEntry<T> {
  data: T;
  expiresAt: number | null;
  createdAt: number;
}

export interface CacheOptions {
  ttl?: number; // Time to live in milliseconds
  persist?: boolean; // Store in localStorage
}

const DEFAULT_TTL = 5 * 60 * 1000; // 5 minutes
const STORAGE_PREFIX = 'stacksusu_cache_';

class CacheService {
  private memoryCache: Map<string, CacheEntry<unknown>> = new Map();
  private cleanupInterval: ReturnType<typeof setInterval> | null = null;

  constructor() {
    this.startCleanup();
  }

  /**
   * Set a value in the cache
   */
  set<T>(key: string, data: T, options: CacheOptions = {}): void {
    const { ttl = DEFAULT_TTL, persist = false } = options;
    
    const entry: CacheEntry<T> = {
      data,
      expiresAt: ttl ? Date.now() + ttl : null,
      createdAt: Date.now(),
    };

    this.memoryCache.set(key, entry);

    if (persist) {
      try {
        localStorage.setItem(
          STORAGE_PREFIX + key,
          JSON.stringify(entry)
        );
      } catch {
        console.warn('[Cache] Failed to persist to localStorage');
      }
    }
  }

  /**
   * Get a value from the cache
   */
  get<T>(key: string): T | null {
    // Check memory cache first
    let entry = this.memoryCache.get(key) as CacheEntry<T> | undefined;

    // Try localStorage if not in memory
    if (!entry) {
      try {
        const stored = localStorage.getItem(STORAGE_PREFIX + key);
        if (stored) {
          entry = JSON.parse(stored) as CacheEntry<T>;
          // Restore to memory cache
          this.memoryCache.set(key, entry);
        }
      } catch {
        // Ignore parse errors
      }
    }

    if (!entry) return null;

    // Check if expired
    if (entry.expiresAt && Date.now() > entry.expiresAt) {
      this.delete(key);
      return null;
    }

    return entry.data;
  }

  /**
   * Check if a key exists and is not expired
   */
  has(key: string): boolean {
    return this.get(key) !== null;
  }

  /**
   * Delete a key from the cache
   */
  delete(key: string): void {
    this.memoryCache.delete(key);
    try {
      localStorage.removeItem(STORAGE_PREFIX + key);
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Clear all cache entries
   */
  clear(): void {
    this.memoryCache.clear();
    
    try {
      const keys = Object.keys(localStorage);
      for (const key of keys) {
        if (key.startsWith(STORAGE_PREFIX)) {
          localStorage.removeItem(key);
        }
      }
    } catch {
      // Ignore localStorage errors
    }
  }

  /**
   * Get or set a value with a factory function
   */
  async getOrSet<T>(
    key: string,
    factory: () => T | Promise<T>,
    options: CacheOptions = {}
  ): Promise<T> {
    const cached = this.get<T>(key);
    if (cached !== null) {
      return cached;
    }

    const data = await factory();
    this.set(key, data, options);
    return data;
  }

  /**
   * Get cache statistics
   */
  getStats(): {
    memoryEntries: number;
    persistedEntries: number;
  } {
    let persistedEntries = 0;
    try {
      const keys = Object.keys(localStorage);
      persistedEntries = keys.filter(k => k.startsWith(STORAGE_PREFIX)).length;
    } catch {
      // Ignore
    }

    return {
      memoryEntries: this.memoryCache.size,
      persistedEntries,
    };
  }

  /**
   * Start automatic cleanup of expired entries
   */
  private startCleanup(): void {
    this.cleanupInterval = setInterval(() => {
      this.cleanup();
    }, 60 * 1000); // Every minute
  }

  /**
   * Clean up expired entries
   */
  private cleanup(): void {
    const now = Date.now();
    
    for (const [key, entry] of this.memoryCache) {
      if (entry.expiresAt && now > entry.expiresAt) {
        this.delete(key);
      }
    }
  }

  /**
   * Stop the cleanup interval
   */
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
      this.cleanupInterval = null;
    }
  }
}

// ===== Specialized Cache Keys =====

export const CacheKeys = {
  // User data
  userProfile: (address: string) => `user:${address}`,
  userCircles: (address: string) => `user:${address}:circles`,
  userReputation: (address: string) => `user:${address}:reputation`,
  
  // Circle data
  circleDetails: (id: string) => `circle:${id}`,
  circleMembers: (id: string) => `circle:${id}:members`,
  circleRounds: (id: string) => `circle:${id}:rounds`,
  
  // NFT data
  nftMetadata: (tokenId: number) => `nft:${tokenId}`,
  nftsByOwner: (address: string) => `nfts:${address}`,
  
  // Platform data
  platformStats: () => 'platform:stats',
  leaderboard: () => 'platform:leaderboard',
  
  // Price data
  stxPrice: () => 'price:stx',
} as const;

// Singleton instance
export const cache = new CacheService();

export default cache;
