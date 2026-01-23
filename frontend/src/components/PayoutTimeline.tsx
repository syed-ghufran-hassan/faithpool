// PayoutTimeline component - Visual payout schedule

import { forwardRef, memo, type HTMLAttributes } from 'react';
import { Check, Clock, Star, CircleDot, Coins, Calendar } from 'lucide-react';
import clsx from 'clsx';
import { useBlockchain } from '../hooks/useBlockchain';
import { truncateAddress } from '../utils/helpers';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import './PayoutTimeline.css';

// ============================================================================
// Types
// ============================================================================

export interface PayoutSlot {
  slot: number;
  address: string;
  isPast: boolean;
  isCurrent: boolean;
  isFuture: boolean;
  payoutBlock?: number;
}

export interface PayoutTimelineProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Array of circle members with slot info */
  members: { address: string; slot: number }[];
  /** Current round number */
  currentRound: number;
  /** Blocks between payouts */
  payoutInterval: number;
  /** Starting block of circle */
  startBlock: number;
  /** Connected user's address */
  userAddress?: string | null;
  /** Custom title */
  title?: string;
  /** Visual variant */
  variant?: 'default' | 'compact' | 'horizontal';
  /** Show estimated times */
  showTimes?: boolean;
  /** Max items to display before collapsing */
  maxVisible?: number;
}

export interface PayoutTimelineCompactProps extends HTMLAttributes<HTMLDivElement> {
  /** Total number of rounds */
  totalRounds: number;
  /** Current round */
  currentRound: number;
  /** User's slot number */
  userSlot?: number;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Show round label */
  showLabel?: boolean;
}

// ============================================================================
// PayoutTimeline Component
// ============================================================================

export const PayoutTimeline = memo(
  forwardRef<HTMLDivElement, PayoutTimelineProps>(
    (
      {
        members,
        currentRound,
        payoutInterval,
        startBlock,
        userAddress,
        title = 'Payout Schedule',
        variant = 'default',
        showTimes = true,
        maxVisible,
        className,
        ...props
      },
      ref
    ) => {
      const { currentBlock, timeUntil } = useBlockchain();

      // Sort members by slot
      const sortedMembers = [...members].sort((a, b) => a.slot - b.slot);

      // Build payout slots
      const slots: PayoutSlot[] = sortedMembers.map((member) => {
        const payoutBlock = startBlock + member.slot * payoutInterval;
        return {
          slot: member.slot,
          address: member.address,
          isPast: member.slot < currentRound,
          isCurrent: member.slot === currentRound,
          isFuture: member.slot > currentRound,
          payoutBlock,
        };
      });

      // Apply max visible limit
      const displaySlots = maxVisible ? slots.slice(0, maxVisible) : slots;
      const hiddenCount = maxVisible ? Math.max(0, slots.length - maxVisible) : 0;

      if (variant === 'horizontal') {
        return (
          <div
            ref={ref}
            className={clsx('payout-timeline', 'payout-timeline--horizontal', className)}
            {...props}
          >
            <div className="payout-timeline__header">
              <Calendar className="payout-timeline__header-icon" size={16} />
              <h4 className="payout-timeline__title">{title}</h4>
            </div>
            <div className="payout-timeline__horizontal-track">
              {displaySlots.map((slot, index) => {
                const isUser = slot.address === userAddress;
                return (
                  <div
                    key={slot.slot}
                    className={clsx('payout-timeline__horizontal-slot', {
                      'payout-timeline__horizontal-slot--past': slot.isPast,
                      'payout-timeline__horizontal-slot--current': slot.isCurrent,
                      'payout-timeline__horizontal-slot--future': slot.isFuture,
                      'payout-timeline__horizontal-slot--user': isUser,
                    })}
                  >
                    <div className="payout-timeline__horizontal-node">
                      {slot.isPast ? (
                        <Check size={12} />
                      ) : slot.isCurrent ? (
                        <Coins size={12} />
                      ) : (
                        <span>{slot.slot}</span>
                      )}
                    </div>
                    {index < displaySlots.length - 1 && (
                      <div
                        className={clsx('payout-timeline__horizontal-line', {
                          'payout-timeline__horizontal-line--completed': slot.isPast,
                        })}
                      />
                    )}
                  </div>
                );
              })}
            </div>
          </div>
        );
      }

      return (
        <div
          ref={ref}
          className={clsx('payout-timeline', `payout-timeline--${variant}`, className)}
          {...props}
        >
          <div className="payout-timeline__header">
            <Calendar className="payout-timeline__header-icon" size={16} />
            <h4 className="payout-timeline__title">{title}</h4>
          </div>

          <div className="payout-timeline__track">
            {displaySlots.map((slot, index) => {
              const isUser = slot.address === userAddress;

              return (
                <div
                  key={slot.slot}
                  className={clsx('payout-timeline__slot', {
                    'payout-timeline__slot--past': slot.isPast,
                    'payout-timeline__slot--current': slot.isCurrent,
                    'payout-timeline__slot--future': slot.isFuture,
                    'payout-timeline__slot--user': isUser,
                  })}
                >
                  <div className="payout-timeline__connector">
                    {index > 0 && <div className="payout-timeline__connector-line" />}
                  </div>

                  <div className="payout-timeline__node">
                    <Avatar address={slot.address} size="sm" />
                    {slot.isCurrent && <span className="payout-timeline__current-indicator" />}
                  </div>

                  <div className="payout-timeline__info">
                    <span className="payout-timeline__address">
                      {truncateAddress(slot.address)}
                      {isUser && (
                        <Badge variant="primary" size="sm">
                          You
                        </Badge>
                      )}
                    </span>
                    <span className="payout-timeline__round">
                      <CircleDot size={12} />
                      Round {slot.slot}
                    </span>
                    {showTimes && slot.isCurrent && slot.payoutBlock && (
                      <span className="payout-timeline__time">
                        <Clock size={12} />
                        {currentBlock >= slot.payoutBlock
                          ? 'Ready to claim'
                          : `~${timeUntil(slot.payoutBlock)}`}
                      </span>
                    )}
                    {slot.isPast && (
                      <span className="payout-timeline__status payout-timeline__status--completed">
                        <Check size={12} />
                        Completed
                      </span>
                    )}
                  </div>
                </div>
              );
            })}

            {hiddenCount > 0 && (
              <div className="payout-timeline__hidden-count">
                +{hiddenCount} more rounds
              </div>
            )}
          </div>
        </div>
      );
    }
  )
);

PayoutTimeline.displayName = 'PayoutTimeline';

// ============================================================================
// PayoutTimelineCompact Component
// ============================================================================

export const PayoutTimelineCompact = memo(
  forwardRef<HTMLDivElement, PayoutTimelineCompactProps>(
    (
      {
        totalRounds,
        currentRound,
        userSlot,
        size = 'md',
        showLabel = true,
        className,
        ...props
      },
      ref
    ) => {
      return (
        <div
          ref={ref}
          className={clsx(
            'payout-timeline-compact',
            `payout-timeline-compact--${size}`,
            className
          )}
          {...props}
        >
          <div className="payout-timeline-compact__track">
            {Array.from({ length: totalRounds }, (_, i) => {
              const round = i + 1;
              const isPast = round < currentRound;
              const isCurrent = round === currentRound;
              const isUser = round === userSlot;

              return (
                <div
                  key={round}
                  className={clsx('payout-timeline-compact__dot', {
                    'payout-timeline-compact__dot--past': isPast,
                    'payout-timeline-compact__dot--current': isCurrent,
                    'payout-timeline-compact__dot--user': isUser,
                  })}
                  title={`Round ${round}${isUser ? ' (You)' : ''}`}
                >
                  {isUser && (
                    <Star className="payout-timeline-compact__user-marker" size={10} />
                  )}
                </div>
              );
            })}
          </div>
          {showLabel && (
            <div className="payout-timeline-compact__label">
              Round {currentRound} of {totalRounds}
            </div>
          )}
        </div>
      );
    }
  )
);

PayoutTimelineCompact.displayName = 'PayoutTimelineCompact';

// ============================================================================
// Exports
// ============================================================================

export default PayoutTimeline;
