import React from 'react';
import { Button } from './Button';
import './ErrorBoundary.css';

interface ErrorFallbackProps {
  error: Error;
  resetErrorBoundary: () => void;
}

export const ErrorFallback: React.FC<ErrorFallbackProps> = ({ 
  error, 
  resetErrorBoundary 
}) => {
  const isDev = import.meta.env.DEV;
  
  return (
    <div className="error-fallback" role="alert">
      <div className="error-icon">⚠️</div>
      <h2 className="error-title">Something went wrong</h2>
      <p className="error-message">
        We're sorry, but something unexpected happened. Please try again.
      </p>
      
      {isDev && (
        <details className="error-details">
          <summary>Error Details (Development Only)</summary>
          <pre className="error-stack">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
      
      <div className="error-actions">
        <Button variant="primary" onClick={resetErrorBoundary}>
          Try Again
        </Button>
        <Button variant="secondary" onClick={() => window.location.href = '/'}>
          Go Home
        </Button>
      </div>
    </div>
  );
};

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

interface ErrorBoundaryProps {
  children: React.ReactNode;
  fallback?: React.ComponentType<ErrorFallbackProps>;
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
}

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught an error:', error, errorInfo);
    this.props.onError?.(error, errorInfo);
  }
  
  resetErrorBoundary = () => {
    this.setState({ hasError: false, error: null });
  };
  
  render() {
    if (this.state.hasError && this.state.error) {
      const FallbackComponent = this.props.fallback || ErrorFallback;
      return (
        <FallbackComponent
          error={this.state.error}
          resetErrorBoundary={this.resetErrorBoundary}
        />
      );
    }
    
    return this.props.children;
  }
}

// Page-level error boundary with navigation context
interface PageErrorBoundaryProps {
  children: React.ReactNode;
  pageName?: string;
}

export const PageErrorBoundary: React.FC<PageErrorBoundaryProps> = ({
  children,
  pageName = 'This page'
}) => {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Could send to error tracking service
    console.error(`Error in ${pageName}:`, error, errorInfo);
  };
  
  return (
    <ErrorBoundary
      onError={handleError}
      fallback={({ error, resetErrorBoundary }) => (
        <div className="page-error-fallback">
          <div className="page-error-content">
            <h2>{pageName} encountered an error</h2>
            <p className="page-error-message">{error.message}</p>
            <Button variant="primary" onClick={resetErrorBoundary}>
              Reload {pageName}
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
};

export default ErrorBoundary;
