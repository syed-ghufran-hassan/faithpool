// Dashboard Summary Component

import { forwardRef, memo, useMemo } from 'react';
import { 
  Wallet, 
  RefreshCw, 
  CheckCircle, 
  ArrowUpRight, 
  ArrowDownLeft,
  TrendingUp,
  TrendingDown,
  Image,
  Gift,
  ChevronRight
} from 'lucide-react';
import clsx from 'clsx';
import { formatSTX } from '../utils/helpers';
import { StatsCard } from './StatsCard';
import { ReputationBadge } from './ReputationBadge';
import './DashboardSummary.css';

export interface DashboardSummaryProps {
  /** Wallet balance in microSTX */
  balance: number;
  /** Total deposited in microSTX */
  totalDeposited: number;
  /** Total received in microSTX */
  totalReceived: number;
  /** Number of active circles */
  activeCircles: number;
  /** Number of completed circles */
  completedCircles: number;
  /** Reputation score */
  reputation: number;
  /** Number of NFTs owned */
  nftCount: number;
  /** Number of pending payouts */
  pendingPayouts: number;
  /** Optional class name */
  className?: string;
  /** Click handler for pending payouts */
  onPayoutsClick?: () => void;
  /** Display variant */
  variant?: 'default' | 'compact';
  /** Show full stats grid */
  showFullStats?: boolean;
}

export const DashboardSummary = memo(forwardRef<HTMLDivElement, DashboardSummaryProps>(
  function DashboardSummary(
    {
      balance,
      totalDeposited,
      totalReceived,
      activeCircles,
      completedCircles,
      reputation,
      nftCount,
      pendingPayouts,
      className,
      onPayoutsClick,
      variant = 'default',
      showFullStats = true,
    },
    ref
  ) {
    const { netPosition, isPositive } = useMemo(() => {
      const net = totalReceived - totalDeposited;
      return { netPosition: net, isPositive: net >= 0 };
    }, [totalReceived, totalDeposited]);

    return (
      <div 
        ref={ref}
        className={clsx(
          'dashboard-summary',
          `dashboard-summary--${variant}`,
          className
        )}
      >
        <div className="dashboard-summary__header">
          <div className="dashboard-summary__balance">
            <span className="dashboard-summary__balance-label">
              <Wallet size={16} />
              Wallet Balance
            </span>
            <span className="dashboard-summary__balance-value">{formatSTX(balance, 2)}</span>
          </div>
          <ReputationBadge score={reputation} size="lg" />
        </div>

        {showFullStats && (
          <div className="dashboard-summary__grid">
            <StatsCard
              title="Active Circles"
              value={activeCircles}
              icon={<RefreshCw size={20} />}
              variant="primary"
            />
            
            <StatsCard
              title="Completed"
              value={completedCircles}
              icon={<CheckCircle size={20} />}
              variant="success"
            />

            <StatsCard
              title="Total Deposited"
              value={formatSTX(totalDeposited, 2)}
              icon={<ArrowUpRight size={20} />}
              variant="default"
            />

            <StatsCard
              title="Total Received"
              value={formatSTX(totalReceived, 2)}
              icon={<ArrowDownLeft size={20} />}
              variant="success"
            />

            <StatsCard
              title="Net Position"
              value={`${isPositive ? '+' : ''}${formatSTX(netPosition, 2)}`}
              icon={isPositive ? <TrendingUp size={20} /> : <TrendingDown size={20} />}
              variant={isPositive ? 'success' : 'warning'}
            />

            <StatsCard
              title="NFTs Owned"
              value={nftCount}
              icon={<Image size={20} />}
              variant="default"
            />
          </div>
        )}

        {pendingPayouts > 0 && (
          <button 
            className="dashboard-summary__alert"
            onClick={onPayoutsClick}
            type="button"
          >
            <Gift className="dashboard-summary__alert-icon" />
            <span className="dashboard-summary__alert-text">
              You have <strong>{pendingPayouts}</strong> pending payout{pendingPayouts > 1 ? 's' : ''} to claim!
            </span>
            <ChevronRight className="dashboard-summary__alert-arrow" />
          </button>
        )}
      </div>
    );
  }
));

export { DashboardSummary as default };
