import React, { createContext, useContext, useState, useCallback, useEffect, useMemo } from 'react';

export type NotificationType = 'info' | 'success' | 'warning' | 'error';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  timestamp: Date;
  read: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  meta?: Record<string, unknown>;
}

interface NotificationContextValue {
  notifications: Notification[];
  unreadCount: number;
  addNotification: (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>) => string;
  removeNotification: (id: string) => void;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  clearAll: () => void;
}

const NotificationContext = createContext<NotificationContextValue | null>(null);

const STORAGE_KEY = 'stacksusu_notifications';
const MAX_NOTIFICATIONS = 50;

function generateId(): string {
  return `${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
}

function loadNotifications(): Notification[] {
  if (typeof window === 'undefined') return [];
  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return [];
    const parsed = JSON.parse(stored);
    return parsed.map((n: Notification) => ({
      ...n,
      timestamp: new Date(n.timestamp),
    }));
  } catch {
    return [];
  }
}

function saveNotifications(notifications: Notification[]): void {
  if (typeof window === 'undefined') return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(notifications.slice(0, MAX_NOTIFICATIONS)));
  } catch {
    // Storage full or unavailable
  }
}

/**
 * Provider for notification management
 * 
 * @example
 * ```tsx
 * // In app root
 * <NotificationProvider>
 *   <App />
 * </NotificationProvider>
 * 
 * // In component
 * const { notifications, addNotification, unreadCount } = useNotifications();
 * 
 * addNotification({
 *   type: 'success',
 *   title: 'Contribution Successful',
 *   message: 'You contributed 10 STX to Circle #1',
 * });
 * ```
 */
export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  // Load notifications from storage on mount
  useEffect(() => {
    setNotifications(loadNotifications());
  }, []);

  // Save notifications to storage when they change
  useEffect(() => {
    if (notifications.length > 0) {
      saveNotifications(notifications);
    }
  }, [notifications]);

  const addNotification = useCallback(
    (notification: Omit<Notification, 'id' | 'timestamp' | 'read'>): string => {
      const id = generateId();
      const newNotification: Notification = {
        ...notification,
        id,
        timestamp: new Date(),
        read: false,
      };

      setNotifications(prev => [newNotification, ...prev].slice(0, MAX_NOTIFICATIONS));
      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev =>
      prev.map(n => (n.id === id ? { ...n, read: true } : n))
    );
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  }, []);

  const clearAll = useCallback(() => {
    setNotifications([]);
    if (typeof window !== 'undefined') {
      localStorage.removeItem(STORAGE_KEY);
    }
  }, []);

  const unreadCount = useMemo(
    () => notifications.filter(n => !n.read).length,
    [notifications]
  );

  const value = useMemo(
    () => ({
      notifications,
      unreadCount,
      addNotification,
      removeNotification,
      markAsRead,
      markAllAsRead,
      clearAll,
    }),
    [notifications, unreadCount, addNotification, removeNotification, markAsRead, markAllAsRead, clearAll]
  );

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
}

/**
 * Hook to access notification context
 */
export function useNotifications(): NotificationContextValue {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}

// Helper functions for common notification types

export function useNotify() {
  const { addNotification } = useNotifications();

  return useMemo(() => ({
    info: (title: string, message?: string) =>
      addNotification({ type: 'info', title, message }),
    
    success: (title: string, message?: string) =>
      addNotification({ type: 'success', title, message }),
    
    warning: (title: string, message?: string) =>
      addNotification({ type: 'warning', title, message }),
    
    error: (title: string, message?: string) =>
      addNotification({ type: 'error', title, message }),

    // Circle-specific notifications
    circleJoined: (circleName: string) =>
      addNotification({
        type: 'success',
        title: 'Joined Circle',
        message: `You have successfully joined ${circleName}`,
        meta: { category: 'circle' },
      }),

    contributionMade: (amount: number, circleName: string) =>
      addNotification({
        type: 'success',
        title: 'Contribution Successful',
        message: `You contributed ${amount} STX to ${circleName}`,
        meta: { category: 'contribution' },
      }),

    payoutReceived: (amount: number, circleName: string) =>
      addNotification({
        type: 'success',
        title: 'Payout Received!',
        message: `You received ${amount} STX from ${circleName}`,
        meta: { category: 'payout' },
      }),

    roundStarted: (roundNumber: number, circleName: string) =>
      addNotification({
        type: 'info',
        title: 'New Round Started',
        message: `Round ${roundNumber} has started in ${circleName}`,
        meta: { category: 'round' },
      }),
  }), [addNotification]);
}

export default NotificationProvider;
