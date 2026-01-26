import { useState, useEffect, useCallback, useMemo } from 'react';

/**
 * Hook to use localStorage with React state
 * 
 * @param key - Storage key
 * @param initialValue - Default value if key doesn't exist
 * @returns [value, setValue, removeValue] tuple
 * 
 * @example
 * ```tsx
 * const [theme, setTheme, removeTheme] = useLocalStorage('theme', 'light');
 * 
 * return (
 *   <button onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
 *     Toggle Theme: {theme}
 *   </button>
 * );
 * ```
 */
export function useLocalStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  // Get initial value from storage or use default
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.localStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  // Update storage when value changes
  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.localStorage.setItem(key, JSON.stringify(valueToStore));
          // Dispatch event for cross-tab sync
          window.dispatchEvent(new StorageEvent('storage', {
            key,
            newValue: JSON.stringify(valueToStore),
          }));
        }
      } catch (error) {
        console.warn(`Error setting localStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  // Remove from storage
  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.localStorage.removeItem(key);
        setStoredValue(initialValue);
        window.dispatchEvent(new StorageEvent('storage', {
          key,
          newValue: null,
        }));
      }
    } catch (error) {
      console.warn(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  // Sync with other tabs
  useEffect(() => {
    const handleStorageChange = (event: StorageEvent) => {
      if (event.key === key && event.newValue !== null) {
        try {
          setStoredValue(JSON.parse(event.newValue) as T);
        } catch {
          setStoredValue(event.newValue as unknown as T);
        }
      } else if (event.key === key && event.newValue === null) {
        setStoredValue(initialValue);
      }
    };

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

/**
 * Hook to use sessionStorage with React state
 * Same API as useLocalStorage but data only persists for session
 */
export function useSessionStorage<T>(
  key: string,
  initialValue: T
): [T, (value: T | ((prev: T) => T)) => void, () => void] {
  const readValue = useCallback((): T => {
    if (typeof window === 'undefined') {
      return initialValue;
    }

    try {
      const item = window.sessionStorage.getItem(key);
      return item ? (JSON.parse(item) as T) : initialValue;
    } catch (error) {
      console.warn(`Error reading sessionStorage key "${key}":`, error);
      return initialValue;
    }
  }, [key, initialValue]);

  const [storedValue, setStoredValue] = useState<T>(readValue);

  const setValue = useCallback(
    (value: T | ((prev: T) => T)) => {
      try {
        const valueToStore = value instanceof Function ? value(storedValue) : value;
        setStoredValue(valueToStore);
        
        if (typeof window !== 'undefined') {
          window.sessionStorage.setItem(key, JSON.stringify(valueToStore));
        }
      } catch (error) {
        console.warn(`Error setting sessionStorage key "${key}":`, error);
      }
    },
    [key, storedValue]
  );

  const removeValue = useCallback(() => {
    try {
      if (typeof window !== 'undefined') {
        window.sessionStorage.removeItem(key);
        setStoredValue(initialValue);
      }
    } catch (error) {
      console.warn(`Error removing sessionStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return [storedValue, setValue, removeValue];
}

interface StorageInfo {
  used: number;
  available: number;
  usedPercentage: number;
  isNearLimit: boolean;
}

/**
 * Hook to monitor localStorage usage
 * 
 * @returns Storage usage information
 * 
 * @example
 * ```tsx
 * const { used, available, usedPercentage, isNearLimit } = useStorageInfo();
 * 
 * if (isNearLimit) {
 *   console.warn('Storage is nearly full!');
 * }
 * ```
 */
export function useStorageInfo(): StorageInfo {
  const getStorageInfo = useCallback((): StorageInfo => {
    if (typeof window === 'undefined') {
      return { used: 0, available: 5 * 1024 * 1024, usedPercentage: 0, isNearLimit: false };
    }

    let totalSize = 0;
    try {
      for (const key in localStorage) {
        if (Object.prototype.hasOwnProperty.call(localStorage, key)) {
          totalSize += localStorage.getItem(key)?.length ?? 0;
        }
      }
    } catch {
      // Storage access error
    }

    // Estimate available space (typically 5MB for localStorage)
    const estimatedLimit = 5 * 1024 * 1024; // 5MB in bytes
    const used = totalSize * 2; // UTF-16 uses 2 bytes per character
    const usedPercentage = (used / estimatedLimit) * 100;

    return {
      used,
      available: estimatedLimit - used,
      usedPercentage,
      isNearLimit: usedPercentage > 80,
    };
  }, []);

  const [info, setInfo] = useState<StorageInfo>(getStorageInfo);

  useEffect(() => {
    const handleStorage = () => {
      setInfo(getStorageInfo());
    };

    window.addEventListener('storage', handleStorage);
    return () => window.removeEventListener('storage', handleStorage);
  }, [getStorageInfo]);

  return info;
}

/**
 * Hook to manage multiple related storage keys as an object
 * 
 * @param prefix - Key prefix for namespace
 * @returns Object with get, set, remove, and clear methods
 * 
 * @example
 * ```tsx
 * const userStorage = useStorageNamespace('user');
 * 
 * userStorage.set('preferences', { theme: 'dark' });
 * const prefs = userStorage.get('preferences');
 * userStorage.remove('preferences');
 * userStorage.clear(); // Remove all user.* keys
 * ```
 */
export function useStorageNamespace(prefix: string) {
  const getKey = (key: string) => `${prefix}.${key}`;

  return useMemo(() => ({
    get: <T>(key: string, defaultValue?: T): T | undefined => {
      if (typeof window === 'undefined') return defaultValue;
      try {
        const item = localStorage.getItem(getKey(key));
        return item ? JSON.parse(item) : defaultValue;
      } catch {
        return defaultValue;
      }
    },

    set: <T>(key: string, value: T): void => {
      if (typeof window === 'undefined') return;
      try {
        localStorage.setItem(getKey(key), JSON.stringify(value));
      } catch (error) {
        console.warn(`Error setting ${getKey(key)}:`, error);
      }
    },

    remove: (key: string): void => {
      if (typeof window === 'undefined') return;
      localStorage.removeItem(getKey(key));
    },

    clear: (): void => {
      if (typeof window === 'undefined') return;
      const keysToRemove: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${prefix}.`)) {
          keysToRemove.push(key);
        }
      }
      keysToRemove.forEach(key => localStorage.removeItem(key));
    },

    keys: (): string[] => {
      if (typeof window === 'undefined') return [];
      const result: string[] = [];
      for (let i = 0; i < localStorage.length; i++) {
        const key = localStorage.key(i);
        if (key?.startsWith(`${prefix}.`)) {
          result.push(key.slice(prefix.length + 1));
        }
      }
      return result;
    },
  }), [prefix]);
}

export default useLocalStorage;
