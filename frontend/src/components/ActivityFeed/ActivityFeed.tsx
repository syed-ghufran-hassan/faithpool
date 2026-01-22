import { formatRelativeTime } from '../../utils/date';
import { truncateAddress } from '../../utils';
import { Avatar } from '../Avatar';
import './ActivityFeed.css';

export interface Activity {
  id: string;
  type: 'contribution' | 'payout' | 'join' | 'leave' | 'create' | 'dispute';
  user: {
    address: string;
    name?: string;
  };
  circleName?: string;
  amount?: number;
  timestamp: string | number;
  description?: string;
}

interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  showAvatar?: boolean;
  className?: string;
  emptyMessage?: string;
}

const activityIcons: Record<Activity['type'], string> = {
  contribution: '💰',
  payout: '🎉',
  join: '👋',
  leave: '👋',
  create: '✨',
  dispute: '⚠️',
};

const activityColors: Record<Activity['type'], string> = {
  contribution: 'var(--color-success)',
  payout: 'var(--color-primary)',
  join: 'var(--color-info)',
  leave: 'var(--text-muted)',
  create: 'var(--color-warning)',
  dispute: 'var(--color-danger)',
};

function getActivityMessage(activity: Activity): string {
  const name = activity.user.name || truncateAddress(activity.user.address);
  
  switch (activity.type) {
    case 'contribution':
      return `${name} contributed ${activity.amount?.toLocaleString() ?? 0} STX${activity.circleName ? ` to ${activity.circleName}` : ''}`;
    case 'payout':
      return `${name} received payout of ${activity.amount?.toLocaleString() ?? 0} STX${activity.circleName ? ` from ${activity.circleName}` : ''}`;
    case 'join':
      return `${name} joined${activity.circleName ? ` ${activity.circleName}` : ' the circle'}`;
    case 'leave':
      return `${name} left${activity.circleName ? ` ${activity.circleName}` : ' the circle'}`;
    case 'create':
      return `${name} created${activity.circleName ? ` ${activity.circleName}` : ' a new circle'}`;
    case 'dispute':
      return `${name} raised a dispute${activity.circleName ? ` in ${activity.circleName}` : ''}`;
    default:
      return activity.description || 'Unknown activity';
  }
}

export function ActivityFeed({
  activities,
  maxItems,
  showAvatar = true,
  className = '',
  emptyMessage = 'No recent activity',
}: ActivityFeedProps) {
  const displayedActivities = maxItems ? activities.slice(0, maxItems) : activities;

  if (displayedActivities.length === 0) {
    return (
      <div className={`activity-feed activity-feed--empty ${className}`}>
        <p className="activity-feed__empty">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className={`activity-feed ${className}`}>
      <ul className="activity-feed__list">
        {displayedActivities.map((activity) => (
          <li key={activity.id} className="activity-feed__item">
            <div className="activity-feed__indicator">
              <span
                className="activity-feed__dot"
                style={{ backgroundColor: activityColors[activity.type] }}
              />
              <span className="activity-feed__line" />
            </div>

            <div className="activity-feed__content">
              <div className="activity-feed__header">
                {showAvatar && (
                  <Avatar
                    name={activity.user.name || activity.user.address}
                    size="sm"
                  />
                )}
                <span className="activity-feed__icon">
                  {activityIcons[activity.type]}
                </span>
              </div>

              <p className="activity-feed__message">
                {getActivityMessage(activity)}
              </p>

              <time className="activity-feed__time">
                {formatRelativeTime(activity.timestamp)}
              </time>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
