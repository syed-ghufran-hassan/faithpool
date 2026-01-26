import { useEffect, useCallback } from 'react';

type KeyHandler = (event: KeyboardEvent) => void;
type KeyCombo = string;

/**
 * Hook to listen for keyboard shortcuts
 * 
 * @param key - Key or key combination (e.g., 'Escape', 'ctrl+s', 'cmd+k')
 * @param handler - Function to call when key is pressed
 * @param options - Configuration options
 * 
 * @example
 * ```tsx
 * // Single key
 * useKeyboard('Escape', () => closeModal());
 * 
 * // Key combination
 * useKeyboard('ctrl+s', (e) => {
 *   e.preventDefault();
 *   saveDocument();
 * });
 * 
 * // With options
 * useKeyboard('Enter', handleSubmit, { target: inputRef.current });
 * ```
 */
export function useKeyboard(
  key: KeyCombo,
  handler: KeyHandler,
  options: {
    enabled?: boolean;
    target?: HTMLElement | null;
    event?: 'keydown' | 'keyup';
    preventDefault?: boolean;
  } = {}
): void {
  const {
    enabled = true,
    target,
    event = 'keydown',
    preventDefault = false,
  } = options;

  const handleKey = useCallback(
    (e: KeyboardEvent) => {
      if (!enabled) return;
      
      if (matchesKeyCombo(e, key)) {
        if (preventDefault) {
          e.preventDefault();
        }
        handler(e);
      }
    },
    [enabled, key, handler, preventDefault]
  );

  useEffect(() => {
    if (!enabled) return;

    const element = target || window;
    element.addEventListener(event, handleKey as EventListener);

    return () => {
      element.removeEventListener(event, handleKey as EventListener);
    };
  }, [enabled, target, event, handleKey]);
}

/**
 * Hook for escape key handling (common pattern)
 */
export function useEscapeKey(handler: () => void, enabled = true): void {
  useKeyboard('Escape', handler, { enabled });
}

/**
 * Hook for enter key handling
 */
export function useEnterKey(
  handler: (e: KeyboardEvent) => void,
  enabled = true
): void {
  useKeyboard('Enter', handler, { enabled });
}

/**
 * Hook for keyboard navigation (arrow keys)
 */
export function useArrowKeys(
  handlers: {
    onUp?: () => void;
    onDown?: () => void;
    onLeft?: () => void;
    onRight?: () => void;
  },
  enabled = true
): void {
  useKeyboard('ArrowUp', () => handlers.onUp?.(), { enabled });
  useKeyboard('ArrowDown', () => handlers.onDown?.(), { enabled });
  useKeyboard('ArrowLeft', () => handlers.onLeft?.(), { enabled });
  useKeyboard('ArrowRight', () => handlers.onRight?.(), { enabled });
}

/**
 * Hook for command palette shortcut (cmd+k or ctrl+k)
 */
export function useCommandPalette(handler: () => void, enabled = true): void {
  useKeyboard('meta+k', handler, { enabled, preventDefault: true });
  useKeyboard('ctrl+k', handler, { enabled, preventDefault: true });
}

// ===== Helper Functions =====

/**
 * Parse key combination string
 */
function parseKeyCombo(combo: KeyCombo): {
  key: string;
  ctrl: boolean;
  meta: boolean;
  shift: boolean;
  alt: boolean;
} {
  const parts = combo.toLowerCase().split('+');
  const key = parts.pop() || '';
  
  return {
    key,
    ctrl: parts.includes('ctrl'),
    meta: parts.includes('meta') || parts.includes('cmd'),
    shift: parts.includes('shift'),
    alt: parts.includes('alt'),
  };
}

/**
 * Check if keyboard event matches key combination
 */
function matchesKeyCombo(event: KeyboardEvent, combo: KeyCombo): boolean {
  const parsed = parseKeyCombo(combo);
  
  // Normalize key comparison
  const eventKey = event.key.toLowerCase();
  const comboKey = parsed.key.toLowerCase();
  
  // Handle special keys
  const keyMatches = 
    eventKey === comboKey ||
    event.code.toLowerCase() === comboKey ||
    event.code.toLowerCase() === `key${comboKey}`;

  if (!keyMatches) return false;

  // Check modifiers
  if (parsed.ctrl && !event.ctrlKey) return false;
  if (parsed.meta && !event.metaKey) return false;
  if (parsed.shift && !event.shiftKey) return false;
  if (parsed.alt && !event.altKey) return false;

  return true;
}

/**
 * Get platform-specific modifier key label
 */
export function getModifierLabel(): 'Cmd' | 'Ctrl' {
  const isMac = typeof navigator !== 'undefined' && 
    navigator.platform.toLowerCase().includes('mac');
  return isMac ? 'Cmd' : 'Ctrl';
}

/**
 * Format key combination for display
 */
export function formatKeyCombo(combo: KeyCombo): string {
  const parts = combo.split('+');
  return parts.map(part => {
    const p = part.toLowerCase();
    if (p === 'meta' || p === 'cmd') return getModifierLabel();
    if (p === 'ctrl') return 'Ctrl';
    if (p === 'shift') return 'Shift';
    if (p === 'alt') return 'Alt';
    return part.charAt(0).toUpperCase() + part.slice(1);
  }).join(' + ');
}

export default useKeyboard;
