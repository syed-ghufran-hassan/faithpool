import { useEffect, useRef, useCallback } from 'react';

type EventMap = WindowEventMap & DocumentEventMap & HTMLElementEventMap;

/**
 * Hook to add event listeners with automatic cleanup
 * 
 * @param eventName - The event to listen for
 * @param handler - Event handler function
 * @param element - Element to attach listener (defaults to window)
 * @param options - AddEventListener options
 * 
 * @example
 * ```tsx
 * // Listen to window resize
 * useEventListener('resize', () => console.log('Resized!'));
 * 
 * // Listen to document click
 * useEventListener('click', handleClick, document);
 * 
 * // Listen to element events with ref
 * const buttonRef = useRef<HTMLButtonElement>(null);
 * useEventListener('click', handleClick, buttonRef);
 * ```
 */
export function useEventListener<K extends keyof EventMap>(
  eventName: K,
  handler: (event: EventMap[K]) => void,
  element?: Window | Document | HTMLElement | React.RefObject<HTMLElement> | null,
  options?: boolean | AddEventListenerOptions
): void {
  // Store handler in ref to avoid re-adding listener on handler change
  const savedHandler = useRef(handler);

  useEffect(() => {
    savedHandler.current = handler;
  }, [handler]);

  useEffect(() => {
    // Get the target element
    let targetElement: Window | Document | HTMLElement | null;
    
    if (element === undefined) {
      targetElement = window;
    } else if (element && 'current' in element) {
      targetElement = element.current;
    } else {
      targetElement = element;
    }

    if (!targetElement?.addEventListener) return;

    const eventListener = (event: Event) => {
      savedHandler.current(event as EventMap[K]);
    };

    targetElement.addEventListener(eventName, eventListener, options);

    return () => {
      targetElement?.removeEventListener(eventName, eventListener, options);
    };
  }, [eventName, element, options]);
}

/**
 * Hook to listen for window scroll events
 * 
 * @param handler - Scroll event handler
 * @param options - Event listener options
 * 
 * @example
 * ```tsx
 * useWindowScroll((e) => {
 *   console.log('Scrolled to:', window.scrollY);
 * });
 * ```
 */
export function useWindowScroll(
  handler: (event: Event) => void,
  options?: boolean | AddEventListenerOptions
): void {
  useEventListener('scroll', handler, window, options);
}

/**
 * Hook to listen for window resize events
 * 
 * @param handler - Resize event handler
 * @param options - Event listener options
 */
export function useWindowResize(
  handler: (event: UIEvent) => void,
  options?: boolean | AddEventListenerOptions
): void {
  useEventListener('resize', handler as (event: Event) => void, window, options);
}

/**
 * Hook to listen for document visibility changes
 * 
 * @param handler - Visibility change handler with isVisible boolean
 * 
 * @example
 * ```tsx
 * useVisibilityChange((isVisible) => {
 *   if (!isVisible) pauseVideo();
 * });
 * ```
 */
export function useVisibilityChange(
  handler: (isVisible: boolean) => void
): void {
  const handleVisibilityChange = useCallback(() => {
    handler(document.visibilityState === 'visible');
  }, [handler]);

  useEventListener('visibilitychange', handleVisibilityChange, document);
}

/**
 * Hook to listen for online/offline events
 * 
 * @param onOnline - Called when browser goes online
 * @param onOffline - Called when browser goes offline
 * 
 * @example
 * ```tsx
 * useNetworkStatus(
 *   () => toast.success('Back online!'),
 *   () => toast.error('You are offline')
 * );
 * ```
 */
export function useNetworkStatus(
  onOnline?: () => void,
  onOffline?: () => void
): void {
  useEventListener('online', () => onOnline?.(), window);
  useEventListener('offline', () => onOffline?.(), window);
}

/**
 * Hook to listen for beforeunload event
 * Useful for preventing accidental navigation
 * 
 * @param shouldPrevent - Whether to show browser warning
 * @param message - Optional message (most browsers ignore this)
 * 
 * @example
 * ```tsx
 * const hasUnsavedChanges = true;
 * useBeforeUnload(hasUnsavedChanges);
 * ```
 */
export function useBeforeUnload(
  shouldPrevent: boolean,
  message = 'You have unsaved changes. Are you sure you want to leave?'
): void {
  const handler = useCallback(
    (event: BeforeUnloadEvent) => {
      if (!shouldPrevent) return;
      event.preventDefault();
      event.returnValue = message;
      return message;
    },
    [shouldPrevent, message]
  );

  useEventListener('beforeunload', handler, window);
}

/**
 * Hook to detect copy events
 * 
 * @param handler - Copy event handler
 * 
 * @example
 * ```tsx
 * useCopy((event) => {
 *   event.clipboardData?.setData('text/plain', 'Custom copied text');
 *   event.preventDefault();
 * });
 * ```
 */
export function useCopy(handler: (event: ClipboardEvent) => void): void {
  useEventListener('copy', handler as (event: Event) => void, document);
}

/**
 * Hook to detect paste events
 * 
 * @param handler - Paste event handler
 * 
 * @example
 * ```tsx
 * usePaste((event) => {
 *   const text = event.clipboardData?.getData('text/plain');
 *   console.log('Pasted:', text);
 * });
 * ```
 */
export function usePaste(handler: (event: ClipboardEvent) => void): void {
  useEventListener('paste', handler as (event: Event) => void, document);
}

/**
 * Hook to detect storage events (changes from other tabs)
 * 
 * @param handler - Storage event handler
 * 
 * @example
 * ```tsx
 * useStorageEvent((event) => {
 *   if (event.key === 'theme') {
 *     setTheme(event.newValue);
 *   }
 * });
 * ```
 */
export function useStorageEvent(handler: (event: StorageEvent) => void): void {
  useEventListener('storage', handler, window);
}

/**
 * Hook to detect print events
 * 
 * @param onBeforePrint - Called before printing
 * @param onAfterPrint - Called after printing
 */
export function usePrint(
  onBeforePrint?: () => void,
  onAfterPrint?: () => void
): void {
  useEventListener('beforeprint', () => onBeforePrint?.(), window);
  useEventListener('afterprint', () => onAfterPrint?.(), window);
}

export default useEventListener;
