import { useEffect, useRef } from 'react';

const APP_NAME = 'StackSusu';

/**
 * Hook to update the document title
 * 
 * @param title - The page title (will be appended with app name)
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * // Sets title to "Dashboard | StackSusu"
 * useDocumentTitle('Dashboard');
 * 
 * // Dynamic title
 * useDocumentTitle(`Circle #${circleId}`);
 * 
 * // Restore previous title on unmount
 * useDocumentTitle('Settings', { restoreOnUnmount: true });
 * ```
 */
export function useDocumentTitle(
  title: string,
  options: {
    restoreOnUnmount?: boolean;
    includeAppName?: boolean;
  } = {}
): void {
  const { restoreOnUnmount = false, includeAppName = true } = options;
  const previousTitle = useRef<string>(document.title);

  useEffect(() => {
    const formattedTitle = includeAppName 
      ? `${title} | ${APP_NAME}` 
      : title;
    
    document.title = formattedTitle;

    return () => {
      if (restoreOnUnmount) {
        document.title = previousTitle.current;
      }
    };
  }, [title, includeAppName, restoreOnUnmount]);
}

/**
 * Hook to add notification badge to document title
 * 
 * @param count - Number of notifications
 * @param baseTitle - Base page title
 * 
 * @example
 * ```tsx
 * // Sets title to "(3) Dashboard | StackSusu"
 * useNotificationTitle(3, 'Dashboard');
 * 
 * // No badge when count is 0
 * useNotificationTitle(0, 'Dashboard'); // "Dashboard | StackSusu"
 * ```
 */
export function useNotificationTitle(count: number, baseTitle: string): void {
  const title = count > 0 ? `(${count}) ${baseTitle}` : baseTitle;
  useDocumentTitle(title);
}

/**
 * Hook to flash document title for attention
 * Useful for notifications when tab is not active
 * 
 * @param message - Message to flash
 * @param interval - Flash interval in ms
 * @returns Function to start/stop flashing
 * 
 * @example
 * ```tsx
 * const { startFlashing, stopFlashing, isFlashing } = useFlashTitle('New Payout!');
 * 
 * useEffect(() => {
 *   if (newPayout && !document.hasFocus()) {
 *     startFlashing();
 *   }
 * }, [newPayout]);
 * 
 * // Stop when user focuses window
 * useEffect(() => {
 *   const handleFocus = () => stopFlashing();
 *   window.addEventListener('focus', handleFocus);
 *   return () => window.removeEventListener('focus', handleFocus);
 * }, [stopFlashing]);
 * ```
 */
export function useFlashTitle(
  message: string,
  interval = 1000
): {
  startFlashing: () => void;
  stopFlashing: () => void;
  isFlashing: boolean;
} {
  const originalTitle = useRef<string>(document.title);
  const intervalRef = useRef<ReturnType<typeof setInterval>>();
  const isFlashing = useRef(false);

  const startFlashing = () => {
    if (isFlashing.current) return;
    
    isFlashing.current = true;
    originalTitle.current = document.title;
    let showMessage = true;

    intervalRef.current = setInterval(() => {
      document.title = showMessage ? message : originalTitle.current;
      showMessage = !showMessage;
    }, interval);
  };

  const stopFlashing = () => {
    if (!isFlashing.current) return;
    
    isFlashing.current = false;
    if (intervalRef.current) {
      clearInterval(intervalRef.current);
    }
    document.title = originalTitle.current;
  };

  // Cleanup on unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    startFlashing,
    stopFlashing,
    isFlashing: isFlashing.current,
  };
}

export default useDocumentTitle;
