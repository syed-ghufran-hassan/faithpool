import { forwardRef } from 'react';
import type { HTMLAttributes } from 'react';
import clsx from 'clsx';
import './Spinner.css';

export type SpinnerSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl';
export type SpinnerVariant = 'default' | 'dots' | 'pulse' | 'bars';

interface SpinnerProps extends HTMLAttributes<HTMLDivElement> {
  size?: SpinnerSize;
  variant?: SpinnerVariant;
  color?: 'primary' | 'secondary' | 'white' | 'current';
  label?: string;
}

const Spinner = forwardRef<HTMLDivElement, SpinnerProps>(
  (
    {
      size = 'md',
      variant = 'default',
      color = 'primary',
      label = 'Loading',
      className,
      ...props
    },
    ref
  ) => {
    return (
      <div
        ref={ref}
        role="status"
        aria-label={label}
        className={clsx(
          'spinner',
          `spinner--${size}`,
          `spinner--${variant}`,
          `spinner--${color}`,
          className
        )}
        {...props}
      >
        {variant === 'default' && (
          <svg className="spinner__circle" viewBox="0 0 50 50">
            <circle
              className="spinner__track"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
            />
            <circle
              className="spinner__head"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="4"
              strokeLinecap="round"
            />
          </svg>
        )}
        
        {variant === 'dots' && (
          <div className="spinner__dots">
            <span className="spinner__dot" />
            <span className="spinner__dot" />
            <span className="spinner__dot" />
          </div>
        )}
        
        {variant === 'pulse' && (
          <div className="spinner__pulse" />
        )}
        
        {variant === 'bars' && (
          <div className="spinner__bars">
            <span className="spinner__bar" />
            <span className="spinner__bar" />
            <span className="spinner__bar" />
            <span className="spinner__bar" />
          </div>
        )}
        
        <span className="sr-only">{label}</span>
      </div>
    );
  }
);

Spinner.displayName = 'Spinner';

export { Spinner };
export type { SpinnerProps };
export default Spinner;
