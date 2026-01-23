import { forwardRef } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import './Card.css';

export type CardVariant = 'default' | 'elevated' | 'bordered' | 'glass' | 'gradient';
export type CardPadding = 'none' | 'sm' | 'md' | 'lg' | 'xl';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  variant?: CardVariant;
  padding?: CardPadding;
  hoverable?: boolean;
  clickable?: boolean;
  glow?: boolean;
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  (
    {
      children,
      variant = 'default',
      padding = 'md',
      hoverable = false,
      clickable = false,
      glow = false,
      className,
      onClick,
      ...props
    },
    ref
  ) => {
    const isClickable = clickable || !!onClick;

    return (
      <div
        ref={ref}
        className={clsx(
          'card',
          `card--${variant}`,
          `card--padding-${padding}`,
          {
            'card--hoverable': hoverable || isClickable,
            'card--clickable': isClickable,
            'card--glow': glow,
          },
          className
        )}
        onClick={onClick}
        role={isClickable ? 'button' : undefined}
        tabIndex={isClickable ? 0 : undefined}
        {...props}
      >
        {children}
      </div>
    );
  }
);

Card.displayName = 'Card';

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  action?: ReactNode;
}

const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ children, action, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('card__header', className)} {...props}>
        <div className="card__header-content">{children}</div>
        {action && <div className="card__header-action">{action}</div>}
      </div>
    );
  }
);

CardHeader.displayName = 'CardHeader';

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode;
  as?: 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6';
}

const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ children, as: Component = 'h3', className, ...props }, ref) => {
    return (
      <Component ref={ref} className={clsx('card__title', className)} {...props}>
        {children}
      </Component>
    );
  }
);

CardTitle.displayName = 'CardTitle';

interface CardDescriptionProps extends HTMLAttributes<HTMLParagraphElement> {
  children: ReactNode;
}

const CardDescription = forwardRef<HTMLParagraphElement, CardDescriptionProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <p ref={ref} className={clsx('card__description', className)} {...props}>
        {children}
      </p>
    );
  }
);

CardDescription.displayName = 'CardDescription';

interface CardBodyProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
}

const CardBody = forwardRef<HTMLDivElement, CardBodyProps>(
  ({ children, className, ...props }, ref) => {
    return (
      <div ref={ref} className={clsx('card__body', className)} {...props}>
        {children}
      </div>
    );
  }
);

CardBody.displayName = 'CardBody';

interface CardFooterProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  justify?: 'start' | 'center' | 'end' | 'between';
}

const CardFooter = forwardRef<HTMLDivElement, CardFooterProps>(
  ({ children, justify = 'end', className, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('card__footer', `card__footer--${justify}`, className)}
        {...props}
      >
        {children}
      </div>
    );
  }
);

CardFooter.displayName = 'CardFooter';

export { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter };
export default Card;
