import React from 'react';
import { 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle, 
  Loader2, 
  Pause,
  Play,
  Lock 
} from 'lucide-react';
import './StatusBadge.css';

export type StatusType = 
  | 'pending' 
  | 'active' 
  | 'completed' 
  | 'failed' 
  | 'cancelled'
  | 'processing'
  | 'paused'
  | 'locked'
  | 'warning';

export interface StatusBadgeProps {
  /** Status type */
  status: StatusType;
  /** Custom label (optional, defaults to status name) */
  label?: string;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Whether to show icon */
  showIcon?: boolean;
  /** Whether to animate (for processing status) */
  animate?: boolean;
  /** Additional className */
  className?: string;
}

const statusConfig: Record<StatusType, {
  icon: typeof Clock;
  label: string;
  colorClass: string;
}> = {
  pending: {
    icon: Clock,
    label: 'Pending',
    colorClass: 'status-badge--pending',
  },
  active: {
    icon: Play,
    label: 'Active',
    colorClass: 'status-badge--active',
  },
  completed: {
    icon: CheckCircle,
    label: 'Completed',
    colorClass: 'status-badge--completed',
  },
  failed: {
    icon: XCircle,
    label: 'Failed',
    colorClass: 'status-badge--failed',
  },
  cancelled: {
    icon: XCircle,
    label: 'Cancelled',
    colorClass: 'status-badge--cancelled',
  },
  processing: {
    icon: Loader2,
    label: 'Processing',
    colorClass: 'status-badge--processing',
  },
  paused: {
    icon: Pause,
    label: 'Paused',
    colorClass: 'status-badge--paused',
  },
  locked: {
    icon: Lock,
    label: 'Locked',
    colorClass: 'status-badge--locked',
  },
  warning: {
    icon: AlertCircle,
    label: 'Warning',
    colorClass: 'status-badge--warning',
  },
};

/**
 * Status badge component for displaying status indicators
 * 
 * @example
 * ```tsx
 * <StatusBadge status="active" />
 * <StatusBadge status="processing" animate />
 * <StatusBadge status="completed" label="Done!" />
 * ```
 */
export function StatusBadge({
  status,
  label,
  size = 'md',
  showIcon = true,
  animate = false,
  className = '',
}: StatusBadgeProps) {
  const config = statusConfig[status];
  const Icon = config.icon;
  const displayLabel = label || config.label;

  const shouldAnimate = animate || status === 'processing';

  return (
    <span
      className={`
        status-badge
        status-badge--${size}
        ${config.colorClass}
        ${className}
      `}
      role="status"
      aria-label={displayLabel}
    >
      {showIcon && (
        <Icon
          className={`
            status-badge__icon
            ${shouldAnimate ? 'status-badge__icon--animate' : ''}
          `}
        />
      )}
      <span className="status-badge__label">{displayLabel}</span>
    </span>
  );
}

// Circle-specific status badges

export type CircleStatus = 'forming' | 'active' | 'completed' | 'cancelled' | 'paused';

const circleStatusMap: Record<CircleStatus, StatusType> = {
  forming: 'pending',
  active: 'active',
  completed: 'completed',
  cancelled: 'cancelled',
  paused: 'paused',
};

/**
 * Circle status badge with StackSUSU-specific labels
 */
export function CircleStatusBadge({
  status,
  size = 'sm',
  className = '',
}: {
  status: CircleStatus;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const labels: Record<CircleStatus, string> = {
    forming: 'Forming',
    active: 'Active',
    completed: 'Completed',
    cancelled: 'Cancelled',
    paused: 'Paused',
  };

  return (
    <StatusBadge
      status={circleStatusMap[status]}
      label={labels[status]}
      size={size}
      className={className}
    />
  );
}

export type TransactionStatus = 'pending' | 'confirmed' | 'failed';

const txStatusMap: Record<TransactionStatus, StatusType> = {
  pending: 'processing',
  confirmed: 'completed',
  failed: 'failed',
};

/**
 * Transaction status badge
 */
export function TxStatusBadge({
  status,
  confirmations,
  size = 'sm',
  className = '',
}: {
  status: TransactionStatus;
  confirmations?: number;
  size?: 'sm' | 'md' | 'lg';
  className?: string;
}) {
  const labels: Record<TransactionStatus, string> = {
    pending: 'Pending',
    confirmed: confirmations ? `${confirmations} confirmations` : 'Confirmed',
    failed: 'Failed',
  };

  return (
    <StatusBadge
      status={txStatusMap[status]}
      label={labels[status]}
      size={size}
      animate={status === 'pending'}
      className={className}
    />
  );
}

/**
 * Online/Offline status indicator
 */
export function OnlineStatus({
  online,
  showLabel = true,
  size = 'sm',
}: {
  online: boolean;
  showLabel?: boolean;
  size?: 'sm' | 'md' | 'lg';
}) {
  return (
    <span className={`online-status online-status--${size} ${online ? 'online-status--online' : 'online-status--offline'}`}>
      <span className="online-status__dot" />
      {showLabel && (
        <span className="online-status__label">
          {online ? 'Online' : 'Offline'}
        </span>
      )}
    </span>
  );
}

export default StatusBadge;
