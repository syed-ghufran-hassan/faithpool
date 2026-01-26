/**
 * Notification Service
 * 
 * Centralized notification management for the application.
 */

export type NotificationType = 'success' | 'error' | 'warning' | 'info';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message?: string;
  duration?: number;
  dismissible?: boolean;
  action?: {
    label: string;
    onClick: () => void;
  };
  createdAt: Date;
}

type NotificationListener = (notifications: Notification[]) => void;

class NotificationService {
  private notifications: Notification[] = [];
  private listeners: Set<NotificationListener> = new Set();
  private counter = 0;

  /**
   * Subscribe to notification changes
   */
  subscribe(listener: NotificationListener): () => void {
    this.listeners.add(listener);
    listener(this.notifications);
    
    return () => {
      this.listeners.delete(listener);
    };
  }

  /**
   * Notify all listeners of changes
   */
  private notify(): void {
    const notifications = [...this.notifications];
    this.listeners.forEach(listener => listener(notifications));
  }

  /**
   * Generate unique ID
   */
  private generateId(): string {
    return `notification-${++this.counter}-${Date.now()}`;
  }

  /**
   * Add a notification
   */
  add(notification: Omit<Notification, 'id' | 'createdAt'>): string {
    const id = this.generateId();
    const newNotification: Notification = {
      ...notification,
      id,
      createdAt: new Date(),
      duration: notification.duration ?? 5000,
      dismissible: notification.dismissible ?? true,
    };

    this.notifications.push(newNotification);
    this.notify();

    // Auto-dismiss after duration
    if (newNotification.duration && newNotification.duration > 0) {
      setTimeout(() => {
        this.dismiss(id);
      }, newNotification.duration);
    }

    return id;
  }

  /**
   * Show a success notification
   */
  success(title: string, message?: string, options?: Partial<Notification>): string {
    return this.add({ type: 'success', title, message, ...options });
  }

  /**
   * Show an error notification
   */
  error(title: string, message?: string, options?: Partial<Notification>): string {
    return this.add({ 
      type: 'error', 
      title, 
      message, 
      duration: 0, // Errors don't auto-dismiss
      ...options 
    });
  }

  /**
   * Show a warning notification
   */
  warning(title: string, message?: string, options?: Partial<Notification>): string {
    return this.add({ type: 'warning', title, message, ...options });
  }

  /**
   * Show an info notification
   */
  info(title: string, message?: string, options?: Partial<Notification>): string {
    return this.add({ type: 'info', title, message, ...options });
  }

  /**
   * Dismiss a notification by ID
   */
  dismiss(id: string): void {
    const index = this.notifications.findIndex(n => n.id === id);
    if (index !== -1) {
      this.notifications.splice(index, 1);
      this.notify();
    }
  }

  /**
   * Dismiss all notifications
   */
  dismissAll(): void {
    this.notifications = [];
    this.notify();
  }

  /**
   * Get all current notifications
   */
  getAll(): Notification[] {
    return [...this.notifications];
  }

  /**
   * Get notification by ID
   */
  get(id: string): Notification | undefined {
    return this.notifications.find(n => n.id === id);
  }
}

// Singleton instance
export const notificationService = new NotificationService();

// Convenience exports
export const notify = {
  success: (title: string, message?: string) => notificationService.success(title, message),
  error: (title: string, message?: string) => notificationService.error(title, message),
  warning: (title: string, message?: string) => notificationService.warning(title, message),
  info: (title: string, message?: string) => notificationService.info(title, message),
  dismiss: (id: string) => notificationService.dismiss(id),
  dismissAll: () => notificationService.dismissAll(),
};

export default notificationService;
