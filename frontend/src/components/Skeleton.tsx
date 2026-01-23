import { forwardRef } from 'react';
import type { HTMLAttributes, CSSProperties } from 'react';
import clsx from 'clsx';
import './Skeleton.css';

export type SkeletonVariant = 'text' | 'circular' | 'rectangular' | 'rounded';

interface SkeletonProps extends HTMLAttributes<HTMLDivElement> {
  variant?: SkeletonVariant;
  width?: string | number;
  height?: string | number;
  count?: number;
  animation?: 'pulse' | 'wave' | 'none';
}

const Skeleton = forwardRef<HTMLDivElement, SkeletonProps>(
  (
    { 
      variant = 'text', 
      width, 
      height, 
      count = 1,
      animation = 'pulse',
      className,
      style,
      ...props
    },
    ref
  ) => {
    const combinedStyle: CSSProperties = {
      width: typeof width === 'number' ? `${width}px` : width,
      height: typeof height === 'number' ? `${height}px` : height,
      ...style,
    };

    if (count > 1) {
      return (
        <div ref={ref} className="skeleton-group" {...props}>
          {Array.from({ length: count }).map((_, index) => (
            <div
              key={index}
              className={clsx(
                'skeleton',
                `skeleton--${variant}`,
                `skeleton--${animation}`,
                className
              )}
              style={combinedStyle}
            />
          ))}
        </div>
      );
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'skeleton',
          `skeleton--${variant}`,
          `skeleton--${animation}`,
          className
        )}
        style={combinedStyle}
        {...props}
      />
    );
  }
);

Skeleton.displayName = 'Skeleton';

export { Skeleton };
export type { SkeletonProps };
export default Skeleton;
