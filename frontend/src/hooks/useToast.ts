import { useState, useCallback } from 'react';

interface ToastOptions {
  title?: string;
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info';
  duration?: number;
}

interface Toast extends ToastOptions {
  id: string;
}

interface UseToastReturn {
  toasts: Toast[];
  addToast: (options: ToastOptions) => void;
  removeToast: (id: string) => void;
  success: (message: string, title?: string) => void;
  error: (message: string, title?: string) => void;
  warning: (message: string, title?: string) => void;
  info: (message: string, title?: string) => void;
}

export function useToast(): UseToastReturn {
  const [toasts, setToasts] = useState<Toast[]>([]);

  const addToast = useCallback((options: ToastOptions) => {
    const id = Math.random().toString(36).substring(7);
    const toast: Toast = {
      id,
      type: 'info',
      duration: 5000,
      ...options,
    };

    setToasts((prev) => [...prev, toast]);

    if (toast.duration && toast.duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, toast.duration);
    }
  }, []);

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const success = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'success' });
  }, [addToast]);

  const error = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'error' });
  }, [addToast]);

  const warning = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'warning' });
  }, [addToast]);

  const info = useCallback((message: string, title?: string) => {
    addToast({ message, title, type: 'info' });
  }, [addToast]);

  return {
    toasts,
    addToast,
    removeToast,
    success,
    error,
    warning,
    info,
  };
}

export default useToast;
