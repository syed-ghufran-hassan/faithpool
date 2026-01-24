/**
 * useDebounce - Debounce value and callback hooks
 * 
 * @module hooks/useDebounce
 */
import { useState, useCallback, useRef, useEffect } from 'react';

/** Result of the useDebounce hook */
export interface UseDebounceResult<T> {
  /** The debounced value */
  debouncedValue: T;
  /** Update the value (will be debounced) */
  setValue: (value: T) => void;
  /** Whether there's a pending debounced update */
  isPending: boolean;
}

/**
 * Debounce a value with a specified delay
 * @param initialValue - Initial value
 * @param delay - Debounce delay in milliseconds
 */
function useDebounce<T>(initialValue: T, delay: number = 300): UseDebounceResult<T> {
  const [debouncedValue, setDebouncedValue] = useState<T>(initialValue);
  const [isPending, setIsPending] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const setValue = useCallback((newValue: T) => {
    setIsPending(true);

    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      setDebouncedValue(newValue);
      setIsPending(false);
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { debouncedValue, setValue, isPending };
}

/**
 * Debounce a callback function
 * @param callback - The callback to debounce
 * @param delay - Debounce delay in milliseconds
 */
function useDebouncedCallback<T extends (...args: Parameters<T>) => void>(
  callback: T,
  delay: number = 300
): (...args: Parameters<T>) => void {
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Keep callback ref up to date
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  const debouncedCallback = useCallback((...args: Parameters<T>) => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      callbackRef.current(...args);
    }, delay);
  }, [delay]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return debouncedCallback;
}

export { useDebounce, useDebouncedCallback };
export default useDebounce;
