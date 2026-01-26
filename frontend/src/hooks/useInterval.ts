import { useEffect, useRef, useCallback } from 'react';

/**
 * Hook for declarative setInterval
 * 
 * @param callback - Function to call on each interval
 * @param delay - Interval delay in ms (null to pause)
 * 
 * @example
 * ```tsx
 * // Basic usage - auto-refresh data every 30 seconds
 * useInterval(() => {
 *   refetchData();
 * }, 30000);
 * 
 * // Conditional - pause when tab is not visible
 * useInterval(() => {
 *   refetchData();
 * }, isVisible ? 30000 : null);
 * ```
 */
export function useInterval(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>(callback);

  // Remember the latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    if (delay === null) return;

    const id = setInterval(() => {
      savedCallback.current();
    }, delay);

    return () => clearInterval(id);
  }, [delay]);
}

/**
 * Hook for declarative setTimeout
 * 
 * @param callback - Function to call after delay
 * @param delay - Delay in ms (null to cancel)
 * 
 * @example
 * ```tsx
 * // Show toast for 3 seconds
 * useTimeout(() => {
 *   setShowToast(false);
 * }, showToast ? 3000 : null);
 * ```
 */
export function useTimeout(callback: () => void, delay: number | null): void {
  const savedCallback = useRef<() => void>(callback);

  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  useEffect(() => {
    if (delay === null) return;

    const id = setTimeout(() => {
      savedCallback.current();
    }, delay);

    return () => clearTimeout(id);
  }, [delay]);
}

/**
 * Hook for polling with automatic cleanup
 * 
 * @param pollFn - Async function to poll
 * @param interval - Polling interval in ms
 * @param options - Polling options
 * 
 * @example
 * ```tsx
 * const { isPolling, startPolling, stopPolling } = usePolling(
 *   async () => {
 *     const status = await checkTransactionStatus(txId);
 *     if (status === 'confirmed') {
 *       stopPolling();
 *     }
 *   },
 *   5000,
 *   { immediate: true }
 * );
 * ```
 */
export function usePolling(
  pollFn: () => Promise<void>,
  interval: number,
  options: {
    immediate?: boolean;
    enabled?: boolean;
  } = {}
) {
  const { immediate = false, enabled = true } = options;
  const isPolling = useRef(false);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();

  const poll = useCallback(async () => {
    if (!isPolling.current) return;
    try {
      await pollFn();
    } catch (error) {
      console.error('Polling error:', error);
    }
  }, [pollFn]);

  const startPolling = useCallback(() => {
    if (isPolling.current) return;
    isPolling.current = true;

    if (immediate) {
      poll();
    }

    intervalRef.current = setInterval(poll, interval);
  }, [poll, interval, immediate]);

  const stopPolling = useCallback(() => {
    isPolling.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
      intervalRef.current = undefined;
    }
  }, []);

  useEffect(() => {
    if (enabled) {
      startPolling();
    } else {
      stopPolling();
    }

    return stopPolling;
  }, [enabled, startPolling, stopPolling]);

  return {
    isPolling: isPolling.current,
    startPolling,
    stopPolling,
  };
}

export default useInterval;
