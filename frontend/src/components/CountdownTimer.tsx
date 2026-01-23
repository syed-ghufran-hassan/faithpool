// CountdownTimer component - Display countdown to target date

import {
  forwardRef,
  memo,
  useState,
  useEffect,
  type HTMLAttributes,
} from 'react';
import { Clock, Timer, CheckCircle2, AlertTriangle } from 'lucide-react';
import clsx from 'clsx';
import { Badge } from './Badge';
import './CountdownTimer.css';

// ============================================================================
// Types
// ============================================================================

export interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  total: number;
}

export interface CountdownTimerProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** Target date to count down to */
  targetDate: Date;
  /** Callback when countdown completes */
  onComplete?: () => void;
  /** Show days unit */
  showDays?: boolean;
  /** Show text labels under numbers */
  showLabels?: boolean;
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Visual variant */
  variant?: 'default' | 'compact' | 'minimal' | 'card';
  /** Show icon */
  showIcon?: boolean;
  /** Custom title above countdown */
  title?: string;
  /** Auto-hide when complete */
  autoHide?: boolean;
  /** Warning threshold in minutes */
  warningThreshold?: number;
  /** Urgent threshold in minutes */
  urgentThreshold?: number;
}

// ============================================================================
// Constants
// ============================================================================

const DEFAULT_WARNING_THRESHOLD = 360; // 6 hours in minutes
const DEFAULT_URGENT_THRESHOLD = 60; // 1 hour in minutes

// ============================================================================
// Utility Functions
// ============================================================================

const calculateTimeRemaining = (targetDate: Date): TimeRemaining => {
  const now = new Date().getTime();
  const target = targetDate.getTime();
  const total = target - now;

  if (total <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, total: 0 };
  }

  const days = Math.floor(total / (1000 * 60 * 60 * 24));
  const hours = Math.floor((total % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((total % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((total % (1000 * 60)) / 1000);

  return { days, hours, minutes, seconds, total };
};

const padNumber = (num: number): string => num.toString().padStart(2, '0');

const getUrgencyLevel = (
  timeRemaining: TimeRemaining,
  warningThreshold: number,
  urgentThreshold: number
): 'normal' | 'warning' | 'urgent' => {
  const totalMinutes = Math.floor(timeRemaining.total / (1000 * 60));
  if (totalMinutes < urgentThreshold) return 'urgent';
  if (totalMinutes < warningThreshold) return 'warning';
  return 'normal';
};

// ============================================================================
// Component
// ============================================================================

export const CountdownTimer = memo(
  forwardRef<HTMLDivElement, CountdownTimerProps>(
    (
      {
        targetDate,
        onComplete,
        showDays = true,
        showLabels = true,
        size = 'md',
        variant = 'default',
        showIcon = false,
        title,
        autoHide = false,
        warningThreshold = DEFAULT_WARNING_THRESHOLD,
        urgentThreshold = DEFAULT_URGENT_THRESHOLD,
        className,
        ...props
      },
      ref
    ) => {
      const [timeRemaining, setTimeRemaining] = useState<TimeRemaining>(() =>
        calculateTimeRemaining(targetDate)
      );
      const [isComplete, setIsComplete] = useState(false);

      useEffect(() => {
        const updateTimer = () => {
          const remaining = calculateTimeRemaining(targetDate);
          setTimeRemaining(remaining);

          if (remaining.total <= 0 && !isComplete) {
            setIsComplete(true);
            onComplete?.();
          }
        };

        updateTimer();
        const interval = setInterval(updateTimer, 1000);

        return () => clearInterval(interval);
      }, [targetDate, isComplete, onComplete]);

      const urgencyLevel = getUrgencyLevel(timeRemaining, warningThreshold, urgentThreshold);

      // Auto-hide when complete
      if (isComplete && autoHide) {
        return null;
      }

      // Complete state
      if (isComplete) {
        return (
          <div
            ref={ref}
            className={clsx(
              'countdown-timer',
              'countdown-timer--complete',
              `countdown-timer--${size}`,
              className
            )}
            {...props}
          >
            <CheckCircle2 className="countdown-timer__complete-icon" size={20} />
            <Badge variant="success">Complete!</Badge>
          </div>
        );
      }

      const baseClasses = clsx(
        'countdown-timer',
        `countdown-timer--${variant}`,
        `countdown-timer--${size}`,
        `countdown-timer--${urgencyLevel}`,
        className
      );

      // Minimal variant
      if (variant === 'minimal') {
        return (
          <div ref={ref} className={baseClasses} {...props}>
            {showIcon && <Timer className="countdown-timer__icon" size={14} />}
            {showDays && timeRemaining.days > 0 && <span>{timeRemaining.days}d </span>}
            <span className="countdown-timer__time">
              {padNumber(timeRemaining.hours)}:{padNumber(timeRemaining.minutes)}:
              {padNumber(timeRemaining.seconds)}
            </span>
            {urgencyLevel === 'urgent' && (
              <AlertTriangle className="countdown-timer__warning-icon" size={14} />
            )}
          </div>
        );
      }

      // Compact variant
      if (variant === 'compact') {
        return (
          <div ref={ref} className={baseClasses} {...props}>
            {showIcon && <Clock className="countdown-timer__icon" size={16} />}
            {showDays && (
              <div className="countdown-timer__unit">
                <span className="countdown-timer__value">{timeRemaining.days}</span>
                {showLabels && <span className="countdown-timer__label">d</span>}
              </div>
            )}
            <span className="countdown-timer__separator">:</span>
            <div className="countdown-timer__unit">
              <span className="countdown-timer__value">{padNumber(timeRemaining.hours)}</span>
              {showLabels && <span className="countdown-timer__label">h</span>}
            </div>
            <span className="countdown-timer__separator">:</span>
            <div className="countdown-timer__unit">
              <span className="countdown-timer__value">{padNumber(timeRemaining.minutes)}</span>
              {showLabels && <span className="countdown-timer__label">m</span>}
            </div>
            <span className="countdown-timer__separator">:</span>
            <div className="countdown-timer__unit">
              <span className="countdown-timer__value">{padNumber(timeRemaining.seconds)}</span>
              {showLabels && <span className="countdown-timer__label">s</span>}
            </div>
          </div>
        );
      }

      // Card variant (new)
      if (variant === 'card') {
        return (
          <div ref={ref} className={baseClasses} {...props}>
            {title && (
              <div className="countdown-timer__header">
                <Clock className="countdown-timer__header-icon" size={16} />
                <span className="countdown-timer__title">{title}</span>
              </div>
            )}
            <div className="countdown-timer__blocks">
              {showDays && (
                <div className="countdown-timer__block">
                  <div className="countdown-timer__number">{padNumber(timeRemaining.days)}</div>
                  {showLabels && <div className="countdown-timer__text">Days</div>}
                </div>
              )}
              <div className="countdown-timer__block">
                <div className="countdown-timer__number">{padNumber(timeRemaining.hours)}</div>
                {showLabels && <div className="countdown-timer__text">Hours</div>}
              </div>
              <div className="countdown-timer__block">
                <div className="countdown-timer__number">{padNumber(timeRemaining.minutes)}</div>
                {showLabels && <div className="countdown-timer__text">Min</div>}
              </div>
              <div className="countdown-timer__block">
                <div className="countdown-timer__number">{padNumber(timeRemaining.seconds)}</div>
                {showLabels && <div className="countdown-timer__text">Sec</div>}
              </div>
            </div>
            {urgencyLevel !== 'normal' && (
              <div className={clsx('countdown-timer__status', `countdown-timer__status--${urgencyLevel}`)}>
                <AlertTriangle size={12} />
                <span>{urgencyLevel === 'urgent' ? 'Time is running out!' : 'Ending soon'}</span>
              </div>
            )}
          </div>
        );
      }

      // Default variant
      return (
        <div ref={ref} className={baseClasses} {...props}>
          {showDays && (
            <div className="countdown-timer__block">
              <div className="countdown-timer__number">{padNumber(timeRemaining.days)}</div>
              {showLabels && <div className="countdown-timer__text">Days</div>}
            </div>
          )}
          <div className="countdown-timer__block">
            <div className="countdown-timer__number">{padNumber(timeRemaining.hours)}</div>
            {showLabels && <div className="countdown-timer__text">Hours</div>}
          </div>
          <div className="countdown-timer__block">
            <div className="countdown-timer__number">{padNumber(timeRemaining.minutes)}</div>
            {showLabels && <div className="countdown-timer__text">Minutes</div>}
          </div>
          <div className="countdown-timer__block">
            <div className="countdown-timer__number">{padNumber(timeRemaining.seconds)}</div>
            {showLabels && <div className="countdown-timer__text">Seconds</div>}
          </div>
        </div>
      );
    }
  )
);

CountdownTimer.displayName = 'CountdownTimer';

// ============================================================================
// Exports
// ============================================================================

export { CountdownTimer as default };
