import { useState, useEffect, useCallback, useMemo } from 'react';

interface WindowSize {
  width: number;
  height: number;
}

/**
 * Hook to track window dimensions
 * 
 * @returns Current window width and height
 * 
 * @example
 * ```tsx
 * const { width, height } = useWindowSize();
 * 
 * return (
 *   <div>
 *     Window: {width}x{height}
 *   </div>
 * );
 * ```
 */
export function useWindowSize(): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    const handleResize = () => {
      setSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    };

    window.addEventListener('resize', handleResize);
    handleResize(); // Set initial size

    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return size;
}

/**
 * Hook to track window dimensions with debouncing
 * 
 * @param delay - Debounce delay in ms
 * @returns Debounced window size
 * 
 * @example
 * ```tsx
 * const { width, height } = useWindowSizeDebounced(200);
 * ```
 */
export function useWindowSizeDebounced(delay = 100): WindowSize {
  const [size, setSize] = useState<WindowSize>(() => ({
    width: typeof window !== 'undefined' ? window.innerWidth : 0,
    height: typeof window !== 'undefined' ? window.innerHeight : 0,
  }));

  useEffect(() => {
    let timeoutId: ReturnType<typeof setTimeout>;

    const handleResize = () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setSize({
          width: window.innerWidth,
          height: window.innerHeight,
        });
      }, delay);
    };

    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('resize', handleResize);
      clearTimeout(timeoutId);
    };
  }, [delay]);

  return size;
}

/**
 * Hook to check if window width matches a min-width
 * 
 * @param minWidth - Minimum width in pixels
 * @returns Whether current width is >= minWidth
 * 
 * @example
 * ```tsx
 * const isDesktop = useMinWidth(1024);
 * const isTablet = useMinWidth(768);
 * ```
 */
export function useMinWidth(minWidth: number): boolean {
  const { width } = useWindowSize();
  return width >= minWidth;
}

/**
 * Hook to check if window width matches a max-width
 * 
 * @param maxWidth - Maximum width in pixels
 * @returns Whether current width is <= maxWidth
 */
export function useMaxWidth(maxWidth: number): boolean {
  const { width } = useWindowSize();
  return width <= maxWidth;
}

/**
 * Hook to get responsive layout helpers
 * 
 * @returns Object with breakpoint booleans and device type
 * 
 * @example
 * ```tsx
 * const { isMobile, isTablet, isDesktop, deviceType } = useResponsive();
 * 
 * return (
 *   <div className={isMobile ? 'p-4' : 'p-8'}>
 *     Viewing on {deviceType}
 *   </div>
 * );
 * ```
 */
export function useResponsive() {
  const { width } = useWindowSize();

  return useMemo(() => {
    const isMobile = width < 768;
    const isTablet = width >= 768 && width < 1024;
    const isDesktop = width >= 1024;
    const isLargeDesktop = width >= 1280;
    
    let deviceType: 'mobile' | 'tablet' | 'desktop' | 'large-desktop';
    if (isLargeDesktop) deviceType = 'large-desktop';
    else if (isDesktop) deviceType = 'desktop';
    else if (isTablet) deviceType = 'tablet';
    else deviceType = 'mobile';

    return {
      width,
      isMobile,
      isTablet,
      isDesktop,
      isLargeDesktop,
      deviceType,
    };
  }, [width]);
}

/**
 * Hook to get element dimensions
 * 
 * @returns Ref to attach to element and its dimensions
 * 
 * @example
 * ```tsx
 * const [ref, { width, height }] = useElementSize<HTMLDivElement>();
 * 
 * return (
 *   <div ref={ref}>
 *     Element: {width}x{height}
 *   </div>
 * );
 * ```
 */
export function useElementSize<T extends HTMLElement = HTMLDivElement>(): [
  (node: T | null) => void,
  { width: number; height: number }
] {
  const [size, setSize] = useState({ width: 0, height: 0 });
  const [node, setNode] = useState<T | null>(null);

  const ref = useCallback((newNode: T | null) => {
    setNode(newNode);
  }, []);

  useEffect(() => {
    if (!node) return;

    const resizeObserver = new ResizeObserver((entries) => {
      const entry = entries[0];
      if (entry) {
        setSize({
          width: entry.contentRect.width,
          height: entry.contentRect.height,
        });
      }
    });

    resizeObserver.observe(node);

    return () => {
      resizeObserver.disconnect();
    };
  }, [node]);

  return [ref, size];
}

export default useWindowSize;
