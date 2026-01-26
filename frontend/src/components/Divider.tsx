import React from 'react';
import './Divider.css';

export interface DividerProps {
  /** Orientation */
  orientation?: 'horizontal' | 'vertical';
  /** Visual variant */
  variant?: 'solid' | 'dashed' | 'dotted';
  /** Spacing around the divider */
  spacing?: 'none' | 'sm' | 'md' | 'lg';
  /** Optional label in the middle */
  label?: string;
  /** Label position (for horizontal dividers) */
  labelPosition?: 'left' | 'center' | 'right';
  /** Additional className */
  className?: string;
}

/**
 * Divider component for visual separation
 * 
 * @example
 * ```tsx
 * // Simple horizontal divider
 * <Divider />
 * 
 * // With label
 * <Divider label="OR" />
 * 
 * // Vertical in flex container
 * <div className="flex">
 *   <span>Left</span>
 *   <Divider orientation="vertical" />
 *   <span>Right</span>
 * </div>
 * ```
 */
export function Divider({
  orientation = 'horizontal',
  variant = 'solid',
  spacing = 'md',
  label,
  labelPosition = 'center',
  className = '',
}: DividerProps) {
  const baseClass = 'divider';
  const classes = [
    baseClass,
    `${baseClass}--${orientation}`,
    `${baseClass}--${variant}`,
    `${baseClass}--spacing-${spacing}`,
    label ? `${baseClass}--with-label` : '',
    label ? `${baseClass}--label-${labelPosition}` : '',
    className,
  ].filter(Boolean).join(' ');

  if (label && orientation === 'horizontal') {
    return (
      <div className={classes} role="separator" aria-orientation={orientation}>
        <span className="divider__line" />
        <span className="divider__label">{label}</span>
        <span className="divider__line" />
      </div>
    );
  }

  return (
    <div
      className={classes}
      role="separator"
      aria-orientation={orientation}
    />
  );
}

export interface SectionDividerProps {
  /** Section title */
  title: string;
  /** Optional subtitle */
  subtitle?: string;
  /** Action element (button, link) */
  action?: React.ReactNode;
  /** Additional className */
  className?: string;
}

/**
 * Section divider with title, used to separate content sections
 * 
 * @example
 * ```tsx
 * <SectionDivider 
 *   title="Recent Circles"
 *   subtitle="Your active savings circles"
 *   action={<Button size="sm">View All</Button>}
 * />
 * ```
 */
export function SectionDivider({
  title,
  subtitle,
  action,
  className = '',
}: SectionDividerProps) {
  return (
    <div className={`section-divider ${className}`}>
      <div className="section-divider__content">
        <h3 className="section-divider__title">{title}</h3>
        {subtitle && (
          <p className="section-divider__subtitle">{subtitle}</p>
        )}
      </div>
      {action && (
        <div className="section-divider__action">
          {action}
        </div>
      )}
    </div>
  );
}

/**
 * Spacing utility component
 * 
 * @example
 * ```tsx
 * <Spacer size="lg" />
 * ```
 */
export function Spacer({ 
  size = 'md' 
}: { 
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' 
}) {
  const sizeMap = {
    xs: '0.5rem',
    sm: '1rem',
    md: '1.5rem',
    lg: '2rem',
    xl: '3rem',
  };

  return <div style={{ height: sizeMap[size] }} aria-hidden="true" />;
}

export default Divider;
