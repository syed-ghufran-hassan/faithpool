/** Service for Discovery */

export interface IDiscovery {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class DiscoveryService {
  private items: IDiscovery[] = [];
}
