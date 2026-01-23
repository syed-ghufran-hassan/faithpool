// MemberList component - Display circle members

import { forwardRef, memo, type HTMLAttributes } from 'react';
import { Check, Crown, Coins, Users, ChevronRight } from 'lucide-react';
import clsx from 'clsx';
import { truncateAddress } from '../utils/helpers';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import './MemberList.css';

// ============================================================================
// Types
// ============================================================================

export interface Member {
  address: string;
  slot: number;
  hasDeposited?: boolean;
  isCreator?: boolean;
  isCurrentTurn?: boolean;
  reputation?: number;
  joinedAt?: string;
}

export interface MemberListProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Array of circle members */
  members: Member[];
  /** Current round number to highlight receiving member */
  currentRound?: number;
  /** Currently connected user's address */
  userAddress?: string | null;
  /** Handler when clicking on a member */
  onMemberClick?: (address: string) => void;
  /** Custom title (default: "Members (count)") */
  title?: string;
  /** Show detailed view with reputation */
  showDetails?: boolean;
  /** Loading state */
  loading?: boolean;
  /** Empty state message */
  emptyMessage?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'bordered' | 'minimal';
}

export interface MemberListCompactProps extends HTMLAttributes<HTMLDivElement> {
  /** Array of members to display */
  members: Member[];
  /** Maximum avatars to show before +N badge */
  maxDisplay?: number;
  /** Show total count label */
  showCount?: boolean;
  /** Size of avatars */
  size?: 'xs' | 'sm' | 'md';
}

// ============================================================================
// MemberList Component
// ============================================================================

export const MemberList = forwardRef<HTMLDivElement, MemberListProps>(
  (
    {
      members,
      currentRound,
      userAddress,
      onMemberClick,
      title,
      showDetails = false,
      loading = false,
      emptyMessage = 'No members yet',
      size = 'md',
      variant = 'default',
      className,
      ...props
    },
    ref
  ) => {
    if (loading) {
      return (
        <div
          ref={ref}
          className={clsx('member-list', `member-list--${variant}`, className)}
          {...props}
        >
          <div className="member-list__header">
            <div className="member-list__title-skeleton" />
          </div>
          <ul className="member-list__items">
            {[1, 2, 3].map((i) => (
              <li key={i} className="member-item member-item--skeleton">
                <div className="member-item__avatar-skeleton" />
                <div className="member-item__details-skeleton">
                  <div className="member-item__address-skeleton" />
                  <div className="member-item__slot-skeleton" />
                </div>
              </li>
            ))}
          </ul>
        </div>
      );
    }

    if (members.length === 0) {
      return (
        <div
          ref={ref}
          className={clsx('member-list', `member-list--${variant}`, 'member-list--empty', className)}
          {...props}
        >
          <div className="member-list__empty">
            <Users className="member-list__empty-icon" size={24} />
            <p className="member-list__empty-text">{emptyMessage}</p>
          </div>
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'member-list',
          `member-list--${variant}`,
          `member-list--${size}`,
          className
        )}
        {...props}
      >
        <div className="member-list__header">
          <h4 className="member-list__title">
            <Users className="member-list__title-icon" size={16} />
            {title || `Members (${members.length})`}
          </h4>
        </div>

        <ul className="member-list__items">
          {members.map((member) => {
            const isUser = member.address === userAddress;
            const isCurrentTurn = currentRound !== undefined && member.slot === currentRound;
            const isClickable = !!onMemberClick;

            return (
              <li
                key={member.address}
                className={clsx(
                  'member-item',
                  `member-item--${size}`,
                  {
                    'member-item--is-user': isUser,
                    'member-item--is-current-turn': isCurrentTurn,
                    'member-item--clickable': isClickable,
                    'member-item--deposited': member.hasDeposited,
                  }
                )}
                onClick={() => onMemberClick?.(member.address)}
                role={isClickable ? 'button' : undefined}
                tabIndex={isClickable ? 0 : undefined}
                onKeyDown={(e) => {
                  if (isClickable && (e.key === 'Enter' || e.key === ' ')) {
                    e.preventDefault();
                    onMemberClick?.(member.address);
                  }
                }}
              >
                <div className="member-item__info">
                  <Avatar address={member.address} size="sm" />
                  <div className="member-item__details">
                    <span className="member-item__address">
                      {truncateAddress(member.address)}
                      {isUser && <Badge variant="primary" size="sm">You</Badge>}
                    </span>
                    <span className="member-item__slot">
                      Slot #{member.slot}
                      {showDetails && member.reputation !== undefined && (
                        <span className="member-item__reputation">
                          • Rep: {member.reputation}
                        </span>
                      )}
                    </span>
                  </div>
                </div>

                <div className="member-item__status">
                  {member.isCreator && (
                    <Badge variant="warning" size="sm" className="member-item__badge">
                      <Crown size={12} />
                      Creator
                    </Badge>
                  )}
                  {isCurrentTurn && (
                    <Badge variant="success" size="sm" className="member-item__badge">
                      <Coins size={12} />
                      Receiving
                    </Badge>
                  )}
                  {member.hasDeposited && (
                    <span className="member-item__deposited" title="Deposited this round">
                      <Check size={16} />
                    </span>
                  )}
                  {isClickable && (
                    <ChevronRight className="member-item__chevron" size={16} />
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      </div>
    );
  }
);

MemberList.displayName = 'MemberList';

// ============================================================================
// MemberListCompact Component
// ============================================================================

export const MemberListCompact = memo(
  forwardRef<HTMLDivElement, MemberListCompactProps>(
    ({ members, maxDisplay = 5, showCount = false, size = 'sm', className, ...props }, ref) => {
      const displayMembers = members.slice(0, maxDisplay);
      const remaining = members.length - maxDisplay;

      return (
        <div
          ref={ref}
          className={clsx('member-list-compact', `member-list-compact--${size}`, className)}
          {...props}
        >
          <div className="member-list-compact__avatars">
            {displayMembers.map((member, index) => (
              <Avatar
                key={member.address}
                address={member.address}
                size={size}
                className="member-list-compact__avatar"
                style={{
                  marginLeft: index > 0 ? '-8px' : 0,
                  zIndex: displayMembers.length - index,
                }}
              />
            ))}
            {remaining > 0 && (
              <div className="member-list-compact__badge">
                +{remaining}
              </div>
            )}
          </div>
          {showCount && (
            <span className="member-list-compact__count">
              {members.length} member{members.length !== 1 ? 's' : ''}
            </span>
          )}
        </div>
      );
    }
  )
);

MemberListCompact.displayName = 'MemberListCompact';

// ============================================================================
// Exports
// ============================================================================

export default MemberList;
