import { forwardRef } from 'react';
import clsx from 'clsx';
import './ProgressBar.css';

export type ProgressBarSize = 'xs' | 'sm' | 'md' | 'lg';
export type ProgressBarVariant = 'default' | 'success' | 'warning' | 'error' | 'info';

export interface ProgressBarProps {
  /** Current value */
  value: number;
  /** Maximum value */
  max?: number;
  /** Size of the progress bar */
  size?: ProgressBarSize;
  /** Show label with values */
  showLabel?: boolean;
  /** Show percentage inline */
  showPercentage?: boolean;
  /** Color variant */
  variant?: ProgressBarVariant;
  /** Animated striped pattern */
  striped?: boolean;
  /** Animate the stripes */
  animated?: boolean;
  /** Indeterminate loading state */
  indeterminate?: boolean;
  /** Custom label format function */
  formatLabel?: (value: number, max: number, percentage: number) => string;
  /** Custom color override */
  color?: string;
  /** Additional className */
  className?: string;
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  function ProgressBar(
    {
      value,
      max = 100,
      size = 'md',
      showLabel = false,
      showPercentage = false,
      variant = 'default',
      striped = false,
      animated = false,
      indeterminate = false,
      formatLabel,
      color,
      className,
    },
    ref
  ) {
    const clampedValue = Math.max(0, Math.min(value, max));
    const percentage = Math.round((clampedValue / max) * 100);

    const containerClasses = clsx(
      'progress',
      `progress--${size}`,
      {
        'progress--striped': striped,
        'progress--animated': animated,
        'progress--indeterminate': indeterminate,
      },
      className
    );

    const fillClasses = clsx(
      'progress__fill',
      `progress__fill--${variant}`
    );

    const label = formatLabel
      ? formatLabel(clampedValue, max, percentage)
      : `${clampedValue} / ${max}`;

    return (
      <div ref={ref} className={containerClasses}>
        {showLabel && (
          <div className="progress__label">
            <span className="progress__label-text">{label}</span>
            <span className="progress__label-percentage">{percentage}%</span>
          </div>
        )}
        <div className="progress__track">
          <div
            className={fillClasses}
            style={{
              width: indeterminate ? undefined : `${percentage}%`,
              backgroundColor: color,
            }}
            role="progressbar"
            aria-valuenow={indeterminate ? undefined : clampedValue}
            aria-valuemin={0}
            aria-valuemax={max}
            aria-label={`${percentage}% complete`}
          >
            {showPercentage && size !== 'xs' && size !== 'sm' && !indeterminate && (
              <span className="progress__percentage">{percentage}%</span>
            )}
          </div>
        </div>
      </div>
    );
  }
);

export default ProgressBar;
