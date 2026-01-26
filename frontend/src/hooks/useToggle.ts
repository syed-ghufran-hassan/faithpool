import { useState, useCallback } from 'react';

/**
 * Hook for managing boolean toggle state
 * 
 * @param initialValue - Initial boolean value (default: false)
 * @returns Tuple of [value, toggle, setValue]
 * 
 * @example
 * ```tsx
 * const [isOpen, toggle, setIsOpen] = useToggle(false);
 * 
 * return (
 *   <>
 *     <button onClick={toggle}>Toggle Modal</button>
 *     <button onClick={() => setIsOpen(true)}>Open</button>
 *     <button onClick={() => setIsOpen(false)}>Close</button>
 *     {isOpen && <Modal />}
 *   </>
 * );
 * ```
 */
export function useToggle(
  initialValue: boolean = false
): [boolean, () => void, (value: boolean) => void] {
  const [value, setValue] = useState(initialValue);

  const toggle = useCallback(() => {
    setValue(prev => !prev);
  }, []);

  return [value, toggle, setValue];
}

/**
 * Hook for managing boolean state with explicit on/off controls
 * 
 * @param initialValue - Initial boolean value (default: false)
 * @returns Object with value and control functions
 * 
 * @example
 * ```tsx
 * const modal = useBoolean(false);
 * 
 * return (
 *   <>
 *     <button onClick={modal.toggle}>Toggle</button>
 *     <button onClick={modal.on}>Open</button>
 *     <button onClick={modal.off}>Close</button>
 *     {modal.value && <Modal onClose={modal.off} />}
 *   </>
 * );
 * ```
 */
export function useBoolean(initialValue: boolean = false) {
  const [value, setValue] = useState(initialValue);

  const on = useCallback(() => setValue(true), []);
  const off = useCallback(() => setValue(false), []);
  const toggle = useCallback(() => setValue(prev => !prev), []);

  return {
    value,
    setValue,
    on,
    off,
    toggle,
  };
}

/**
 * Hook for managing disclosure state (for modals, dropdowns, etc.)
 * 
 * @param initialValue - Initial open state (default: false)
 * @returns Object with isOpen state and control functions
 * 
 * @example
 * ```tsx
 * const disclosure = useDisclosure();
 * 
 * return (
 *   <>
 *     <button onClick={disclosure.onOpen}>Open Modal</button>
 *     <Modal
 *       isOpen={disclosure.isOpen}
 *       onClose={disclosure.onClose}
 *       onToggle={disclosure.onToggle}
 *     />
 *   </>
 * );
 * ```
 */
export function useDisclosure(initialValue: boolean = false) {
  const [isOpen, setIsOpen] = useState(initialValue);

  const onOpen = useCallback(() => setIsOpen(true), []);
  const onClose = useCallback(() => setIsOpen(false), []);
  const onToggle = useCallback(() => setIsOpen(prev => !prev), []);

  return {
    isOpen,
    onOpen,
    onClose,
    onToggle,
  };
}

export default useToggle;
