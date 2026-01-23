// ContributionTracker component - Track and display contributions

import { forwardRef, memo, type HTMLAttributes } from 'react';
import {
  Clock,
  CheckCircle2,
  AlertCircle,
  Timer,
  ExternalLink,
  Coins,
  TrendingUp,
  CalendarClock,
  History,
} from 'lucide-react';
import clsx from 'clsx';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';
import { Skeleton } from './Skeleton';
import './ContributionTracker.css';

// ============================================================================
// Types
// ============================================================================

export interface Contribution {
  round: number;
  amount: number;
  paidAt?: Date;
  txId?: string;
  status: 'paid' | 'pending' | 'missed' | 'upcoming';
}

export interface ContributionTrackerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** List of contributions */
  contributions: Contribution[];
  /** Current round number */
  currentRound: number;
  /** Total rounds in circle */
  totalRounds: number;
  /** Contribution amount per round (in microSTX) */
  contributionAmount: number;
  /** Next payment due date */
  nextDueDate?: Date;
  /** Loading state */
  isLoading?: boolean;
  /** Handler for making contribution */
  onMakeContribution?: () => void;
  /** Handler for viewing transaction */
  onViewTransaction?: (txId: string) => void;
  /** Custom title */
  title?: string;
  /** Compact mode */
  compact?: boolean;
}

// ============================================================================
// Utility Functions
// ============================================================================

const formatSTX = (microStx: number): string => {
  return (microStx / 1_000_000).toFixed(2);
};

const formatDate = (date: Date): string => {
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
};

const formatCountdown = (date: Date): string => {
  const now = new Date();
  const diff = date.getTime() - now.getTime();
  if (diff <= 0) return 'Overdue';

  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

  if (days > 0) return `${days}d ${hours}h`;
  if (hours > 0) return `${hours}h ${minutes}m`;
  return `${minutes}m`;
};

type StatusVariant = 'success' | 'warning' | 'error' | 'secondary';

const getStatusConfig = (status: Contribution['status']): { variant: StatusVariant; label: string; icon: React.ReactNode } => {
  const config: Record<Contribution['status'], { variant: StatusVariant; label: string; icon: React.ReactNode }> = {
    paid: { variant: 'success', label: 'Paid', icon: <CheckCircle2 size={12} /> },
    pending: { variant: 'warning', label: 'Pending', icon: <Clock size={12} /> },
    missed: { variant: 'error', label: 'Missed', icon: <AlertCircle size={12} /> },
    upcoming: { variant: 'secondary', label: 'Upcoming', icon: <Timer size={12} /> },
  };
  return config[status];
};

// ============================================================================
// Component
// ============================================================================

export const ContributionTracker = memo(
  forwardRef<HTMLDivElement, ContributionTrackerProps>(
    (
      {
        contributions,
        currentRound,
        totalRounds,
        contributionAmount,
        nextDueDate,
        isLoading = false,
        onMakeContribution,
        onViewTransaction,
        title = 'Contribution Tracker',
        compact = false,
        className,
        ...props
      },
      ref
    ) => {
      const paidContributions = contributions.filter((c) => c.status === 'paid').length;
      const totalPaid = contributions
        .filter((c) => c.status === 'paid')
        .reduce((sum, c) => sum + c.amount, 0);
      const progressPercentage = (currentRound / totalRounds) * 100;
      const hasPendingPayment = contributions.some((c) => c.status === 'pending');

      if (isLoading) {
        return (
          <Card
            ref={ref}
            className={clsx('contribution-tracker', 'contribution-tracker--loading', className)}
            {...props}
          >
            <div className="contribution-tracker__header">
              <Skeleton width="150px" height="24px" />
              <Skeleton width="80px" height="20px" />
            </div>
            <Skeleton height="8px" />
            <div className="contribution-tracker__stats">
              <Skeleton width="100%" height="60px" />
            </div>
            <div className="contribution-tracker__list">
              {[1, 2, 3].map((i) => (
                <Skeleton key={i} height="50px" />
              ))}
            </div>
          </Card>
        );
      }

      return (
        <Card
          ref={ref}
          className={clsx(
            'contribution-tracker',
            { 'contribution-tracker--compact': compact },
            className
          )}
          {...props}
        >
          <div className="contribution-tracker__header">
            <h3>
              <History size={18} />
              {title}
            </h3>
            <Badge variant="info">
              Round {currentRound}/{totalRounds}
            </Badge>
          </div>

          <div className="contribution-tracker__progress">
            <ProgressBar
              value={progressPercentage}
              size="md"
              showLabel
            />
          </div>

          <div className="contribution-tracker__stats">
            <div className="contribution-tracker__stat">
              <CheckCircle2 className="contribution-tracker__stat-icon" size={16} />
              <span className="contribution-tracker__stat-label">Contributions Made</span>
              <span className="contribution-tracker__stat-value">
                {paidContributions}/{totalRounds}
              </span>
            </div>
            <div className="contribution-tracker__stat">
              <TrendingUp className="contribution-tracker__stat-icon contribution-tracker__stat-icon--highlight" size={16} />
              <span className="contribution-tracker__stat-label">Total Contributed</span>
              <span className="contribution-tracker__stat-value contribution-tracker__stat-value--highlight">
                {formatSTX(totalPaid)} STX
              </span>
            </div>
            <div className="contribution-tracker__stat">
              <Coins className="contribution-tracker__stat-icon" size={16} />
              <span className="contribution-tracker__stat-label">Per Round</span>
              <span className="contribution-tracker__stat-value">{formatSTX(contributionAmount)} STX</span>
            </div>
          </div>

          {nextDueDate && !hasPendingPayment && (
            <div className="contribution-tracker__next-due">
              <div className="contribution-tracker__next-due-info">
                <CalendarClock size={16} className="contribution-tracker__next-due-icon" />
                <div>
                  <span className="contribution-tracker__next-due-label">Next Payment Due</span>
                  <span className="contribution-tracker__next-due-date">{formatDate(nextDueDate)}</span>
                </div>
              </div>
              <div className="contribution-tracker__countdown">
                <span className="contribution-tracker__countdown-value">{formatCountdown(nextDueDate)}</span>
                <span className="contribution-tracker__countdown-label">remaining</span>
              </div>
            </div>
          )}

          {hasPendingPayment && (
            <div className="contribution-tracker__pending-alert">
              <Clock size={20} className="contribution-tracker__pending-icon" />
              <span>You have a pending contribution. Please complete your payment.</span>
              <Button variant="primary" size="sm" onClick={onMakeContribution}>
                Pay Now
              </Button>
            </div>
          )}

          {!compact && (
            <div className="contribution-tracker__list">
              <h4>Contribution History</h4>
              {contributions.length === 0 ? (
                <div className="contribution-tracker__empty">
                  <Coins size={24} />
                  <span>No contributions yet</span>
                </div>
              ) : (
                <div className="contribution-tracker__items">
                  {contributions.map((contribution) => {
                    const statusConfig = getStatusConfig(contribution.status);
                    return (
                      <div
                        key={contribution.round}
                        className={clsx(
                          'contribution-tracker__item',
                          `contribution-tracker__item--${contribution.status}`
                        )}
                      >
                        <div className="contribution-tracker__item-round">
                          <span className="contribution-tracker__round-number">
                            Round {contribution.round}
                          </span>
                          {contribution.paidAt && (
                            <span className="contribution-tracker__paid-date">
                              {formatDate(contribution.paidAt)}
                            </span>
                          )}
                        </div>

                        <div className="contribution-tracker__item-amount">
                          {formatSTX(contribution.amount)} STX
                        </div>

                        <div className="contribution-tracker__item-status">
                          <Badge variant={statusConfig.variant} size="sm">
                            {statusConfig.icon}
                            {statusConfig.label}
                          </Badge>
                        </div>

                        {contribution.txId && (
                          <button
                            className="contribution-tracker__tx-link"
                            onClick={() => onViewTransaction?.(contribution.txId!)}
                            aria-label="View transaction"
                          >
                            <ExternalLink size={14} />
                          </button>
                        )}
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </Card>
      );
    }
  )
);

ContributionTracker.displayName = 'ContributionTracker';

// ============================================================================
// Exports
// ============================================================================

export default ContributionTracker;
