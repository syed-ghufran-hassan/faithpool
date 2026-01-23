// Activity Feed Component

import { forwardRef, memo, useMemo } from 'react';
import { 
  UserPlus, 
  Wallet, 
  Gift, 
  PlusCircle, 
  UserMinus, 
  Image, 
  DollarSign,
  ExternalLink,
  Inbox,
  type LucideIcon 
} from 'lucide-react';
import clsx from 'clsx';
import { formatRelativeTime, formatSTX, truncateAddress } from '../utils/helpers';
import { Avatar } from './Avatar';
import { Skeleton } from './Skeleton';
import './ActivityFeed.css';

export type ActivityType = 'join' | 'deposit' | 'payout' | 'create' | 'leave' | 'nft-mint' | 'nft-sale';

export interface ActivityItem {
  id: string;
  type: ActivityType;
  user: string;
  userAvatar?: string;
  circleId?: number;
  circleName?: string;
  amount?: number;
  timestamp: number;
  txId?: string;
  metadata?: Record<string, unknown>;
}

export interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
  showCircle?: boolean;
  showAvatar?: boolean;
  compact?: boolean;
  emptyMessage?: string;
  onItemClick?: (activity: ActivityItem) => void;
  className?: string;
}

interface ActivityConfig {
  icon: LucideIcon;
  verb: string;
  color: string;
  bgColor: string;
}

const ACTIVITY_CONFIG: Record<ActivityType, ActivityConfig> = {
  'join': { 
    icon: UserPlus, 
    verb: 'joined', 
    color: 'var(--color-success)',
    bgColor: 'var(--color-success-bg)',
  },
  'deposit': { 
    icon: Wallet, 
    verb: 'deposited to', 
    color: 'var(--color-primary)',
    bgColor: 'var(--color-primary-bg)',
  },
  'payout': { 
    icon: Gift, 
    verb: 'received payout from', 
    color: 'var(--color-warning)',
    bgColor: 'var(--color-warning-bg)',
  },
  'create': { 
    icon: PlusCircle, 
    verb: 'created', 
    color: 'var(--color-info)',
    bgColor: 'var(--color-info-bg)',
  },
  'leave': { 
    icon: UserMinus, 
    verb: 'left', 
    color: 'var(--color-error)',
    bgColor: 'var(--color-error-bg)',
  },
  'nft-mint': { 
    icon: Image, 
    verb: 'minted NFT in', 
    color: 'var(--color-secondary)',
    bgColor: 'rgba(139, 92, 246, 0.1)',
  },
  'nft-sale': { 
    icon: DollarSign, 
    verb: 'sold NFT from', 
    color: 'var(--color-success)',
    bgColor: 'var(--color-success-bg)',
  },
};

const ActivityItemSkeleton = memo(function ActivityItemSkeleton() {
  return (
    <div className="activity-item activity-item--skeleton">
      <Skeleton variant="circular" width={40} height={40} />
      <div className="activity-item__content-skeleton">
        <Skeleton width="80%" height={14} />
        <Skeleton width="40%" height={12} />
      </div>
    </div>
  );
});

export const ActivityFeed = forwardRef<HTMLDivElement, ActivityFeedProps>(
  function ActivityFeed(
    {
      activities,
      isLoading = false,
      maxItems = 10,
      showCircle = true,
      showAvatar = true,
      compact = false,
      emptyMessage = 'No recent activity',
      onItemClick,
      className,
    },
    ref
  ) {
    const displayActivities = useMemo(
      () => activities.slice(0, maxItems),
      [activities, maxItems]
    );

    const containerClasses = clsx(
      'activity-feed',
      {
        'activity-feed--compact': compact,
      },
      className
    );

    if (isLoading) {
      return (
        <div ref={ref} className={containerClasses}>
          {Array.from({ length: 5 }).map((_, i) => (
            <ActivityItemSkeleton key={i} />
          ))}
        </div>
      );
    }

    if (activities.length === 0) {
      return (
        <div ref={ref} className={clsx(containerClasses, 'activity-feed--empty')}>
          <Inbox size={40} className="activity-feed__empty-icon" />
          <span className="activity-feed__empty-message">{emptyMessage}</span>
        </div>
      );
    }

    return (
      <div ref={ref} className={containerClasses}>
        {displayActivities.map((activity) => {
          const config = ACTIVITY_CONFIG[activity.type];
          const IconComponent = config.icon;

          return (
            <div
              key={activity.id}
              className={clsx('activity-item', {
                'activity-item--clickable': !!onItemClick,
              })}
              onClick={() => onItemClick?.(activity)}
              role={onItemClick ? 'button' : undefined}
              tabIndex={onItemClick ? 0 : undefined}
            >
              {/* Icon or Avatar */}
              {showAvatar && activity.userAvatar ? (
                <Avatar
                  src={activity.userAvatar}
                  name={activity.user}
                  size="sm"
                />
              ) : (
                <div
                  className="activity-item__icon"
                  style={{ 
                    backgroundColor: config.bgColor,
                    color: config.color,
                  }}
                >
                  <IconComponent size={18} />
                </div>
              )}

              {/* Content */}
              <div className="activity-item__content">
                <p className="activity-item__text">
                  <span className="activity-item__user">
                    {truncateAddress(activity.user)}
                  </span>
                  <span className="activity-item__verb">{config.verb}</span>
                  {showCircle && activity.circleName && (
                    <span className="activity-item__circle">{activity.circleName}</span>
                  )}
                  {activity.amount !== undefined && (
                    <span className="activity-item__amount">
                      {formatSTX(activity.amount, 2)}
                    </span>
                  )}
                </p>
                <span className="activity-item__time">
                  {formatRelativeTime(activity.timestamp)}
                </span>
              </div>

              {/* Transaction Link */}
              {activity.txId && (
                <a
                  href={`https://explorer.hiro.so/txid/${activity.txId}?chain=mainnet`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="activity-item__link"
                  title="View transaction"
                  onClick={(e) => e.stopPropagation()}
                >
                  <ExternalLink size={14} />
                </a>
              )}
            </div>
          );
        })}
      </div>
    );
  }
);

export default ActivityFeed;
