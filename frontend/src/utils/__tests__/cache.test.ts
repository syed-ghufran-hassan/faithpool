/**
 * Cache Utility Tests
 */

import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { cache, memoize } from '../cache';

describe('Cache', () => {
  beforeEach(() => {
    cache.clear();
  });
  
  afterEach(() => {
    cache.clear();
  });
  
  describe('basic operations', () => {
    it('should set and get values', () => {
      cache.set('key1', 'value1');
      expect(cache.get('key1')).toBe('value1');
    });
    
    it('should return undefined for missing keys', () => {
      expect(cache.get('missing')).toBeUndefined();
    });
    
    it('should check if key exists', () => {
      cache.set('key1', 'value1');
      expect(cache.has('key1')).toBe(true);
      expect(cache.has('missing')).toBe(false);
    });
    
    it('should delete values', () => {
      cache.set('key1', 'value1');
      expect(cache.delete('key1')).toBe(true);
      expect(cache.get('key1')).toBeUndefined();
    });
    
    it('should return false when deleting non-existent key', () => {
      expect(cache.delete('missing')).toBe(false);
    });
  });
  
  describe('TTL support', () => {
    it('should expire values after TTL', () => {
      cache.set('key1', 'value1', { ttl: 1 });
      expect(cache.get('key1')).toBe('value1');
      
      // Wait for expiration
      return new Promise(resolve => {
        setTimeout(() => {
          expect(cache.get('key1')).toBeUndefined();
          resolve();
        }, 10);
      });
    });
  });
  
  describe('memoization', () => {
    it('should memoize function results', () => {
      let callCount = 0;
      const expensiveFn = (x: number) => {
        callCount++;
        return x * 2;
      };
      
      const memoized = memoize(expensiveFn);
      
      expect(memoized(5)).toBe(10);
      expect(memoized(5)).toBe(10);
      expect(callCount).toBe(1);
    });
    
    it('should use custom key function', () => {
      let callCount = 0;
      const fn = (a: number, b: number) => {
        callCount++;
        return a + b;
      };
      
      const memoized = memoize(fn, (a, b) => `sum-${a}-${b}`);
      
      expect(memoized(1, 2)).toBe(3);
      expect(memoized(1, 2)).toBe(3);
      expect(callCount).toBe(1);
    });
  });
  
  describe('statistics', () => {
    it('should track cache statistics', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('key1');
      cache.get('missing');
      
      const stats = cache.getStats();
      expect(stats.hits).toBe(2);
      expect(stats.misses).toBe(1);
    });
    
    it('should calculate hit rate', () => {
      cache.set('key1', 'value1');
      cache.get('key1');
      cache.get('missing');
      
      const stats = cache.getStats();
      expect(stats.hitRate).toBe('0.50');
    });
  });
});
