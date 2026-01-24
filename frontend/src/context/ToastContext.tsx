/**
 * Toast Context Provider
 * 
 * Manages toast notifications state and provides toast actions
 * throughout the application via React Context.
 * 
 * @module context/ToastContext
 */

import { createContext, useContext, useState, useCallback, useRef } from 'react';
import type { ReactNode } from 'react';

// ============================================================
// Types
// ============================================================

/** Toast notification type */
export type ToastType = 'success' | 'error' | 'warning' | 'info';

/** Toast position on screen */
export type ToastPosition = 'top-right' | 'top-left' | 'bottom-right' | 'bottom-left' | 'top-center' | 'bottom-center';

/** Toast notification data */
export interface Toast {
  /** Unique identifier */
  id: string;
  /** Toast type for styling */
  type: ToastType;
  /** Toast title */
  title: string;
  /** Optional message body */
  message?: string;
  /** Auto-dismiss duration in ms */
  duration?: number;
  /** Optional action button */
  action?: {
    label: string;
    onClick: () => void;
  };
  /** Whether toast can be manually dismissed */
  dismissible?: boolean;
  /** Custom icon element */
  icon?: ReactNode;
}

/** Toast context value type */
interface ToastContextType {
  /** Current active toasts */
  toasts: Toast[];
  /** Add a toast notification */
  addToast: (toast: Omit<Toast, 'id'>) => string;
  /** Remove a specific toast */
  removeToast: (id: string) => void;
  /** Clear all toasts */
  clearAllToasts: () => void;
  /** Convenience: show success toast */
  success: (title: string, message?: string) => string;
  /** Convenience: show error toast */
  error: (title: string, message?: string) => string;
  /** Convenience: show warning toast */
  warning: (title: string, message?: string) => string;
  /** Convenience: show info toast */
  info: (title: string, message?: string) => string;
  /** Current toast position */
  position: ToastPosition;
  /** Update toast position */
  setPosition: (position: ToastPosition) => void;
}

// ============================================================
// Context & Constants
// ============================================================

const ToastContext = createContext<ToastContextType | null>(null);

/** Default auto-dismiss duration in ms */
const DEFAULT_DURATION = 5000;

/** Maximum number of toasts shown at once */
const MAX_TOASTS = 5;

/** Props for ToastProvider component */
interface ToastProviderProps {
  children: ReactNode;
  defaultPosition?: ToastPosition;
  maxToasts?: number;
}

// ============================================================
// Provider Component
// ============================================================

/**
 * Toast context provider component
 * Wrap your app with this to enable toast notifications
 */
export function ToastProvider({ 
  children, 
  defaultPosition = 'top-right',
  maxToasts = MAX_TOASTS 
}: ToastProviderProps) {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const [position, setPosition] = useState<ToastPosition>(defaultPosition);
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const clearAllToasts = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setToasts([]);
  }, []);

  const addToast = useCallback((toast: Omit<Toast, 'id'>): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    const newToast: Toast = {
      ...toast,
      id,
      duration: toast.duration ?? DEFAULT_DURATION,
      dismissible: toast.dismissible ?? true,
    };

    setToasts((prev) => {
      const updated = [...prev, newToast];
      // Keep only maxToasts
      if (updated.length > maxToasts) {
        const removed = updated.shift();
        if (removed) {
          const timeout = timeoutsRef.current.get(removed.id);
          if (timeout) {
            clearTimeout(timeout);
            timeoutsRef.current.delete(removed.id);
          }
        }
      }
      return updated;
    });

    // Auto-remove after duration
    if (newToast.duration && newToast.duration > 0) {
      const timeout = setTimeout(() => {
        removeToast(id);
      }, newToast.duration);
      timeoutsRef.current.set(id, timeout);
    }
    
    return id;
  }, [maxToasts, removeToast]);

  const success = useCallback((title: string, message?: string): string => {
    return addToast({ type: 'success', title, message });
  }, [addToast]);

  const error = useCallback((title: string, message?: string): string => {
    return addToast({ type: 'error', title, message });
  }, [addToast]);

  const warning = useCallback((title: string, message?: string): string => {
    return addToast({ type: 'warning', title, message });
  }, [addToast]);

  const info = useCallback((title: string, message?: string): string => {
    return addToast({ type: 'info', title, message });
  }, [addToast]);

  return (
    <ToastContext.Provider
      value={{
        toasts,
        addToast,
        removeToast,
        clearAllToasts,
        success,
        error,
        warning,
        info,
        position,
        setPosition,
      }}
    >
      {children}
    </ToastContext.Provider>
  );
}

export function useToastContext() {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error('useToastContext must be used within a ToastProvider');
  }
  return context;
}

// Alias for cleaner API
export const useToast = useToastContext;

export default ToastContext;