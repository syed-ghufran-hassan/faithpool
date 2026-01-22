import type { ReactNode } from 'react';
import './Alert.css';

interface AlertProps {
  type?: 'info' | 'success' | 'warning' | 'error';
  title?: string;
  children: ReactNode;
  onClose?: () => void;
  className?: string;
}

function Alert({ type = 'info', title, children, onClose, className = '' }: AlertProps) {
  const icons = {
    info: 'ℹ️',
    success: '✓',
    warning: '⚠',
    error: '✕',
  };

  return (
    <div className={`alert alert-${type} ${className}`}>
      <span className="alert-icon">{icons[type]}</span>
      <div className="alert-content">
        {title && <div className="alert-title">{title}</div>}
        <div className="alert-message">{children}</div>
      </div>
      {onClose && (
        <button className="alert-close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}

export default Alert;
