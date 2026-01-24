// CircleCard component - Display circle summary

import { forwardRef, memo, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, Wallet, TrendingUp, Zap } from 'lucide-react';
import { formatSTX } from '../utils/helpers';
import { Badge } from './Badge';
import { ProgressBar } from './ProgressBar';
import { Card } from './Card';
import { Avatar } from './Avatar';
import clsx from 'clsx';
import './CircleCard.css';

export type CircleStatus = 'open' | 'active' | 'completed' | 'paused';

export interface CircleCardProps {
  id: number;
  name: string;
  contribution: number;
  currentMembers: number;
  maxMembers: number;
  status: CircleStatus;
  frequency: string;
  currentRound?: number;
  escrowBalance?: number;
  creator?: string;
  creatorAvatar?: string;
  nextPayoutBlock?: number;
  memberAvatars?: string[];
  featured?: boolean;
  compact?: boolean;
  onClick?: () => void;
  className?: string;
}

const statusConfig: Record<CircleStatus, { 
  variant: 'success' | 'warning' | 'default' | 'error';
  label: string;
  icon?: React.ReactNode;
}> = {
  active: { variant: 'success', label: 'Active', icon: <Zap size={12} /> },
  open: { variant: 'warning', label: 'Open' },
  completed: { variant: 'default', label: 'Completed' },
  paused: { variant: 'error', label: 'Paused' },
};

export const CircleCard = memo(forwardRef<HTMLDivElement, CircleCardProps>(
  function CircleCard(
    {
      id,
      name,
      contribution,
      currentMembers,
      maxMembers,
      status,
      frequency,
      currentRound,
      escrowBalance,
      creator,
      creatorAvatar,
      nextPayoutBlock: _nextPayoutBlock,
      memberAvatars = [],
      featured = false,
      compact = false,
      onClick,
      className,
    },
    ref
  ) {
    // _nextPayoutBlock available for future use
    void _nextPayoutBlock;
    
    const memberProgress = useMemo(() => 
      Math.round((currentMembers / maxMembers) * 100), 
      [currentMembers, maxMembers]
    );
    
    const slotsAvailable = maxMembers - currentMembers;
    const { variant, label, icon } = statusConfig[status];

    const stats = useMemo(() => [
      {
        icon: <Wallet size={14} />,
        label: 'Contribution',
        value: formatSTX(contribution, 2),
      },
      {
        icon: <Clock size={14} />,
        label: 'Frequency',
        value: frequency.charAt(0).toUpperCase() + frequency.slice(1),
      },
      {
        icon: <Users size={14} />,
        label: 'Members',
        value: `${currentMembers} / ${maxMembers}`,
      },
      ...(currentRound !== undefined && status === 'active' ? [{
        icon: <TrendingUp size={14} />,
        label: 'Round',
        value: `${currentRound} / ${maxMembers}`,
      }] : []),
    ], [contribution, frequency, currentMembers, maxMembers, currentRound, status]);

    const cardClasses = clsx(
      'circle-card',
      {
        'circle-card--featured': featured,
        'circle-card--compact': compact,
      },
      className
    );

    return (
      <Card ref={ref} className={cardClasses} onClick={onClick} variant={featured ? 'elevated' : 'default'}>
        <Link to={`/circles/${id}`} className="circle-card__link">
          {/* Header */}
          <div className="circle-card__header">
            <div className="circle-card__title-row">
              <h3 className="circle-card__name">{name}</h3>
              <Badge variant={variant} size="sm">
                {icon}
                {label}
              </Badge>
            </div>
            {creator && (
              <div className="circle-card__creator">
                <Avatar 
                  name={creator} 
                  src={creatorAvatar} 
                  size="xs" 
                />
                <span className="circle-card__creator-label">by {creator}</span>
              </div>
            )}
          </div>

          {/* Stats Grid */}
          {!compact && (
            <div className="circle-card__stats">
              {stats.map((stat, index) => (
                <div key={index} className="circle-card__stat">
                  <span className="circle-card__stat-icon">{stat.icon}</span>
                  <div className="circle-card__stat-content">
                    <span className="circle-card__stat-label">{stat.label}</span>
                    <span className="circle-card__stat-value">{stat.value}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Compact Stats */}
          {compact && (
            <div className="circle-card__compact-stats">
              <span>{formatSTX(contribution, 2)}</span>
              <span className="circle-card__compact-divider">•</span>
              <span>{currentMembers}/{maxMembers} members</span>
            </div>
          )}

          {/* Progress */}
          <div className="circle-card__progress">
            <div className="circle-card__progress-header">
              <span className="circle-card__progress-label">
                {status === 'open' ? 'Filling...' : 'Capacity'}
              </span>
              <span className="circle-card__progress-value">{memberProgress}%</span>
            </div>
            <ProgressBar 
              value={memberProgress} 
              max={100}
              size="sm"
              variant={status === 'open' ? 'warning' : 'default'}
              animated={status === 'open'}
            />
            {status === 'open' && slotsAvailable > 0 && (
              <span className="circle-card__slots">
                {slotsAvailable} slot{slotsAvailable > 1 ? 's' : ''} available
              </span>
            )}
          </div>

          {/* Member Avatars Preview */}
          {memberAvatars.length > 0 && !compact && (
            <div className="circle-card__members-preview">
              <div className="circle-card__avatar-stack">
                {memberAvatars.slice(0, 4).map((avatar, idx) => (
                  <Avatar 
                    key={idx} 
                    src={avatar} 
                    size="xs" 
                    className="circle-card__stacked-avatar"
                  />
                ))}
                {memberAvatars.length > 4 && (
                  <span className="circle-card__more-members">
                    +{memberAvatars.length - 4}
                  </span>
                )}
              </div>
            </div>
          )}

          {/* Escrow Balance */}
          {escrowBalance !== undefined && escrowBalance > 0 && !compact && (
            <div className="circle-card__escrow">
              <div className="circle-card__escrow-info">
                <span className="circle-card__escrow-label">Pool Balance</span>
                <span className="circle-card__escrow-value">{formatSTX(escrowBalance, 2)}</span>
              </div>
            </div>
          )}
        </Link>
      </Card>
    );
  }
));

export default CircleCard;
