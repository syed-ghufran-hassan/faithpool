/** Service for Automation */

export interface IAutomation {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}
