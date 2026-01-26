import { useEffect, useRef, RefObject } from 'react';

/**
 * Hook to detect clicks outside of an element
 * 
 * @param handler - Function to call when click is detected outside
 * @param options - Configuration options
 * @returns Ref to attach to the element
 * 
 * @example
 * ```tsx
 * function Dropdown() {
 *   const [isOpen, setIsOpen] = useState(false);
 *   const ref = useClickOutside<HTMLDivElement>(() => setIsOpen(false));
 * 
 *   return (
 *     <div ref={ref}>
 *       <button onClick={() => setIsOpen(true)}>Open</button>
 *       {isOpen && <DropdownMenu />}
 *     </div>
 *   );
 * }
 * ```
 */
export function useClickOutside<T extends HTMLElement = HTMLElement>(
  handler: (event: MouseEvent | TouchEvent) => void,
  options: {
    enabled?: boolean;
    ignoreRefs?: RefObject<HTMLElement>[];
    events?: ('mousedown' | 'mouseup' | 'touchstart' | 'touchend')[];
  } = {}
): RefObject<T> {
  const {
    enabled = true,
    ignoreRefs = [],
    events = ['mousedown', 'touchstart'],
  } = options;

  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Check if click is inside the main element
      if (ref.current && ref.current.contains(target)) {
        return;
      }

      // Check if click is inside any ignored elements
      for (const ignoreRef of ignoreRefs) {
        if (ignoreRef.current && ignoreRef.current.contains(target)) {
          return;
        }
      }

      handler(event);
    };

    // Add listeners for all specified events
    for (const eventName of events) {
      document.addEventListener(eventName, handleClick);
    }

    return () => {
      for (const eventName of events) {
        document.removeEventListener(eventName, handleClick);
      }
    };
  }, [enabled, handler, ignoreRefs, events]);

  return ref;
}

/**
 * Hook to detect clicks outside multiple elements
 * 
 * @param refs - Array of refs to check against
 * @param handler - Function to call when click is outside all refs
 * @param enabled - Whether the hook is active
 * 
 * @example
 * ```tsx
 * const buttonRef = useRef(null);
 * const menuRef = useRef(null);
 * 
 * useClickOutsideRefs([buttonRef, menuRef], () => closeMenu());
 * ```
 */
export function useClickOutsideRefs(
  refs: RefObject<HTMLElement>[],
  handler: (event: MouseEvent | TouchEvent) => void,
  enabled = true
): void {
  useEffect(() => {
    if (!enabled) return;

    const handleClick = (event: MouseEvent | TouchEvent) => {
      const target = event.target as Node;

      // Check if click is inside any of the refs
      for (const ref of refs) {
        if (ref.current && ref.current.contains(target)) {
          return;
        }
      }

      handler(event);
    };

    document.addEventListener('mousedown', handleClick);
    document.addEventListener('touchstart', handleClick);

    return () => {
      document.removeEventListener('mousedown', handleClick);
      document.removeEventListener('touchstart', handleClick);
    };
  }, [refs, handler, enabled]);
}

/**
 * Hook to detect focus leaving an element (for accessibility)
 * 
 * @param handler - Function to call when focus leaves
 * @returns Ref to attach to the element
 * 
 * @example
 * ```tsx
 * const ref = useFocusOutside(() => closeDropdown());
 * 
 * return <div ref={ref} tabIndex={-1}>...</div>;
 * ```
 */
export function useFocusOutside<T extends HTMLElement = HTMLElement>(
  handler: () => void,
  enabled = true
): RefObject<T> {
  const ref = useRef<T>(null);

  useEffect(() => {
    if (!enabled) return;

    const handleFocusOut = (event: FocusEvent) => {
      const relatedTarget = event.relatedTarget as Node | null;

      if (ref.current && !ref.current.contains(relatedTarget)) {
        handler();
      }
    };

    const element = ref.current;
    element?.addEventListener('focusout', handleFocusOut);

    return () => {
      element?.removeEventListener('focusout', handleFocusOut);
    };
  }, [handler, enabled]);

  return ref;
}

export default useClickOutside;
