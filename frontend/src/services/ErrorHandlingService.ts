/** Service for ErrorHandling */

export interface IErrorHandling {
  id: string;
  createdAt: number;
  status: 'active' | 'inactive';
}

class ErrorHandlingService {
  private items: IErrorHandling[] = [];
}
