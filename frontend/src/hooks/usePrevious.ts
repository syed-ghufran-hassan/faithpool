import { useRef, useEffect } from 'react';

/**
 * Hook to get the previous value of a state or prop
 * 
 * @param value - The value to track
 * @returns The previous value (undefined on first render)
 * 
 * @example
 * ```tsx
 * const [count, setCount] = useState(0);
 * const prevCount = usePrevious(count);
 * 
 * // After setCount(5):
 * // count = 5, prevCount = 0
 * ```
 */
export function usePrevious<T>(value: T): T | undefined {
  const ref = useRef<T>();

  useEffect(() => {
    ref.current = value;
  }, [value]);

  return ref.current;
}

/**
 * Hook to detect if a value has changed
 * 
 * @param value - The value to track
 * @returns Object with previous value and change indicator
 * 
 * @example
 * ```tsx
 * const { previous, hasChanged } = useHasChanged(status);
 * 
 * useEffect(() => {
 *   if (hasChanged && status === 'completed') {
 *     showNotification('Circle completed!');
 *   }
 * }, [hasChanged, status]);
 * ```
 */
export function useHasChanged<T>(value: T): {
  previous: T | undefined;
  hasChanged: boolean;
} {
  const previous = usePrevious(value);
  const hasChanged = previous !== undefined && previous !== value;

  return { previous, hasChanged };
}

/**
 * Hook to track the history of values
 * 
 * @param value - The value to track
 * @param maxHistory - Maximum history size (default: 10)
 * @returns Array of historical values (oldest first)
 * 
 * @example
 * ```tsx
 * const [balance, setBalance] = useState(1000);
 * const balanceHistory = useHistory(balance, 5);
 * // balanceHistory = [1000, 1500, 2000, 2500, 3000]
 * ```
 */
export function useHistory<T>(value: T, maxHistory = 10): T[] {
  const ref = useRef<T[]>([]);

  useEffect(() => {
    ref.current = [...ref.current, value].slice(-maxHistory);
  }, [value, maxHistory]);

  return ref.current;
}

/**
 * Hook to detect value change direction
 * Useful for animations and trend indicators
 * 
 * @param value - Numeric value to track
 * @returns Direction: 'up', 'down', or 'same'
 * 
 * @example
 * ```tsx
 * const direction = useValueDirection(stxBalance);
 * 
 * return (
 *   <span className={direction === 'up' ? 'text-green-500' : 'text-red-500'}>
 *     {direction === 'up' ? '↑' : direction === 'down' ? '↓' : '–'}
 *   </span>
 * );
 * ```
 */
export function useValueDirection(
  value: number
): 'up' | 'down' | 'same' {
  const previous = usePrevious(value);

  if (previous === undefined) return 'same';
  if (value > previous) return 'up';
  if (value < previous) return 'down';
  return 'same';
}

/**
 * Hook to get the initial value on first render
 * Value is captured and never changes
 * 
 * @param value - The value to capture
 * @returns The initial value
 * 
 * @example
 * ```tsx
 * const initialBalance = useInitialValue(balance);
 * const percentChange = ((balance - initialBalance) / initialBalance) * 100;
 * ```
 */
export function useInitialValue<T>(value: T): T {
  const ref = useRef<T>(value);
  return ref.current;
}

export default usePrevious;
