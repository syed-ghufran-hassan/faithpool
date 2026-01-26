import { useState, useEffect, useRef, useCallback } from 'react';

/**
 * Hook that throttles a value
 * 
 * Unlike debounce which waits for inactivity, throttle limits updates
 * to a maximum frequency, ensuring updates happen at regular intervals.
 * 
 * @param value - The value to throttle
 * @param limit - The minimum time between updates in milliseconds
 * @returns The throttled value
 * 
 * @example
 * ```tsx
 * const [scrollY, setScrollY] = useState(0);
 * const throttledScrollY = useThrottle(scrollY, 100);
 * 
 * useEffect(() => {
 *   const handleScroll = () => setScrollY(window.scrollY);
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, []);
 * ```
 */
export function useThrottle<T>(value: T, limit: number): T {
  const [throttledValue, setThrottledValue] = useState<T>(value);
  const lastRan = useRef<number>(Date.now());

  useEffect(() => {
    const handler = setTimeout(() => {
      if (Date.now() - lastRan.current >= limit) {
        setThrottledValue(value);
        lastRan.current = Date.now();
      }
    }, limit - (Date.now() - lastRan.current));

    return () => {
      clearTimeout(handler);
    };
  }, [value, limit]);

  return throttledValue;
}

/**
 * Hook that returns a throttled callback function
 * 
 * @param callback - The function to throttle
 * @param limit - The minimum time between calls in milliseconds
 * @param deps - Dependencies array for the callback
 * @returns The throttled function
 * 
 * @example
 * ```tsx
 * const handleMouseMove = useThrottledCallback(
 *   (e: MouseEvent) => {
 *     updatePosition(e.clientX, e.clientY);
 *   },
 *   100,
 *   []
 * );
 * ```
 */
export function useThrottledCallback<T extends (...args: Parameters<T>) => ReturnType<T>>(
  callback: T,
  limit: number,
  deps: React.DependencyList = []
): (...args: Parameters<T>) => void {
  const lastRan = useRef<number>(0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);
  const callbackRef = useRef(callback);

  // Update callback ref when callback changes
  useEffect(() => {
    callbackRef.current = callback;
  }, [callback]);

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return useCallback(
    (...args: Parameters<T>) => {
      const now = Date.now();

      if (now - lastRan.current >= limit) {
        callbackRef.current(...args);
        lastRan.current = now;
      } else {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
        timeoutRef.current = setTimeout(() => {
          callbackRef.current(...args);
          lastRan.current = Date.now();
        }, limit - (now - lastRan.current));
      }
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [limit, ...deps]
  );
}

/**
 * Hook that returns a throttled state setter
 * 
 * @param initialValue - The initial state value
 * @param limit - The minimum time between updates in milliseconds
 * @returns Tuple of [throttledValue, setValue, immediateValue]
 * 
 * @example
 * ```tsx
 * const [throttledValue, setValue, immediateValue] = useThrottledState(0, 100);
 * 
 * useEffect(() => {
 *   const handleScroll = () => setValue(window.scrollY);
 *   window.addEventListener('scroll', handleScroll);
 *   return () => window.removeEventListener('scroll', handleScroll);
 * }, []);
 * ```
 */
export function useThrottledState<T>(
  initialValue: T,
  limit: number
): [T, (value: T) => void, T] {
  const [immediateValue, setImmediateValue] = useState<T>(initialValue);
  const throttledValue = useThrottle(immediateValue, limit);

  return [throttledValue, setImmediateValue, immediateValue];
}

export default useThrottle;
