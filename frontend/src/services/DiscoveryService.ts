/** Service for Discovery */

export interface IDiscovery {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}
