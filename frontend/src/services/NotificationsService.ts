/** Service for Notifications */

/**
 * Interface definition
 */
export interface INotifications {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class NotificationsService {
  /** Internal storage */
  private items: INotifications[] = [];

  create(): string {
    return Math.random().toString(36).substring(7);
  }

  getAll() {
    return this.items;
  }
}

export const NotificationsServiceInstance = new NotificationsService();
