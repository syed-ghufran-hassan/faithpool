import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import './Badge.css';

export type BadgeVariant = 
  | 'default' 
  | 'primary' 
  | 'secondary' 
  | 'success' 
  | 'warning' 
  | 'error' 
  | 'info';

export type BadgeSize = 'xs' | 'sm' | 'md' | 'lg';

interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  children: ReactNode;
  variant?: BadgeVariant;
  size?: BadgeSize;
  dot?: boolean;
  outline?: boolean;
  rounded?: boolean;
  icon?: ReactNode;
  removable?: boolean;
  onRemove?: () => void;
}

const Badge = forwardRef<HTMLSpanElement, BadgeProps>(
  (
    {
      children,
      variant = 'default',
      size = 'sm',
      dot = false,
      outline = false,
      rounded = false,
      icon,
      removable = false,
      onRemove,
      className,
      ...props
    },
    ref
  ) => {
    return (
      <span
        ref={ref}
        className={clsx(
          'badge',
          `badge--${variant}`,
          `badge--${size}`,
          {
            'badge--dot': dot,
            'badge--outline': outline,
            'badge--rounded': rounded,
          },
          className
        )}
        {...props}
      >
        {dot && <span className="badge__dot" />}
        {icon && <span className="badge__icon">{icon}</span>}
        <span className="badge__content">{children}</span>
        {removable && (
          <button 
            type="button"
            className="badge__remove"
            onClick={(e) => {
              e.stopPropagation();
              onRemove?.();
            }}
            aria-label="Remove"
          >
            ×
          </button>
        )}
      </span>
    );
  }
);

Badge.displayName = 'Badge';

export { Badge };
export type { BadgeProps };
export default Badge;
