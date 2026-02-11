/** Service for Notifications */

export interface INotifications {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}
