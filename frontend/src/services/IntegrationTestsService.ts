/** Service for IntegrationTests */

export interface IIntegrationTests {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class IntegrationTestsService {
  private items: IIntegrationTests[] = [];
}
