import { forwardRef, useState, useEffect, useRef, useCallback, memo } from 'react';
import { 
  Bell, 
  CheckCircle, 
  AlertTriangle, 
  XCircle, 
  DollarSign, 
  Clock, 
  Image, 
  Info,
  Check,
  Trash2,
  BellOff
} from 'lucide-react';
import clsx from 'clsx';
import { Badge } from './Badge';
import { Button } from './Button';
import { EmptyState } from './EmptyState';
import './NotificationCenter.css';

export type NotificationType = 'info' | 'success' | 'warning' | 'error' | 'payout' | 'circle' | 'nft';

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: Date;
  isRead: boolean;
  actionUrl?: string;
  actionLabel?: string;
  metadata?: Record<string, unknown>;
}

export interface NotificationCenterProps {
  /** Notifications array */
  notifications: Notification[];
  /** Unread count */
  unreadCount?: number;
  /** Loading state */
  isLoading?: boolean;
  /** Mark as read handler */
  onMarkAsRead?: (id: string) => void;
  /** Mark all as read handler */
  onMarkAllAsRead?: () => void;
  /** Clear all handler */
  onClearAll?: () => void;
  /** Notification click handler */
  onNotificationClick?: (notification: Notification) => void;
  /** Optional class name */
  className?: string;
  /** Position of dropdown */
  position?: 'left' | 'right';
  /** Max visible notifications */
  maxVisible?: number;
}

const formatTimestamp = (date: Date): string => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();
  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return 'Just now';
  if (minutes < 60) return `${minutes}m ago`;
  if (hours < 24) return `${hours}h ago`;
  if (days < 7) return `${days}d ago`;
  return date.toLocaleDateString();
};

const NotificationIcon = memo(function NotificationIcon({ type }: { type: NotificationType }) {
  const iconProps = { size: 18 };
  
  switch (type) {
    case 'success':
      return <CheckCircle {...iconProps} />;
    case 'warning':
      return <AlertTriangle {...iconProps} />;
    case 'error':
      return <XCircle {...iconProps} />;
    case 'payout':
      return <DollarSign {...iconProps} />;
    case 'circle':
      return <Clock {...iconProps} />;
    case 'nft':
      return <Image {...iconProps} />;
    default:
      return <Info {...iconProps} />;
  }
});

export const NotificationCenter = memo(forwardRef<HTMLDivElement, NotificationCenterProps>(
  function NotificationCenter(
    {
      notifications,
      unreadCount = 0,
      isLoading = false,
      onMarkAsRead,
      onMarkAllAsRead,
      onClearAll,
      onNotificationClick,
      className,
      position = 'right',
      maxVisible = 50,
    },
    ref
  ) {
    const [isOpen, setIsOpen] = useState(false);
    const [filter, setFilter] = useState<'all' | 'unread'>('all');
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen]);

    const filteredNotifications = filter === 'unread'
      ? notifications.filter(n => !n.isRead).slice(0, maxVisible)
      : notifications.slice(0, maxVisible);

    const handleNotificationClick = useCallback((notification: Notification) => {
      if (!notification.isRead) {
        onMarkAsRead?.(notification.id);
      }
      onNotificationClick?.(notification);
    }, [onMarkAsRead, onNotificationClick]);

    const handleToggle = useCallback(() => {
      setIsOpen(prev => !prev);
    }, []);

    return (
      <div 
        ref={ref}
        className={clsx(
          'notification-center',
          `notification-center--${position}`,
          className
        )} 
      >
        <div ref={containerRef}>
          <button
            className="notification-center__trigger"
            onClick={handleToggle}
            aria-label={`Notifications ${unreadCount > 0 ? `(${unreadCount} unread)` : ''}`}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Bell size={22} />
            {unreadCount > 0 && (
              <span className="notification-center__badge">
                {unreadCount > 99 ? '99+' : unreadCount}
              </span>
            )}
          </button>

          {isOpen && (
            <div className="notification-center__dropdown" role="menu">
              <div className="notification-center__header">
                <h3>Notifications</h3>
                <div className="notification-center__filter">
                  <button
                    className={clsx(filter === 'all' && 'active')}
                    onClick={() => setFilter('all')}
                    type="button"
                  >
                    All
                  </button>
                  <button
                    className={clsx(filter === 'unread' && 'active')}
                    onClick={() => setFilter('unread')}
                    type="button"
                  >
                    Unread ({unreadCount})
                  </button>
                </div>
              </div>

              <div className="notification-center__content">
                {isLoading ? (
                  <div className="notification-center__loading">
                    <div className="notification-center__loading-spinner" />
                    <span>Loading notifications...</span>
                  </div>
                ) : filteredNotifications.length === 0 ? (
                  <EmptyState
                    title={filter === 'unread' ? 'All caught up!' : 'No notifications'}
                    description={
                      filter === 'unread'
                        ? 'You have no unread notifications'
                        : 'You have no notifications yet'
                    }
                    icon={<BellOff size={32} />}
                  />
                ) : (
                  <div className="notification-center__list">
                    {filteredNotifications.map((notification) => (
                      <div
                        key={notification.id}
                        className={clsx(
                          'notification-center__item',
                          `notification-center__item--${notification.type}`,
                          !notification.isRead && 'notification-center__item--unread'
                        )}
                        onClick={() => handleNotificationClick(notification)}
                        role="menuitem"
                        tabIndex={0}
                        onKeyDown={(e) => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            handleNotificationClick(notification);
                          }
                        }}
                      >
                        <div className="notification-center__item-icon">
                          <NotificationIcon type={notification.type} />
                        </div>
                        <div className="notification-center__item-content">
                          <div className="notification-center__item-title">
                            {notification.title}
                            {!notification.isRead && (
                              <span className="notification-center__unread-dot" />
                            )}
                          </div>
                          <p className="notification-center__item-message">
                            {notification.message}
                          </p>
                          <span className="notification-center__item-time">
                            {formatTimestamp(notification.timestamp)}
                          </span>
                        </div>
                        {notification.actionLabel && (
                          <Button
                            variant="secondary"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleNotificationClick(notification);
                            }}
                          >
                            {notification.actionLabel}
                          </Button>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {notifications.length > 0 && (
                <div className="notification-center__footer">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onMarkAllAsRead}
                    disabled={unreadCount === 0}
                    leftIcon={<Check size={14} />}
                  >
                    Mark all read
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={onClearAll}
                    leftIcon={<Trash2 size={14} />}
                  >
                    Clear all
                  </Button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    );
  }
));

export { NotificationCenter as default };
