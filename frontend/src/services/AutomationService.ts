/** Service for Automation */

export interface IAutomation {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class AutomationService {
  private items: IAutomation[] = [];

  create(): string {
    return Math.random().toString(36).substring(7);
  }

  getAll() {
    return this.items;
  }
}

export const AutomationServiceInstance = new AutomationService();
