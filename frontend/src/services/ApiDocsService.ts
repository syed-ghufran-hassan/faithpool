/** Service for ApiDocs */

export interface IApiDocs {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class ApiDocsService {
  private items: IApiDocs[] = [];

  create(): string {
    return Math.random().toString(36).substring(7);
  }

  getAll() {
    return this.items;
  }
}

export const ApiDocsServiceInstance = new ApiDocsService();
