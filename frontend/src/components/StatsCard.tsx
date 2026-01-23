// StatsCard component - Display key metrics

import { formatSTX, formatSTXCompact } from '../utils/helpers';
import { Skeleton } from './Skeleton';
import './StatsCard.css';

interface StatsCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  icon?: React.ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  isLoading?: boolean;
  variant?: 'default' | 'primary' | 'success' | 'warning';
}

export function StatsCard({
  title,
  value,
  subtitle,
  icon,
  trend,
  isLoading = false,
  variant = 'default',
}: StatsCardProps) {
  if (isLoading) {
    return (
      <div className={`stats-card variant-${variant}`}>
        <div className="stats-header">
          <Skeleton width="60%" height="14px" />
        </div>
        <div className="stats-body">
          <Skeleton width="80%" height="32px" />
        </div>
        {subtitle && (
          <div className="stats-footer">
            <Skeleton width="40%" height="12px" />
          </div>
        )}
      </div>
    );
  }

  return (
    <div className={`stats-card variant-${variant}`}>
      <div className="stats-header">
        <span className="stats-title">{title}</span>
        {icon && <span className="stats-icon">{icon}</span>}
      </div>
      
      <div className="stats-body">
        <span className="stats-value">{value}</span>
        {trend && (
          <span className={`stats-trend ${trend.isPositive ? 'positive' : 'negative'}`}>
            {trend.isPositive ? '↑' : '↓'} {Math.abs(trend.value)}%
          </span>
        )}
      </div>

      {subtitle && (
        <div className="stats-footer">
          <span className="stats-subtitle">{subtitle}</span>
        </div>
      )}
    </div>
  );
}

// Preset stat cards
export function BalanceCard({ 
  balance, 
  isLoading 
}: { 
  balance: number;
  isLoading?: boolean;
}) {
  return (
    <StatsCard
      title="Balance"
      value={formatSTX(balance, 2)}
      icon="💰"
      isLoading={isLoading}
      variant="primary"
    />
  );
}

export function ActiveCirclesCard({ 
  count, 
  isLoading 
}: { 
  count: number;
  isLoading?: boolean;
}) {
  return (
    <StatsCard
      title="Active Circles"
      value={count}
      subtitle="Currently participating"
      icon="🔄"
      isLoading={isLoading}
    />
  );
}

export function TotalSavedCard({ 
  amount, 
  isLoading 
}: { 
  amount: number;
  isLoading?: boolean;
}) {
  return (
    <StatsCard
      title="Total Saved"
      value={formatSTX(amount, 2)}
      icon="📊"
      isLoading={isLoading}
      variant="success"
    />
  );
}

export function NFTCountCard({ 
  count, 
  isLoading 
}: { 
  count: number;
  isLoading?: boolean;
}) {
  return (
    <StatsCard
      title="NFT Badges"
      value={count}
      subtitle="Earned from circles"
      icon="🏆"
      isLoading={isLoading}
    />
  );
}

export default StatsCard;
