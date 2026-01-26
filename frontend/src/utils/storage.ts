/**
 * Storage Utility Functions
 * 
 * Utilities for working with localStorage and sessionStorage.
 */

/**
 * Safely get an item from localStorage with JSON parsing
 */
export function getLocalStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = localStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    console.warn(`Error reading localStorage key "${key}":`, Error);
    return defaultValue;
  }
}

/**
 * Safely set an item in localStorage with JSON stringification
 */
export function setLocalStorage<T>(key: string, value: T): boolean {
  try {
    localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error writing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Remove an item from localStorage
 */
export function removeLocalStorage(key: string): boolean {
  try {
    localStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing localStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all items from localStorage
 */
export function clearLocalStorage(): boolean {
  try {
    localStorage.clear();
    return true;
  } catch (error) {
    console.warn('Error clearing localStorage:', error);
    return false;
  }
}

/**
 * Get all keys from localStorage
 */
export function getLocalStorageKeys(): string[] {
  try {
    return Object.keys(localStorage);
  } catch {
    return [];
  }
}

/**
 * Get the size of localStorage in bytes
 */
export function getLocalStorageSize(): number {
  try {
    let size = 0;
    for (const key of Object.keys(localStorage)) {
      const value = localStorage.getItem(key) || '';
      size += (key.length + value.length) * 2; // UTF-16 = 2 bytes per char
    }
    return size;
  } catch {
    return 0;
  }
}

/**
 * Safely get an item from sessionStorage with JSON parsing
 */
export function getSessionStorage<T>(key: string, defaultValue: T): T {
  try {
    const item = sessionStorage.getItem(key);
    if (item === null) return defaultValue;
    return JSON.parse(item) as T;
  } catch {
    console.warn(`Error reading sessionStorage key "${key}":`, Error);
    return defaultValue;
  }
}

/**
 * Safely set an item in sessionStorage with JSON stringification
 */
export function setSessionStorage<T>(key: string, value: T): boolean {
  try {
    sessionStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch (error) {
    console.warn(`Error writing sessionStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Remove an item from sessionStorage
 */
export function removeSessionStorage(key: string): boolean {
  try {
    sessionStorage.removeItem(key);
    return true;
  } catch (error) {
    console.warn(`Error removing sessionStorage key "${key}":`, error);
    return false;
  }
}

/**
 * Clear all items from sessionStorage
 */
export function clearSessionStorage(): boolean {
  try {
    sessionStorage.clear();
    return true;
  } catch (error) {
    console.warn('Error clearing sessionStorage:', error);
    return false;
  }
}

/**
 * Check if localStorage is available
 */
export function isLocalStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    localStorage.setItem(testKey, testKey);
    localStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if sessionStorage is available
 */
export function isSessionStorageAvailable(): boolean {
  try {
    const testKey = '__storage_test__';
    sessionStorage.setItem(testKey, testKey);
    sessionStorage.removeItem(testKey);
    return true;
  } catch {
    return false;
  }
}

/**
 * Storage item with expiry support
 */
interface StorageItemWithExpiry<T> {
  value: T;
  expiry: number;
}

/**
 * Set an item with expiry time in localStorage
 */
export function setLocalStorageWithExpiry<T>(key: string, value: T, ttlMs: number): boolean {
  const item: StorageItemWithExpiry<T> = {
    value,
    expiry: Date.now() + ttlMs,
  };
  return setLocalStorage(key, item);
}

/**
 * Get an item with expiry check from localStorage
 */
export function getLocalStorageWithExpiry<T>(key: string, defaultValue: T): T {
  const item = getLocalStorage<StorageItemWithExpiry<T> | null>(key, null);
  
  if (!item) {
    return defaultValue;
  }
  
  if (Date.now() > item.expiry) {
    removeLocalStorage(key);
    return defaultValue;
  }
  
  return item.value;
}

/**
 * Create a namespaced storage wrapper
 */
export function createNamespacedStorage(namespace: string) {
  const prefix = `${namespace}:`;
  
  return {
    get<T>(key: string, defaultValue: T): T {
      return getLocalStorage(`${prefix}${key}`, defaultValue);
    },
    set<T>(key: string, value: T): boolean {
      return setLocalStorage(`${prefix}${key}`, value);
    },
    remove(key: string): boolean {
      return removeLocalStorage(`${prefix}${key}`);
    },
    clear(): void {
      const keys = getLocalStorageKeys().filter(k => k.startsWith(prefix));
      keys.forEach(key => removeLocalStorage(key));
    },
    keys(): string[] {
      return getLocalStorageKeys()
        .filter(k => k.startsWith(prefix))
        .map(k => k.slice(prefix.length));
    },
  };
}

/**
 * Create a storage instance for the StackSUSU app
 */
export const stacksusuStorage = createNamespacedStorage('stacksusu');

export default {
  getLocalStorage,
  setLocalStorage,
  removeLocalStorage,
  clearLocalStorage,
  getLocalStorageKeys,
  getLocalStorageSize,
  getSessionStorage,
  setSessionStorage,
  removeSessionStorage,
  clearSessionStorage,
  isLocalStorageAvailable,
  isSessionStorageAvailable,
  setLocalStorageWithExpiry,
  getLocalStorageWithExpiry,
  createNamespacedStorage,
  stacksusuStorage,
};
