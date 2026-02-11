/** Service for ErrorHandling */

export interface IErrorHandling {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class ErrorHandlingService {
  private items: IErrorHandling[] = [];

  create(): string {
    return Math.random().toString(36).substring(7);
  }

  getAll() {
    return this.items;
  }
}
