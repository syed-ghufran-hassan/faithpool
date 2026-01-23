// Activity Feed Component

import { formatRelativeTime, formatSTX, truncateAddress } from '../utils/helpers';
import './ActivityFeed.css';

export interface ActivityItem {
  id: string;
  type: 'join' | 'deposit' | 'payout' | 'create' | 'leave' | 'nft-mint' | 'nft-sale';
  user: string;
  circleId?: number;
  circleName?: string;
  amount?: number;
  timestamp: number;
  txId?: string;
}

interface ActivityFeedProps {
  activities: ActivityItem[];
  isLoading?: boolean;
  maxItems?: number;
  showCircle?: boolean;
  emptyMessage?: string;
}

const ACTIVITY_CONFIG = {
  'join': { icon: '👋', verb: 'joined', color: 'var(--color-success)' },
  'deposit': { icon: '💰', verb: 'deposited', color: 'var(--color-primary)' },
  'payout': { icon: '🎉', verb: 'received payout from', color: 'var(--color-warning)' },
  'create': { icon: '🆕', verb: 'created', color: 'var(--color-info)' },
  'leave': { icon: '👋', verb: 'left', color: 'var(--color-error)' },
  'nft-mint': { icon: '🖼️', verb: 'minted NFT in', color: 'var(--color-secondary)' },
  'nft-sale': { icon: '💸', verb: 'sold NFT from', color: 'var(--color-success)' },
};

export function ActivityFeed({
  activities,
  isLoading = false,
  maxItems = 10,
  showCircle = true,
  emptyMessage = 'No recent activity',
}: ActivityFeedProps) {
  const displayActivities = activities.slice(0, maxItems);

  if (isLoading) {
    return (
      <div className="activity-feed loading">
        {Array.from({ length: 5 }).map((_, i) => (
          <div key={i} className="activity-item skeleton">
            <div className="activity-icon-skeleton" />
            <div className="activity-content-skeleton">
              <div className="skeleton-line" style={{ width: '80%' }} />
              <div className="skeleton-line" style={{ width: '40%' }} />
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (activities.length === 0) {
    return (
      <div className="activity-feed empty">
        <span className="empty-icon">📭</span>
        <span className="empty-message">{emptyMessage}</span>
      </div>
    );
  }

  return (
    <div className="activity-feed">
      {displayActivities.map((activity) => {
        const config = ACTIVITY_CONFIG[activity.type];
        
        return (
          <div key={activity.id} className="activity-item">
            <div 
              className="activity-icon"
              style={{ backgroundColor: `${config.color}15` }}
            >
              {config.icon}
            </div>
            
            <div className="activity-content">
              <p className="activity-text">
                <span className="activity-user">
                  {truncateAddress(activity.user)}
                </span>
                {' '}{config.verb}{' '}
                {showCircle && activity.circleName && (
                  <span className="activity-circle">{activity.circleName}</span>
                )}
                {activity.amount !== undefined && (
                  <span className="activity-amount">
                    {' '}({formatSTX(activity.amount, 2)})
                  </span>
                )}
              </p>
              <span className="activity-time">
                {formatRelativeTime(activity.timestamp)}
              </span>
            </div>

            {activity.txId && (
              <a
                href={`https://explorer.hiro.so/txid/${activity.txId}?chain=mainnet`}
                target="_blank"
                rel="noopener noreferrer"
                className="activity-link"
                title="View transaction"
              >
                ↗
              </a>
            )}
          </div>
        );
      })}
    </div>
  );
}

export default ActivityFeed;
