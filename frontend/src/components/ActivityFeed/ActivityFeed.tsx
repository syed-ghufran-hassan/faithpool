import { memo, forwardRef, useMemo } from 'react';
import { 
  Coins, 
  PartyPopper, 
  UserPlus, 
  UserMinus, 
  Sparkles, 
  AlertTriangle 
} from 'lucide-react';
import clsx from 'clsx';
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

export interface ActivityFeedProps {
  activities: Activity[];
  maxItems?: number;
  showAvatar?: boolean;
  variant?: 'default' | 'compact';
  className?: string;
  emptyMessage?: string;
}

const ACTIVITY_CONFIG: Record<Activity['type'], { 
  icon: React.ReactNode; 
  color: string;
}> = {
  contribution: { 
    icon: <Coins size={14} />, 
    color: 'var(--color-success)' 
  },
  payout: { 
    icon: <PartyPopper size={14} />, 
    color: 'var(--color-primary)' 
  },
  join: { 
    icon: <UserPlus size={14} />, 
    color: 'var(--color-info)' 
  },
  leave: { 
    icon: <UserMinus size={14} />, 
    color: 'var(--color-text-muted)' 
  },
  create: { 
    icon: <Sparkles size={14} />, 
    color: 'var(--color-warning)' 
  },
  dispute: { 
    icon: <AlertTriangle size={14} />, 
    color: 'var(--color-danger)' 
  },
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

export const ActivityFeed = memo(forwardRef<HTMLDivElement, ActivityFeedProps>(
  function ActivityFeed(
    {
      activities,
      maxItems,
      showAvatar = true,
      variant = 'default',
      className,
      emptyMessage = 'No recent activity',
    },
    ref
  ) {
    const displayedActivities = useMemo(() => 
      maxItems ? activities.slice(0, maxItems) : activities,
      [activities, maxItems]
    );

    if (displayedActivities.length === 0) {
      return (
        <div 
          ref={ref}
          className={clsx(
            'activity-feed',
            'activity-feed--empty',
            className
          )}
        >
          <p className="activity-feed__empty-text">{emptyMessage}</p>
        </div>
      );
    }

    return (
      <div 
        ref={ref}
        className={clsx(
          'activity-feed',
          variant !== 'default' && `activity-feed--${variant}`,
          className
        )}
      >
        <ul className="activity-feed__list">
          {displayedActivities.map((activity) => {
            const config = ACTIVITY_CONFIG[activity.type];
            
            return (
              <li key={activity.id} className="activity-feed__item">
                <div className="activity-feed__indicator">
                  <span
                    className="activity-feed__dot"
                    style={{ backgroundColor: config.color }}
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
                    <span 
                      className="activity-feed__icon"
                      style={{ color: config.color }}
                    >
                      {config.icon}
                    </span>
                  </div>

                  <p className="activity-feed__message">
                    {getActivityMessage(activity)}
                  </p>

                  <time className="activity-feed__time">
                    {formatRelativeTime(typeof activity.timestamp === 'number' ? new Date(activity.timestamp) : activity.timestamp)}
                  </time>
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
));

export default ActivityFeed;
