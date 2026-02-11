/** Service for Discovery */

/**
 * Interface definition
 */
export interface IDiscovery {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class DiscoveryService {
  /** Internal storage */
  private items: IDiscovery[] = [];

  create(): string {
    return Math.random().toString(36).substring(7);
  }

  getAll() {
    return this.items;
  }
}

export const DiscoveryServiceInstance = new DiscoveryService();
