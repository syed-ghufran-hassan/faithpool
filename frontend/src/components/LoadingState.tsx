import React from 'react';
import { Skeleton } from './Skeleton';
import './LoadingState.css';

interface LoadingStateProps {
  type?: 'page' | 'card' | 'list' | 'inline' | 'custom';
  message?: string;
  count?: number;
  className?: string;
}

export const LoadingState: React.FC<LoadingStateProps> = ({
  type = 'page',
  message = 'Loading...',
  count = 3,
  className = ''
}) => {
  if (type === 'inline') {
    return (
      <span className={`loading-inline ${className}`}>
        <span className="loading-dots">
          <span></span>
          <span></span>
          <span></span>
        </span>
        {message && <span className="loading-message">{message}</span>}
      </span>
    );
  }
  
  if (type === 'card') {
    return (
      <div className={`loading-card ${className}`}>
        <Skeleton height={120} borderRadius={8} />
        <div className="loading-card-content">
          <Skeleton height={20} width="60%" />
          <Skeleton height={14} width="80%" />
          <Skeleton height={14} width="40%" />
        </div>
      </div>
    );
  }
  
  if (type === 'list') {
    return (
      <div className={`loading-list ${className}`}>
        {Array.from({ length: count }).map((_, i) => (
          <div key={i} className="loading-list-item">
            <Skeleton width={40} height={40} borderRadius={20} />
            <div className="loading-list-content">
              <Skeleton height={16} width="70%" />
              <Skeleton height={12} width="40%" />
            </div>
          </div>
        ))}
      </div>
    );
  }
  
  // Default: page loading
  return (
    <div className={`loading-page ${className}`}>
      <div className="loading-spinner"></div>
      {message && <p className="loading-text">{message}</p>}
    </div>
  );
};

// Specialized loading components
export const CircleCardLoading: React.FC = () => (
  <div className="circle-card-loading">
    <div className="circle-card-loading-header">
      <Skeleton width={48} height={48} borderRadius={24} />
      <div className="circle-card-loading-title">
        <Skeleton height={18} width={120} />
        <Skeleton height={12} width={80} />
      </div>
    </div>
    <Skeleton height={60} borderRadius={8} />
    <div className="circle-card-loading-footer">
      <Skeleton height={32} width={100} borderRadius={6} />
      <Skeleton height={32} width={100} borderRadius={6} />
    </div>
  </div>
);

export const DashboardLoading: React.FC = () => (
  <div className="dashboard-loading">
    <div className="dashboard-loading-stats">
      {Array.from({ length: 4 }).map((_, i) => (
        <Skeleton key={i} height={100} borderRadius={12} />
      ))}
    </div>
    <div className="dashboard-loading-main">
      <div className="dashboard-loading-section">
        <Skeleton height={24} width={150} />
        <div className="dashboard-loading-grid">
          {Array.from({ length: 3 }).map((_, i) => (
            <CircleCardLoading key={i} />
          ))}
        </div>
      </div>
    </div>
  </div>
);

export const TransactionListLoading: React.FC = () => (
  <div className="transaction-list-loading">
    {Array.from({ length: 5 }).map((_, i) => (
      <div key={i} className="transaction-item-loading">
        <Skeleton width={36} height={36} borderRadius={18} />
        <div className="transaction-content-loading">
          <Skeleton height={14} width="50%" />
          <Skeleton height={11} width="30%" />
        </div>
        <Skeleton height={16} width={80} />
      </div>
    ))}
  </div>
);

export default LoadingState;
