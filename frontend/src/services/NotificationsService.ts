/** Service for Notifications */

export interface INotifications {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class NotificationsService {
  private items: INotifications[] = [];

  create(): string {
    return Math.random().toString(36).substring(7);
  }

  getAll() {
    return this.items;
  }
}

export const NotificationsServiceInstance = new NotificationsService();
