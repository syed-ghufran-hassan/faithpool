import React, { memo } from 'react';
import { AlertTriangle, RefreshCw, Home } from 'lucide-react';
import clsx from 'clsx';
import { Button } from './Button';
import './ErrorBoundary.css';

// ============================================================================
// Types
// ============================================================================

export interface ErrorFallbackProps {
  /** The error that was caught */
  error: Error;
  /** Function to reset the error boundary */
  resetErrorBoundary: () => void;
  /** Optional custom title */
  title?: string;
  /** Show home button */
  showHomeButton?: boolean;
  /** Custom class name */
  className?: string;
}

export interface ErrorBoundaryProps {
  children: React.ReactNode;
  /** Custom fallback component */
  fallback?: React.ComponentType<ErrorFallbackProps>;
  /** Error callback */
  onError?: (error: Error, errorInfo: React.ErrorInfo) => void;
  /** Reset on route change key */
  resetKey?: string | number;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

export interface PageErrorBoundaryProps {
  children: React.ReactNode;
  /** Name of the page for error messages */
  pageName?: string;
}

// ============================================================================
// ErrorFallback Component
// ============================================================================

export const ErrorFallback = memo<ErrorFallbackProps>(function ErrorFallback({
  error,
  resetErrorBoundary,
  title = 'Something went wrong',
  showHomeButton = true,
  className,
}) {
  const isDev = import.meta.env.DEV;
  
  return (
    <div className={clsx('error-fallback', className)} role="alert">
      <div className="error-fallback__icon">
        <AlertTriangle size={48} />
      </div>
      <h2 className="error-fallback__title">{title}</h2>
      <p className="error-fallback__message">
        We're sorry, but something unexpected happened. Please try again.
      </p>
      
      {isDev && (
        <details className="error-fallback__details">
          <summary>Error Details (Development Only)</summary>
          <pre className="error-fallback__stack">
            {error.message}
            {error.stack && `\n\n${error.stack}`}
          </pre>
        </details>
      )}
      
      <div className="error-fallback__actions">
        <Button 
          variant="primary" 
          onClick={resetErrorBoundary}
          leftIcon={<RefreshCw size={16} />}
        >
          Try Again
        </Button>
        {showHomeButton && (
          <Button 
            variant="secondary" 
            onClick={() => window.location.href = '/'}
            leftIcon={<Home size={16} />}
          >
            Go Home
          </Button>
        )}
      </div>
    </div>
  );
});

// ============================================================================
// ErrorBoundary Class Component
// ============================================================================

export class ErrorBoundary extends React.Component<ErrorBoundaryProps, ErrorBoundaryState> {
  constructor(props: ErrorBoundaryProps) {
    super(props);
    this.state = { hasError: false, error: null };
  }
  
  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }
  
  componentDidUpdate(prevProps: ErrorBoundaryProps) {
    // Reset error state when resetKey changes
    if (prevProps.resetKey !== this.props.resetKey && this.state.hasError) {
      this.resetErrorBoundary();
    }
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

// ============================================================================
// PageErrorBoundary Component
// ============================================================================

export const PageErrorBoundary = memo<PageErrorBoundaryProps>(function PageErrorBoundary({
  children,
  pageName = 'This page'
}) {
  const handleError = (error: Error, errorInfo: React.ErrorInfo) => {
    // Could send to error tracking service
    console.error(`Error in ${pageName}:`, error, errorInfo);
  };
  
  return (
    <ErrorBoundary
      onError={handleError}
      fallback={({ error, resetErrorBoundary }) => (
        <div className="page-error-fallback">
          <div className="page-error-fallback__content">
            <AlertTriangle className="page-error-fallback__icon" size={32} />
            <h2 className="page-error-fallback__title">
              {pageName} encountered an error
            </h2>
            <p className="page-error-fallback__message">{error.message}</p>
            <Button 
              variant="primary" 
              onClick={resetErrorBoundary}
              leftIcon={<RefreshCw size={16} />}
            >
              Reload {pageName}
            </Button>
          </div>
        </div>
      )}
    >
      {children}
    </ErrorBoundary>
  );
});

export { ErrorBoundary as default };
