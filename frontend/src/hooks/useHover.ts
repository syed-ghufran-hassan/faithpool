import { useState, useCallback, useRef, useEffect } from 'react';

/**
 * Hook to track hover state on an element
 * 
 * @returns Ref to attach and hover state
 * 
 * @example
 * ```tsx
 * const [ref, isHovered] = useHover<HTMLDivElement>();
 * 
 * return (
 *   <div 
 *     ref={ref}
 *     className={isHovered ? 'bg-blue-500' : 'bg-gray-500'}
 *   >
 *     Hover me!
 *   </div>
 * );
 * ```
 */
export function useHover<T extends HTMLElement = HTMLDivElement>(): [
  (node: T | null) => void,
  boolean
] {
  const [isHovered, setIsHovered] = useState(false);
  const [node, setNode] = useState<T | null>(null);

  const ref = useCallback((newNode: T | null) => {
    setNode(newNode);
  }, []);

  useEffect(() => {
    if (!node) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [node]);

  return [ref, isHovered];
}

interface UseHoverStateReturn<T extends HTMLElement> {
  ref: (node: T | null) => void;
  isHovered: boolean;
  bind: {
    onMouseEnter: () => void;
    onMouseLeave: () => void;
  };
}

/**
 * Hook with hover state and bindable event handlers
 * 
 * @returns Object with ref, hover state, and event handlers
 * 
 * @example
 * ```tsx
 * const { isHovered, bind } = useHoverState();
 * 
 * return (
 *   <button {...bind} className={isHovered ? 'scale-110' : ''}>
 *     Button
 *   </button>
 * );
 * ```
 */
export function useHoverState<T extends HTMLElement = HTMLDivElement>(): UseHoverStateReturn<T> {
  const [isHovered, setIsHovered] = useState(false);
  const [node, setNode] = useState<T | null>(null);

  const ref = useCallback((newNode: T | null) => {
    setNode(newNode);
  }, []);

  const bind = {
    onMouseEnter: useCallback(() => setIsHovered(true), []),
    onMouseLeave: useCallback(() => setIsHovered(false), []),
  };

  useEffect(() => {
    if (!node) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
    };
  }, [node]);

  return { ref, isHovered, bind };
}

/**
 * Hook to track hover with delay (useful for tooltips)
 * 
 * @param enterDelay - Delay before hover is true (ms)
 * @param leaveDelay - Delay before hover is false (ms)
 * @returns Ref and hover state
 * 
 * @example
 * ```tsx
 * const [ref, isHovered] = useHoverDelay<HTMLDivElement>(300, 100);
 * 
 * return (
 *   <div ref={ref}>
 *     {isHovered && <Tooltip />}
 *     Hover for tooltip
 *   </div>
 * );
 * ```
 */
export function useHoverDelay<T extends HTMLElement = HTMLDivElement>(
  enterDelay = 0,
  leaveDelay = 0
): [(node: T | null) => void, boolean] {
  const [isHovered, setIsHovered] = useState(false);
  const [node, setNode] = useState<T | null>(null);
  const enterTimeoutRef = useRef<ReturnType<typeof setTimeout>>();
  const leaveTimeoutRef = useRef<ReturnType<typeof setTimeout>>();

  const ref = useCallback((newNode: T | null) => {
    setNode(newNode);
  }, []);

  useEffect(() => {
    if (!node) return;

    const handleMouseEnter = () => {
      clearTimeout(leaveTimeoutRef.current);
      if (enterDelay > 0) {
        enterTimeoutRef.current = setTimeout(() => setIsHovered(true), enterDelay);
      } else {
        setIsHovered(true);
      }
    };

    const handleMouseLeave = () => {
      clearTimeout(enterTimeoutRef.current);
      if (leaveDelay > 0) {
        leaveTimeoutRef.current = setTimeout(() => setIsHovered(false), leaveDelay);
      } else {
        setIsHovered(false);
      }
    };

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
      clearTimeout(enterTimeoutRef.current);
      clearTimeout(leaveTimeoutRef.current);
    };
  }, [node, enterDelay, leaveDelay]);

  return [ref, isHovered];
}

/**
 * Hook to track focus state (for accessibility)
 * 
 * @returns Ref and focus state
 * 
 * @example
 * ```tsx
 * const [ref, isFocused] = useFocus<HTMLInputElement>();
 * 
 * return (
 *   <input
 *     ref={ref}
 *     className={isFocused ? 'ring-2 ring-blue-500' : ''}
 *   />
 * );
 * ```
 */
export function useFocus<T extends HTMLElement = HTMLDivElement>(): [
  (node: T | null) => void,
  boolean
] {
  const [isFocused, setIsFocused] = useState(false);
  const [node, setNode] = useState<T | null>(null);

  const ref = useCallback((newNode: T | null) => {
    setNode(newNode);
  }, []);

  useEffect(() => {
    if (!node) return;

    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    node.addEventListener('focus', handleFocus);
    node.addEventListener('blur', handleBlur);

    return () => {
      node.removeEventListener('focus', handleFocus);
      node.removeEventListener('blur', handleBlur);
    };
  }, [node]);

  return [ref, isFocused];
}

/**
 * Hook to track both hover and focus states
 * 
 * @returns Object with states and ref
 * 
 * @example
 * ```tsx
 * const { ref, isHovered, isFocused, isActive } = useInteractionState<HTMLButtonElement>();
 * 
 * return (
 *   <button ref={ref} className={isActive ? 'active' : ''}>
 *     {isHovered ? 'Hovered!' : isFocused ? 'Focused!' : 'Interact'}
 *   </button>
 * );
 * ```
 */
export function useInteractionState<T extends HTMLElement = HTMLDivElement>() {
  const [isHovered, setIsHovered] = useState(false);
  const [isFocused, setIsFocused] = useState(false);
  const [node, setNode] = useState<T | null>(null);

  const ref = useCallback((newNode: T | null) => {
    setNode(newNode);
  }, []);

  useEffect(() => {
    if (!node) return;

    const handleMouseEnter = () => setIsHovered(true);
    const handleMouseLeave = () => setIsHovered(false);
    const handleFocus = () => setIsFocused(true);
    const handleBlur = () => setIsFocused(false);

    node.addEventListener('mouseenter', handleMouseEnter);
    node.addEventListener('mouseleave', handleMouseLeave);
    node.addEventListener('focus', handleFocus);
    node.addEventListener('blur', handleBlur);

    return () => {
      node.removeEventListener('mouseenter', handleMouseEnter);
      node.removeEventListener('mouseleave', handleMouseLeave);
      node.removeEventListener('focus', handleFocus);
      node.removeEventListener('blur', handleBlur);
    };
  }, [node]);

  return {
    ref,
    isHovered,
    isFocused,
    isActive: isHovered || isFocused,
  };
}

export default useHover;
