/**
 * useToast - Toast notification management hook
 * 
 * @module hooks/useToast
 */
import { useState, useCallback, useRef } from 'react';

/** Toast notification options */
export interface ToastOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

/** Toast with unique identifier */
export interface Toast extends ToastOptions {
  id: string;
}

/** Toast type shorthand */
export type ToastType = Toast['type'];

export interface UseToastReturn {
  /** List of active toasts */
  toasts: Toast[];
  /** Add a new toast with options */
  addToast: (options: ToastOptions) => string;
  /** Remove a toast by ID */
  removeToast: (id: string) => void;
  /** Clear all toasts */
  clearAll: () => void;
  /** Show success toast */
  success: (message: string, title?: string) => string;
  /** Show error toast */
  error: (message: string, title?: string) => string;
  /** Show warning toast */
  warning: (message: string, title?: string) => string;
  /** Show info toast */
  info: (message: string, title?: string) => string;
}

const DEFAULT_DURATION = 5000;

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);
  const timeoutsRef = useRef<Map<string, ReturnType<typeof setTimeout>>>(new Map());

  const removeToast = useCallback((id: string) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const addToast = useCallback((options: ToastOptions): string => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;
    const toast: Toast = {
      id,
      type: 'info',
      duration: DEFAULT_DURATION,
      ...options,
    };

    setToasts((prev) => [...prev, toast]);

    if (toast.duration && toast.duration > 0) {
      const timeout = setTimeout(() => {
        removeToast(id);
      }, toast.duration);
      timeoutsRef.current.set(id, timeout);
    }

    return id;
  }, [removeToast]);

  const clearAll = useCallback(() => {
    timeoutsRef.current.forEach((timeout) => clearTimeout(timeout));
    timeoutsRef.current.clear();
    setToasts([]);
  }, []);

  const success = useCallback((message: string, title?: string): string => {
    return addToast({ message, title, type: 'success' });
  }, [addToast]);

  const error = useCallback((message: string, title?: string): string => {
    return addToast({ message, title, type: 'error' });
  }, [addToast]);

  const warning = useCallback((message: string, title?: string): string => {
    return addToast({ message, title, type: 'warning' });
  }, [addToast]);

  const info = useCallback((message: string, title?: string): string => {
    return addToast({ message, title, type: 'info' });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    clearAll,
    success,
    error,
    warning,
    info,
  };
}

export default useToast;
