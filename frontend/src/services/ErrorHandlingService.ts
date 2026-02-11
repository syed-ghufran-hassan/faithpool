/** Service for ErrorHandling */

/**
 * Interface definition
 */
export interface IErrorHandling {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class ErrorHandlingService {
  /** Internal storage */
  private items: IErrorHandling[] = [];

  create(): string {
    return Math.random().toString(36).substring(7);
  }

  getAll() {
    return this.items;
  }
}

export const ErrorHandlingServiceInstance = new ErrorHandlingService();
