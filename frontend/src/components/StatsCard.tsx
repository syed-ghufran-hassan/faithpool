// StatsCard component - Display key metrics

import { forwardRef, memo, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, Wallet, RefreshCw, PiggyBank, Trophy, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import { formatSTX } from '../utils/helpers';
import { Skeleton } from './Skeleton';
import './StatsCard.css';

export type StatsCardVariant = 'default' | 'primary' | 'success' | 'warning' | 'error';
export type StatsCardSize = 'sm' | 'md' | 'lg';

export interface StatsCardProps {
  /** Card title/label */
  title: string;
  /** Main value to display */
  value: string | number;
  /** Additional subtitle text */
  subtitle?: string;
  /** Icon element or Lucide icon component */
  icon?: ReactNode | LucideIcon;
  /** Trend indicator */
  trend?: {
    value: number;
    isPositive: boolean;
    label?: string;
  };
  /** Loading state */
  isLoading?: boolean;
  /** Color variant */
  variant?: StatsCardVariant;
  /** Size variant */
  size?: StatsCardSize;
  /** Glowing effect for emphasis */
  glow?: boolean;
  /** Action button/link */
  action?: ReactNode;
  /** Additional className */
  className?: string;
  /** Click handler */
  onClick?: () => void;
}

export const StatsCard = memo(forwardRef<HTMLDivElement, StatsCardProps>(
  function StatsCard(
    {
      title,
      value,
      subtitle,
      icon,
      trend,
      isLoading = false,
      variant = 'default',
      size = 'md',
      glow = false,
      action,
      className,
      onClick,
    },
    ref
  ) {
    const cardClasses = clsx(
      'stats-card',
      `stats-card--${variant}`,
      `stats-card--${size}`,
      {
        'stats-card--glow': glow,
        'stats-card--clickable': !!onClick,
      },
      className
    );

    const renderIcon = () => {
      if (!icon) return null;
      
      if (typeof icon === 'function') {
        const IconComponent = icon as LucideIcon;
        return (
          <div className="stats-card__icon-wrapper">
            <IconComponent className="stats-card__icon-svg" />
          </div>
        );
      }
      return <div className="stats-card__icon-wrapper">{icon}</div>;
    };

    if (isLoading) {
      return (
        <div ref={ref} className={cardClasses}>
          <div className="stats-card__header">
            <Skeleton width="60%" height="14px" />
          </div>
          <div className="stats-card__body">
            <Skeleton width="80%" height="32px" />
          </div>
          {subtitle && (
            <div className="stats-card__footer">
              <Skeleton width="40%" height="12px" />
            </div>
          )}
        </div>
      );
    }

    return (
      <div 
        ref={ref} 
        className={cardClasses}
        onClick={onClick}
        role={onClick ? 'button' : undefined}
        tabIndex={onClick ? 0 : undefined}
      >
        <div className="stats-card__header">
          <span className="stats-card__title">{title}</span>
          {renderIcon()}
        </div>
        
        <div className="stats-card__body">
          <span className="stats-card__value">{value}</span>
          {trend && (
            <div className={clsx(
              'stats-card__trend',
              trend.isPositive ? 'stats-card__trend--positive' : 'stats-card__trend--negative'
            )}>
              {trend.isPositive ? (
                <TrendingUp size={14} />
              ) : (
                <TrendingDown size={14} />
              )}
              <span>{Math.abs(trend.value)}%</span>
              {trend.label && (
                <span className="stats-card__trend-label">{trend.label}</span>
              )}
            </div>
          )}
        </div>

        {(subtitle || action) && (
          <div className="stats-card__footer">
            {subtitle && <span className="stats-card__subtitle">{subtitle}</span>}
            {action && <div className="stats-card__action">{action}</div>}
          </div>
        )}
      </div>
    );
  }
));

// Preset stat cards with Lucide icons
export const BalanceCard = memo(function BalanceCard({ 
  balance, 
  isLoading,
  trend,
}: { 
  balance: number;
  isLoading?: boolean;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <StatsCard
      title="Balance"
      value={formatSTX(balance, 2)}
      icon={Wallet}
      trend={trend}
      isLoading={isLoading}
      variant="primary"
      glow
    />
  );
});

export const ActiveCirclesCard = memo(function ActiveCirclesCard({ 
  count, 
  isLoading,
}: { 
  count: number;
  isLoading?: boolean;
}) {
  return (
    <StatsCard
      title="Active Circles"
      value={count}
      subtitle="Currently participating"
      icon={RefreshCw}
      isLoading={isLoading}
    />
  );
});

export const TotalSavedCard = memo(function TotalSavedCard({ 
  amount, 
  isLoading,
  trend,
}: { 
  amount: number;
  isLoading?: boolean;
  trend?: { value: number; isPositive: boolean };
}) {
  return (
    <StatsCard
      title="Total Saved"
      value={formatSTX(amount, 2)}
      icon={PiggyBank}
      trend={trend}
      isLoading={isLoading}
      variant="success"
    />
  );
});

export const NFTCountCard = memo(function NFTCountCard({ 
  count, 
  isLoading,
}: { 
  count: number;
  isLoading?: boolean;
}) {
  return (
    <StatsCard
      title="NFT Badges"
      value={count}
      subtitle="Earned from circles"
      icon={Trophy}
      isLoading={isLoading}
      variant="warning"
    />
  );
});

export default StatsCard;
