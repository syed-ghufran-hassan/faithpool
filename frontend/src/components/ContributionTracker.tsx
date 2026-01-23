import React from 'react';
import { Card } from './Card';
import { Badge } from './Badge';
import { Button } from './Button';
import { ProgressBar } from './ProgressBar';
import { Skeleton } from './Skeleton';
import './ContributionTracker.css';

interface Contribution {
  round: number;
  amount: number;
  paidAt?: Date;
  txId?: string;
  status: 'paid' | 'pending' | 'missed' | 'upcoming';
}

interface ContributionTrackerProps {
  contributions: Contribution[];
  currentRound: number;
  totalRounds: number;
  contributionAmount: number;
  nextDueDate?: Date;
  isLoading?: boolean;
  onMakeContribution?: () => void;
  onViewTransaction?: (txId: string) => void;
  className?: string;
}

export const ContributionTracker: React.FC<ContributionTrackerProps> = ({
  contributions,
  currentRound,
  totalRounds,
  contributionAmount,
  nextDueDate,
  isLoading = false,
  onMakeContribution,
  onViewTransaction,
  className = '',
}) => {
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

  const getStatusBadge = (status: Contribution['status']) => {
    const config: Record<Contribution['status'], { variant: 'success' | 'warning' | 'error' | 'secondary'; label: string }> = {
      paid: { variant: 'success', label: 'Paid' },
      pending: { variant: 'warning', label: 'Pending' },
      missed: { variant: 'error', label: 'Missed' },
      upcoming: { variant: 'secondary', label: 'Upcoming' },
    };
    return <Badge variant={config[status].variant}>{config[status].label}</Badge>;
  };

  const paidContributions = contributions.filter(c => c.status === 'paid').length;
  const totalPaid = contributions
    .filter(c => c.status === 'paid')
    .reduce((sum, c) => sum + c.amount, 0);
  const progressPercentage = (currentRound / totalRounds) * 100;
  const hasPendingPayment = contributions.some(c => c.status === 'pending');

  if (isLoading) {
    return (
      <Card className={`contribution-tracker ${className}`}>
        <div className="contribution-tracker__header">
          <Skeleton width="150px" height="24px" />
          <Skeleton width="80px" height="20px" />
        </div>
        <Skeleton height="8px" />
        <div className="contribution-tracker__stats">
          <Skeleton width="100%" height="60px" />
        </div>
        <div className="contribution-tracker__list">
          {[1, 2, 3].map(i => (
            <Skeleton key={i} height="50px" />
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card className={`contribution-tracker ${className}`}>
      <div className="contribution-tracker__header">
        <h3>Contribution Tracker</h3>
        <Badge variant="info">Round {currentRound}/{totalRounds}</Badge>
      </div>

      <div className="contribution-tracker__progress">
        <ProgressBar
          value={progressPercentage}
          size="medium"
          showLabel
          labelFormat={(val) => `${Math.round(val)}% Complete`}
        />
      </div>

      <div className="contribution-tracker__stats">
        <div className="contribution-tracker__stat">
          <span className="contribution-tracker__stat-label">Contributions Made</span>
          <span className="contribution-tracker__stat-value">
            {paidContributions}/{totalRounds}
          </span>
        </div>
        <div className="contribution-tracker__stat">
          <span className="contribution-tracker__stat-label">Total Contributed</span>
          <span className="contribution-tracker__stat-value highlight">
            {formatSTX(totalPaid)} STX
          </span>
        </div>
        <div className="contribution-tracker__stat">
          <span className="contribution-tracker__stat-label">Per Round</span>
          <span className="contribution-tracker__stat-value">
            {formatSTX(contributionAmount)} STX
          </span>
        </div>
      </div>

      {nextDueDate && !hasPendingPayment && (
        <div className="contribution-tracker__next-due">
          <div className="contribution-tracker__next-due-info">
            <span className="contribution-tracker__next-due-label">Next Payment Due</span>
            <span className="contribution-tracker__next-due-date">
              {formatDate(nextDueDate)}
            </span>
          </div>
          <div className="contribution-tracker__countdown">
            <span className="contribution-tracker__countdown-value">
              {formatCountdown(nextDueDate)}
            </span>
            <span className="contribution-tracker__countdown-label">remaining</span>
          </div>
        </div>
      )}

      {hasPendingPayment && (
        <div className="contribution-tracker__pending-alert">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>You have a pending contribution. Please complete your payment.</span>
          <Button variant="primary" size="small" onClick={onMakeContribution}>
            Pay Now
          </Button>
        </div>
      )}

      <div className="contribution-tracker__list">
        <h4>Contribution History</h4>
        {contributions.length === 0 ? (
          <div className="contribution-tracker__empty">
            No contributions yet
          </div>
        ) : (
          <div className="contribution-tracker__items">
            {contributions.map((contribution) => (
              <div
                key={contribution.round}
                className={`contribution-tracker__item contribution-tracker__item--${contribution.status}`}
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
                  {getStatusBadge(contribution.status)}
                </div>

                {contribution.txId && (
                  <button
                    className="contribution-tracker__tx-link"
                    onClick={() => onViewTransaction?.(contribution.txId!)}
                    aria-label="View transaction"
                  >
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                      <polyline points="15 3 21 3 21 9" />
                      <line x1="10" y1="14" x2="21" y2="3" />
                    </svg>
                  </button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </Card>
  );
};

export default ContributionTracker;
