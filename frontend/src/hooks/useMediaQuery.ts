/**
 * useMediaQuery Hook
 * 
 * React hook for responsive design that tracks CSS media query matches.
 * Useful for conditional rendering based on screen size or preferences.
 * 
 * @module hooks/useMediaQuery
 */

import { useState, useEffect, useCallback } from 'react';

/**
 * Hook to track media query matches
 * 
 * @param query - CSS media query string
 * @returns Boolean indicating if the media query matches
 * 
 * @example
 * ```tsx
 * function ResponsiveComponent() {
 *   const isMobile = useMediaQuery('(max-width: 640px)');
 *   const isTablet = useMediaQuery('(min-width: 641px) and (max-width: 1024px)');
 *   const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)');
 *   
 *   return isMobile ? <MobileView /> : <DesktopView />;
 * }
 * ```
 */
export function useMediaQuery(query: string): boolean {
  // Initialize with the current match state (SSR-safe)
  const getMatches = useCallback((): boolean => {
    if (typeof window === 'undefined') {
      return false;
    }
    return window.matchMedia(query).matches;
  }, [query]);

  const [matches, setMatches] = useState<boolean>(getMatches);

  useEffect(() => {
    if (typeof window === 'undefined') {
      return;
    }

    const mediaQuery = window.matchMedia(query);
    
    // Update state when the query match changes
    const handleChange = (event: MediaQueryListEvent) => {
      setMatches(event.matches);
    };

    // Set initial value
    setMatches(mediaQuery.matches);

    // Modern browsers
    if (mediaQuery.addEventListener) {
      mediaQuery.addEventListener('change', handleChange);
      return () => mediaQuery.removeEventListener('change', handleChange);
    } else {
      // Legacy browsers (Safari < 14)
      mediaQuery.addListener(handleChange);
      return () => mediaQuery.removeListener(handleChange);
    }
  }, [query]);

  return matches;
}

// =============================================================================
// Preset Breakpoint Hooks
// =============================================================================

/**
 * Tailwind-style breakpoint hooks for common screen sizes
 */

/** Screen width < 640px */
export function useIsMobile(): boolean {
  return useMediaQuery('(max-width: 639px)');
}

/** Screen width >= 640px */
export function useIsSmUp(): boolean {
  return useMediaQuery('(min-width: 640px)');
}

/** Screen width >= 768px */
export function useIsMdUp(): boolean {
  return useMediaQuery('(min-width: 768px)');
}

/** Screen width >= 1024px */
export function useIsLgUp(): boolean {
  return useMediaQuery('(min-width: 1024px)');
}

/** Screen width >= 1280px */
export function useIsXlUp(): boolean {
  return useMediaQuery('(min-width: 1280px)');
}

/** Screen width >= 1536px */
export function useIs2xlUp(): boolean {
  return useMediaQuery('(min-width: 1536px)');
}

// =============================================================================
// Preference Hooks
// =============================================================================

/**
 * Check if user prefers reduced motion
 */
export function usePrefersReducedMotion(): boolean {
  return useMediaQuery('(prefers-reduced-motion: reduce)');
}

/**
 * Check if user prefers dark color scheme
 */
export function usePrefersDarkMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: dark)');
}

/**
 * Check if user prefers light color scheme
 */
export function usePrefersLightMode(): boolean {
  return useMediaQuery('(prefers-color-scheme: light)');
}

/**
 * Check if user prefers high contrast
 */
export function usePrefersHighContrast(): boolean {
  return useMediaQuery('(prefers-contrast: more)');
}

// =============================================================================
// Device/Input Hooks
// =============================================================================

/**
 * Check if device has hover capability (non-touch)
 */
export function useHasHover(): boolean {
  return useMediaQuery('(hover: hover)');
}

/**
 * Check if device uses coarse pointer (touch)
 */
export function useIsTouchDevice(): boolean {
  return useMediaQuery('(pointer: coarse)');
}

/**
 * Check if device is in portrait orientation
 */
export function useIsPortrait(): boolean {
  return useMediaQuery('(orientation: portrait)');
}

/**
 * Check if device is in landscape orientation
 */
export function useIsLandscape(): boolean {
  return useMediaQuery('(orientation: landscape)');
}

export default useMediaQuery;
