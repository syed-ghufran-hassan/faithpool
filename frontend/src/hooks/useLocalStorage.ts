import { useState, useEffect, useCallback } from 'react';

interface UseLocalStorageResult<T> {
  value: T;
  setValue: (value: T | ((prev: T) => T)) => void;
  removeValue: () => void;
}

function useLocalStorage<T>(key: string, initialValue: T): UseLocalStorageResult<T> {
  // Get initial value from localStorage or use provided initial value
  const [value, setStoredValue] = useState<T>(() => {
    try {
      const item = window.localStorage.getItem(key);
      return item ? JSON.parse(item) : initialValue;
    } catch (error) {
      console.error(`Error reading localStorage key "${key}":`, error);
      return initialValue;
    }
  });

  // Update localStorage when value changes
  useEffect(() => {
    try {
      window.localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
      console.error(`Error setting localStorage key "${key}":`, error);
    }
  }, [key, value]);

  // Wrapper to update value
  const setValue = useCallback((newValue: T | ((prev: T) => T)) => {
    setStoredValue((prev) => {
      const result = newValue instanceof Function ? newValue(prev) : newValue;
      return result;
    });
  }, []);

  // Remove value from localStorage
  const removeValue = useCallback(() => {
    try {
      window.localStorage.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error(`Error removing localStorage key "${key}":`, error);
    }
  }, [key, initialValue]);

  return { value, setValue, removeValue };
}

export default useLocalStorage;
