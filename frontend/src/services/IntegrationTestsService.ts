/** Service for IntegrationTests */

export interface IIntegrationTests {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class IntegrationTestsService {
  private items: IIntegrationTests[] = [];

  create(): string {
    return Math.random().toString(36).substring(7);
  }

  getAll() {
    return this.items;
  }
}
