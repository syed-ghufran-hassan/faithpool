import { forwardRef, useState, useRef, useEffect, useCallback } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import clsx from 'clsx';
import './Tooltip.css';

export type TooltipPosition = 'top' | 'bottom' | 'left' | 'right';
export type TooltipTrigger = 'hover' | 'click' | 'focus';

interface TooltipProps extends HTMLAttributes<HTMLDivElement> {
  content: ReactNode;
  position?: TooltipPosition;
  trigger?: TooltipTrigger;
  delay?: number;
  disabled?: boolean;
  arrow?: boolean;
  maxWidth?: number;
  children: ReactNode;
}

const Tooltip = forwardRef<HTMLDivElement, TooltipProps>(
  (
    {
      content,
      position = 'top',
      trigger = 'hover',
      delay = 200,
      disabled = false,
      arrow = true,
      maxWidth = 250,
      children,
      className,
      ...props
    },
    ref
  ) => {
    const [isVisible, setIsVisible] = useState(false);
    const [actualPosition, setActualPosition] = useState(position);
    const timeoutRef = useRef<NodeJS.Timeout | null>(null);
    const tooltipRef = useRef<HTMLDivElement>(null);
    const wrapperRef = useRef<HTMLDivElement>(null);

    const showTooltip = useCallback(() => {
      if (disabled) return;
      timeoutRef.current = setTimeout(() => {
        setIsVisible(true);
      }, delay);
    }, [delay, disabled]);

    const hideTooltip = useCallback(() => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
      setIsVisible(false);
    }, []);

    const toggleTooltip = useCallback(() => {
      if (disabled) return;
      setIsVisible((prev) => !prev);
    }, [disabled]);

    // Adjust position if tooltip would overflow viewport
    useEffect(() => {
      if (!isVisible || !tooltipRef.current || !wrapperRef.current) return;

      const tooltip = tooltipRef.current;
      const wrapper = wrapperRef.current;
      const tooltipRect = tooltip.getBoundingClientRect();
      const wrapperRect = wrapper.getBoundingClientRect();

      let newPosition = position;

      // Check if tooltip overflows viewport and adjust
      if (position === 'top' && tooltipRect.top < 0) {
        newPosition = 'bottom';
      } else if (position === 'bottom' && tooltipRect.bottom > window.innerHeight) {
        newPosition = 'top';
      } else if (position === 'left' && tooltipRect.left < 0) {
        newPosition = 'right';
      } else if (position === 'right' && tooltipRect.right > window.innerWidth) {
        newPosition = 'left';
      }

      if (newPosition !== actualPosition) {
        setActualPosition(newPosition);
      }
    }, [isVisible, position, actualPosition]);

    // Cleanup timeout on unmount
    useEffect(() => {
      return () => {
        if (timeoutRef.current) {
          clearTimeout(timeoutRef.current);
        }
      };
    }, []);

    const triggerProps = {
      ...(trigger === 'hover' && {
        onMouseEnter: showTooltip,
        onMouseLeave: hideTooltip,
      }),
      ...(trigger === 'click' && {
        onClick: toggleTooltip,
      }),
      ...(trigger === 'focus' && {
        onFocus: showTooltip,
        onBlur: hideTooltip,
      }),
    };

    return (
      <div
        ref={wrapperRef}
        className={clsx('tooltip-wrapper', className)}
        {...triggerProps}
        {...props}
      >
        {children}
        {isVisible && !disabled && (
          <div
            ref={tooltipRef}
            role="tooltip"
            className={clsx('tooltip', `tooltip--${actualPosition}`)}
            style={{ maxWidth }}
          >
            {content}
            {arrow && <span className="tooltip__arrow" />}
          </div>
        )}
      </div>
    );
  }
);

Tooltip.displayName = 'Tooltip';

export { Tooltip };
export type { TooltipProps };
export default Tooltip;
