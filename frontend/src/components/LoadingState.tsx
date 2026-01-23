import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import { Skeleton } from './Skeleton';
import { Spinner } from './Spinner';
import './LoadingState.css';

export type LoadingType = 'page' | 'card' | 'list' | 'inline' | 'overlay' | 'skeleton';

interface LoadingStateProps extends HTMLAttributes<HTMLDivElement> {
  type?: LoadingType;
  message?: string;
  description?: string;
  count?: number;
  icon?: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export const LoadingState = forwardRef<HTMLDivElement, LoadingStateProps>(
  (
    {
      type = 'page',
      message = 'Loading...',
      description,
      count = 3,
      icon,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    if (type === 'inline') {
      return (
        <span 
          ref={ref as React.Ref<HTMLSpanElement>}
          className={clsx('loading-inline', `loading-inline--${size}`, className)} 
          {...props}
        >
          <Spinner size={size === 'lg' ? 'md' : 'sm'} color="current" />
          {message && <span className="loading-inline__message">{message}</span>}
        </span>
      );
    }
    
    if (type === 'overlay') {
      return (
        <div 
          ref={ref}
          className={clsx('loading-overlay', className)} 
          {...props}
        >
          <div className="loading-overlay__content">
            {icon || <Spinner size="lg" />}
            {message && <p className="loading-overlay__message">{message}</p>}
            {description && <p className="loading-overlay__description">{description}</p>}
          </div>
        </div>
      );
    }
    
    if (type === 'card') {
      return (
        <div 
          ref={ref}
          className={clsx('loading-card', className)} 
          {...props}
        >
          <Skeleton height={120} className="loading-card__image" />
          <div className="loading-card__content">
            <Skeleton height={20} width="60%" />
            <Skeleton height={14} width="80%" />
            <Skeleton height={14} width="40%" />
          </div>
        </div>
      );
    }
    
    if (type === 'list') {
      return (
        <div 
          ref={ref}
          className={clsx('loading-list', className)} 
          {...props}
        >
          {Array.from({ length: count }).map((_, i) => (
            <div key={i} className="loading-list__item">
              <Skeleton width={40} height={40} variant="circular" />
              <div className="loading-list__content">
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
      <div 
        ref={ref}
        className={clsx('loading-page', `loading-page--${size}`, className)} 
        {...props}
      >
        {icon || <Spinner size={size === 'sm' ? 'md' : 'lg'} />}
        <div className="loading-page__text">
          {message && <p className="loading-page__message">{message}</p>}
          {description && <p className="loading-page__description">{description}</p>}
        </div>
      </div>
    );
  }
);

LoadingState.displayName = 'LoadingState';

// Specialized loading components
export const CircleCardLoading = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('circle-card-loading', className)} {...props}>
      <div className="circle-card-loading__header">
        <Skeleton width={48} height={48} variant="circular" />
        <div className="circle-card-loading__title">
          <Skeleton height={18} width={120} />
          <Skeleton height={12} width={80} />
        </div>
      </div>
      <Skeleton height={60} />
      <div className="circle-card-loading__footer">
        <Skeleton height={32} width={100} />
        <Skeleton height={32} width={100} />
      </div>
    </div>
  )
);

CircleCardLoading.displayName = 'CircleCardLoading';

export const DashboardLoading = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('dashboard-loading', className)} {...props}>
      <div className="dashboard-loading__stats">
        {Array.from({ length: 4 }).map((_, i) => (
          <Skeleton key={i} height={100} />
        ))}
      </div>
      <div className="dashboard-loading__main">
        <div className="dashboard-loading__section">
          <Skeleton height={24} width={150} />
          <div className="dashboard-loading__grid">
            {Array.from({ length: 3 }).map((_, i) => (
              <CircleCardLoading key={i} />
            ))}
          </div>
        </div>
      </div>
    </div>
  )
);

DashboardLoading.displayName = 'DashboardLoading';

export const TransactionListLoading = forwardRef<HTMLDivElement, HTMLAttributes<HTMLDivElement>>(
  ({ className, ...props }, ref) => (
    <div ref={ref} className={clsx('transaction-list-loading', className)} {...props}>
      {Array.from({ length: 5 }).map((_, i) => (
        <div key={i} className="transaction-item-loading">
          <Skeleton width={36} height={36} variant="circular" />
          <div className="transaction-content-loading">
            <Skeleton height={14} width="50%" />
            <Skeleton height={11} width="30%" />
          </div>
          <Skeleton height={16} width={80} />
        </div>
      ))}
    </div>
  )
);

TransactionListLoading.displayName = 'TransactionListLoading';

export default LoadingState;
