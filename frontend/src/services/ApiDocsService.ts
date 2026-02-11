/** Service for ApiDocs */

/**
 * Interface definition
 */
export interface IApiDocs {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class ApiDocsService {
  /** Internal storage */
  private items: IApiDocs[] = [];

  create(): string {
    return Math.random().toString(36).substring(7);
  }

  getAll() {
    return this.items;
  }
}

export const ApiDocsServiceInstance = new ApiDocsService();
