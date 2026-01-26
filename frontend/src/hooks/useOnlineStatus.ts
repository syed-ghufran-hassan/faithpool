import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to detect online/offline status
 * 
 * @returns Online status and related utilities
 * 
 * @example
 * ```tsx
 * const { isOnline, isOffline, wasOffline } = useOnlineStatus();
 * 
 * {isOffline && (
 *   <Banner variant="warning">
 *     You're offline. Some features may be unavailable.
 *   </Banner>
 * )}
 * 
 * {wasOffline && (
 *   <Toast>Connection restored!</Toast>
 * )}
 * ```
 */
export function useOnlineStatus() {
  const [isOnline, setIsOnline] = useState<boolean>(() => {
    if (typeof navigator === 'undefined') return true;
    return navigator.onLine;
  });
  
  const [wasOffline, setWasOffline] = useState(false);

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Show reconnected message briefly
      setWasOffline(true);
      setTimeout(() => setWasOffline(false), 3000);
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  return {
    isOnline,
    isOffline: !isOnline,
    wasOffline,
  };
}

/**
 * Hook to check network connection quality
 * 
 * @returns Connection info and quality indicators
 * 
 * @example
 * ```tsx
 * const { effectiveType, isSlowConnection } = useConnectionQuality();
 * 
 * {isSlowConnection && (
 *   <Notice>Slow connection detected. Loading may take longer.</Notice>
 * )}
 * ```
 */
export function useConnectionQuality() {
  const [connection, setConnection] = useState<{
    effectiveType: string;
    downlink: number;
    rtt: number;
    saveData: boolean;
  } | null>(null);

  useEffect(() => {
    if (typeof navigator === 'undefined' || !('connection' in navigator)) {
      return;
    }

    const nav = navigator as Navigator & {
      connection?: {
        effectiveType: string;
        downlink: number;
        rtt: number;
        saveData: boolean;
        addEventListener: (event: string, handler: () => void) => void;
        removeEventListener: (event: string, handler: () => void) => void;
      };
    };

    const updateConnection = () => {
      if (nav.connection) {
        setConnection({
          effectiveType: nav.connection.effectiveType,
          downlink: nav.connection.downlink,
          rtt: nav.connection.rtt,
          saveData: nav.connection.saveData,
        });
      }
    };

    updateConnection();
    nav.connection?.addEventListener('change', updateConnection);

    return () => {
      nav.connection?.removeEventListener('change', updateConnection);
    };
  }, []);

  const isSlowConnection = connection?.effectiveType === '2g' || 
    connection?.effectiveType === 'slow-2g';

  return {
    ...connection,
    isSlowConnection,
    isSupported: connection !== null,
  };
}

/**
 * Hook to check API/server reachability
 * 
 * @param url - URL to ping for connectivity check
 * @param interval - Check interval in ms
 * 
 * @example
 * ```tsx
 * const { isReachable, lastChecked } = useApiReachability(
 *   'https://api.mainnet.hiro.so/v2/info',
 *   30000
 * );
 * ```
 */
export function useApiReachability(
  url: string,
  interval = 30000
) {
  const [isReachable, setIsReachable] = useState(true);
  const [lastChecked, setLastChecked] = useState<Date | null>(null);
  const [isChecking, setIsChecking] = useState(false);

  const checkReachability = useCallback(async () => {
    if (isChecking) return;
    
    setIsChecking(true);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      
      await fetch(url, { 
        method: 'HEAD',
        signal: controller.signal,
        mode: 'no-cors', // Avoid CORS issues
      });
      
      clearTimeout(timeoutId);
      setIsReachable(true);
    } catch {
      setIsReachable(false);
    } finally {
      setLastChecked(new Date());
      setIsChecking(false);
    }
  }, [url, isChecking]);

  useEffect(() => {
    checkReachability();
    
    const id = setInterval(checkReachability, interval);
    
    return () => clearInterval(id);
  }, [checkReachability, interval]);

  return {
    isReachable,
    lastChecked,
    isChecking,
    checkNow: checkReachability,
  };
}

/**
 * Hook to detect visibility/focus of the page
 * 
 * @example
 * ```tsx
 * const { isVisible, isFocused } = usePageVisibility();
 * 
 * // Pause polling when page is not visible
 * usePolling(fetchData, isVisible ? 30000 : null);
 * ```
 */
export function usePageVisibility() {
  const [isVisible, setIsVisible] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return !document.hidden;
  });
  
  const [isFocused, setIsFocused] = useState<boolean>(() => {
    if (typeof document === 'undefined') return true;
    return document.hasFocus();
  });

  useEffect(() => {
    const handleVisibilityChange = () => {
      setIsVisible(!document.hidden);
    };

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    document.addEventListener('visibilitychange', handleVisibilityChange);
    window.addEventListener('focus', handleFocus);
    window.addEventListener('blur', handleBlur);

    return () => {
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      window.removeEventListener('focus', handleFocus);
      window.removeEventListener('blur', handleBlur);
    };
  }, []);

  return {
    isVisible,
    isFocused,
    isActive: isVisible && isFocused,
  };
}

export default useOnlineStatus;
