import { useState, useEffect, useCallback, useRef } from 'react';

interface CountdownResult {
  /** Days remaining */
  days: number;
  /** Hours remaining (0-23) */
  hours: number;
  /** Minutes remaining (0-59) */
  minutes: number;
  /** Seconds remaining (0-59) */
  seconds: number;
  /** Total milliseconds remaining */
  totalMs: number;
  /** Whether countdown is complete */
  isComplete: boolean;
  /** Whether countdown is running */
  isRunning: boolean;
  /** Start the countdown */
  start: () => void;
  /** Pause the countdown */
  pause: () => void;
  /** Reset the countdown */
  reset: () => void;
  /** Formatted string (e.g., "2d 5h 30m 15s") */
  formatted: string;
}

interface UseCountdownOptions {
  /** Callback when countdown completes */
  onComplete?: () => void;
  /** Whether to auto-start (default: true) */
  autoStart?: boolean;
  /** Update interval in ms (default: 1000) */
  interval?: number;
}

/**
 * Hook for countdown timer functionality
 * 
 * @param targetDate - Target date/time for countdown
 * @param options - Configuration options
 * @returns Countdown state and controls
 * 
 * @example
 * ```tsx
 * const countdown = useCountdown(new Date('2024-12-31'));
 * 
 * return (
 *   <div>
 *     {countdown.days}d {countdown.hours}h {countdown.minutes}m {countdown.seconds}s
 *   </div>
 * );
 * ```
 */
export function useCountdown(
  targetDate: Date | string | number,
  options: UseCountdownOptions = {}
): CountdownResult {
  const { onComplete, autoStart = true, interval = 1000 } = options;
  
  const target = new Date(targetDate).getTime();
  const [timeLeft, setTimeLeft] = useState(() => Math.max(0, target - Date.now()));
  const [isRunning, setIsRunning] = useState(autoStart);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const completedRef = useRef(false);

  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const remaining = Math.max(0, target - now);
    return remaining;
  }, [target]);

  const start = useCallback(() => {
    setIsRunning(true);
  }, []);

  const pause = useCallback(() => {
    setIsRunning(false);
  }, []);

  const reset = useCallback(() => {
    setTimeLeft(calculateTimeLeft());
    completedRef.current = false;
  }, [calculateTimeLeft]);

  useEffect(() => {
    if (!isRunning) {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    intervalRef.current = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      if (remaining === 0 && !completedRef.current) {
        completedRef.current = true;
        onComplete?.();
        if (intervalRef.current) {
          clearInterval(intervalRef.current);
        }
      }
    }, interval);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isRunning, calculateTimeLeft, onComplete, interval]);

  const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
  const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

  const formatted = [
    days > 0 ? `${days}d` : null,
    hours > 0 || days > 0 ? `${hours}h` : null,
    minutes > 0 || hours > 0 || days > 0 ? `${minutes}m` : null,
    `${seconds}s`,
  ]
    .filter(Boolean)
    .join(' ');

  return {
    days,
    hours,
    minutes,
    seconds,
    totalMs: timeLeft,
    isComplete: timeLeft === 0,
    isRunning,
    start,
    pause,
    reset,
    formatted,
  };
}

/**
 * Hook for countdown in seconds
 * 
 * @param initialSeconds - Starting seconds
 * @param options - Configuration options
 * @returns Countdown state and controls
 * 
 * @example
 * ```tsx
 * const timer = useCountdownSeconds(60, { onComplete: () => alert('Time up!') });
 * 
 * return (
 *   <div>
 *     {timer.seconds} seconds remaining
 *     <button onClick={timer.reset}>Reset</button>
 *   </div>
 * );
 * ```
 */
export function useCountdownSeconds(
  initialSeconds: number,
  options: Omit<UseCountdownOptions, 'interval'> = {}
) {
  const [targetTime, setTargetTime] = useState(() => Date.now() + initialSeconds * 1000);
  
  const result = useCountdown(targetTime, { ...options, interval: 1000 });

  const reset = useCallback(() => {
    setTargetTime(Date.now() + initialSeconds * 1000);
  }, [initialSeconds]);

  return {
    ...result,
    seconds: Math.ceil(result.totalMs / 1000),
    reset,
  };
}

export default useCountdown;
