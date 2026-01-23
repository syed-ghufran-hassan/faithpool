// EscrowBalance component - Display escrow balance breakdown

import { forwardRef, memo, useMemo, type HTMLAttributes } from 'react';
import { Lock, Clock, Wallet, PiggyBank, CircleDollarSign, TrendingUp, Users } from 'lucide-react';
import clsx from 'clsx';
import { formatSTX, truncateAddress } from '../utils/helpers';
import './EscrowBalance.css';

// ============================================================================
// Types
// ============================================================================

export interface EscrowBalanceProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Total deposited amount (microSTX) */
  totalDeposited: number;
  /** Pending payout amount (microSTX) */
  pendingPayout: number;
  /** Available to withdraw (microSTX) */
  availableWithdraw: number;
  /** Locked amount (microSTX) */
  lockedAmount: number;
  /** Custom title */
  title?: string;
  /** Show detailed breakdown */
  showLegend?: boolean;
  /** Visual variant */
  variant?: 'default' | 'compact' | 'card';
}

export interface CompactEscrowProps extends HTMLAttributes<HTMLDivElement> {
  /** Balance amount (microSTX) */
  balance: number;
  /** Custom label */
  label?: string;
  /** Show icon */
  showIcon?: boolean;
}

export interface CircleEscrowProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Circle ID */
  circleId: number;
  /** User's deposits (microSTX) */
  yourDeposits: number;
  /** Total pool amount (microSTX) */
  poolTotal: number;
  /** Next payout amount (microSTX) */
  nextPayout: number;
  /** Address of next payout recipient */
  payoutRecipient?: string;
  /** Show member count */
  memberCount?: number;
}

// ============================================================================
// EscrowBalance Component
// ============================================================================

export const EscrowBalance = memo(
  forwardRef<HTMLDivElement, EscrowBalanceProps>(
    (
      {
        totalDeposited,
        pendingPayout,
        availableWithdraw,
        lockedAmount,
        title = 'Escrow Balance',
        showLegend = true,
        variant = 'default',
        className,
        ...props
      },
      ref
    ) => {
      const percentages = useMemo(() => {
        const total = totalDeposited;
        if (total === 0) return { locked: 0, pending: 0, available: 0 };

        return {
          locked: (lockedAmount / total) * 100,
          pending: (pendingPayout / total) * 100,
          available: (availableWithdraw / total) * 100,
        };
      }, [totalDeposited, pendingPayout, availableWithdraw, lockedAmount]);

      return (
        <div
          ref={ref}
          className={clsx('escrow-balance', `escrow-balance--${variant}`, className)}
          {...props}
        >
          <div className="escrow-balance__header">
            <h3 className="escrow-balance__title">
              <PiggyBank size={18} />
              {title}
            </h3>
            <span className="escrow-balance__total">{formatSTX(totalDeposited)}</span>
          </div>

          <div className="escrow-balance__bar">
            <div
              className="escrow-balance__segment escrow-balance__segment--locked"
              style={{ width: `${percentages.locked}%` }}
              title={`Locked: ${formatSTX(lockedAmount)}`}
            />
            <div
              className="escrow-balance__segment escrow-balance__segment--pending"
              style={{ width: `${percentages.pending}%` }}
              title={`Pending: ${formatSTX(pendingPayout)}`}
            />
            <div
              className="escrow-balance__segment escrow-balance__segment--available"
              style={{ width: `${percentages.available}%` }}
              title={`Available: ${formatSTX(availableWithdraw)}`}
            />
          </div>

          {showLegend && (
            <div className="escrow-balance__legend">
              <div className="escrow-balance__legend-item">
                <Lock size={14} className="escrow-balance__legend-icon escrow-balance__legend-icon--locked" />
                <span className="escrow-balance__legend-label">Locked</span>
                <span className="escrow-balance__legend-value">{formatSTX(lockedAmount)}</span>
              </div>
              <div className="escrow-balance__legend-item">
                <Clock size={14} className="escrow-balance__legend-icon escrow-balance__legend-icon--pending" />
                <span className="escrow-balance__legend-label">Pending Payout</span>
                <span className="escrow-balance__legend-value">{formatSTX(pendingPayout)}</span>
              </div>
              <div className="escrow-balance__legend-item">
                <Wallet size={14} className="escrow-balance__legend-icon escrow-balance__legend-icon--available" />
                <span className="escrow-balance__legend-label">Available</span>
                <span className="escrow-balance__legend-value">{formatSTX(availableWithdraw)}</span>
              </div>
            </div>
          )}
        </div>
      );
    }
  )
);

EscrowBalance.displayName = 'EscrowBalance';

// ============================================================================
// CompactEscrow Component
// ============================================================================

export const CompactEscrow = memo(
  forwardRef<HTMLDivElement, CompactEscrowProps>(
    ({ balance, label = 'In Escrow', showIcon = true, className, ...props }, ref) => (
      <div ref={ref} className={clsx('compact-escrow', className)} {...props}>
        {showIcon && <PiggyBank size={16} className="compact-escrow__icon" />}
        <span className="compact-escrow__label">{label}</span>
        <span className="compact-escrow__value">{formatSTX(balance)}</span>
      </div>
    )
  )
);

CompactEscrow.displayName = 'CompactEscrow';

// ============================================================================
// CircleEscrow Component
// ============================================================================

export const CircleEscrow = memo(
  forwardRef<HTMLDivElement, CircleEscrowProps>(
    (
      { circleId, yourDeposits, poolTotal, nextPayout, payoutRecipient, memberCount, className, ...props },
      ref
    ) => {
      const yourPercentage = poolTotal > 0 ? (yourDeposits / poolTotal) * 100 : 0;

      return (
        <div ref={ref} className={clsx('circle-escrow', className)} {...props}>
          <div className="circle-escrow__header">
            <span className="circle-escrow__id">
              <CircleDollarSign size={16} />
              Circle #{circleId}
            </span>
            <span className="circle-escrow__pool">{formatSTX(poolTotal)}</span>
          </div>

          <div className="circle-escrow__details">
            <div className="circle-escrow__row">
              <span>
                <TrendingUp size={14} />
                Your Deposits
              </span>
              <span>
                {formatSTX(yourDeposits)} ({yourPercentage.toFixed(1)}%)
              </span>
            </div>
            <div className="circle-escrow__row">
              <span>
                <Wallet size={14} />
                Next Payout
              </span>
              <span>{formatSTX(nextPayout)}</span>
            </div>
            {payoutRecipient && (
              <div className="circle-escrow__row">
                <span>Recipient</span>
                <span className="circle-escrow__recipient">{truncateAddress(payoutRecipient)}</span>
              </div>
            )}
            {memberCount !== undefined && (
              <div className="circle-escrow__row">
                <span>
                  <Users size={14} />
                  Members
                </span>
                <span>{memberCount}</span>
              </div>
            )}
          </div>
        </div>
      );
    }
  )
);

CircleEscrow.displayName = 'CircleEscrow';

// ============================================================================
// Exports
// ============================================================================

export default EscrowBalance;
