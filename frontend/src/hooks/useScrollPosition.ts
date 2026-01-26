import { useState, useEffect, useCallback } from 'react';

interface ScrollPosition {
  x: number;
  y: number;
  direction: 'up' | 'down' | 'none';
  isAtTop: boolean;
  isAtBottom: boolean;
}

/**
 * Hook to track window scroll position
 * 
 * @returns Current scroll position and direction
 * 
 * @example
 * ```tsx
 * const { y, direction, isAtTop } = useScrollPosition();
 * 
 * return (
 *   <header className={cn(
 *     'fixed top-0',
 *     !isAtTop && 'shadow-md',
 *     direction === 'down' && '-translate-y-full'
 *   )}>
 *     Header
 *   </header>
 * );
 * ```
 */
export function useScrollPosition(): ScrollPosition {
  const [position, setPosition] = useState<ScrollPosition>({
    x: 0,
    y: 0,
    direction: 'none',
    isAtTop: true,
    isAtBottom: false,
  });

  useEffect(() => {
    let lastY = window.scrollY;
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        const currentY = window.scrollY;
        const maxY = document.documentElement.scrollHeight - window.innerHeight;

        setPosition({
          x: window.scrollX,
          y: currentY,
          direction: currentY > lastY ? 'down' : currentY < lastY ? 'up' : 'none',
          isAtTop: currentY <= 0,
          isAtBottom: currentY >= maxY - 1,
        });

        lastY = currentY;
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll(); // Get initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return position;
}

/**
 * Hook to detect if user has scrolled past a threshold
 * 
 * @param threshold - Scroll threshold in pixels
 * @returns Whether scroll has passed the threshold
 * 
 * @example
 * ```tsx
 * const hasScrolled = useScrollThreshold(100);
 * 
 * return (
 *   <button
 *     className={hasScrolled ? 'visible' : 'invisible'}
 *     onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
 *   >
 *     Back to top
 *   </button>
 * );
 * ```
 */
export function useScrollThreshold(threshold: number): boolean {
  const [passed, setPassed] = useState(false);

  useEffect(() => {
    let ticking = false;

    const handleScroll = () => {
      if (ticking) return;

      ticking = true;
      requestAnimationFrame(() => {
        setPassed(window.scrollY > threshold);
        ticking = false;
      });
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    handleScroll();

    return () => window.removeEventListener('scroll', handleScroll);
  }, [threshold]);

  return passed;
}

/**
 * Hook to lock body scroll (for modals)
 * 
 * @param lock - Whether to lock scroll
 * 
 * @example
 * ```tsx
 * const [isModalOpen, setIsModalOpen] = useState(false);
 * useScrollLock(isModalOpen);
 * ```
 */
export function useScrollLock(lock: boolean): void {
  useEffect(() => {
    if (!lock) return;

    const originalStyle = window.getComputedStyle(document.body).overflow;
    document.body.style.overflow = 'hidden';

    return () => {
      document.body.style.overflow = originalStyle;
    };
  }, [lock]);
}

/**
 * Hook to scroll to element
 * 
 * @returns Function to scroll to element by ID
 * 
 * @example
 * ```tsx
 * const scrollTo = useScrollTo();
 * 
 * return (
 *   <button onClick={() => scrollTo('section-2')}>
 *     Go to Section 2
 *   </button>
 * );
 * ```
 */
export function useScrollTo() {
  return useCallback((
    elementId: string,
    options: ScrollIntoViewOptions = { behavior: 'smooth', block: 'start' }
  ) => {
    const element = document.getElementById(elementId);
    if (element) {
      element.scrollIntoView(options);
    }
  }, []);
}

/**
 * Hook to restore scroll position on navigation
 * 
 * @param key - Unique key for the scroll position
 * 
 * @example
 * ```tsx
 * // In a list page
 * useSaveScrollPosition('circles-list');
 * ```
 */
export function useSaveScrollPosition(key: string): void {
  useEffect(() => {
    // Restore position on mount
    const saved = sessionStorage.getItem(`scroll_${key}`);
    if (saved) {
      window.scrollTo(0, parseInt(saved, 10));
    }

    // Save position on unmount
    return () => {
      sessionStorage.setItem(`scroll_${key}`, String(window.scrollY));
    };
  }, [key]);
}

export default useScrollPosition;
