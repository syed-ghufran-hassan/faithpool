import './Tooltip.css';
import type { ReactNode } from 'react';

interface TooltipProps {
  content: string;
  position?: 'top' | 'bottom' | 'left' | 'right';
  children: ReactNode;
  className?: string;
}

function Tooltip({ content, position = 'top', children, className = '' }: TooltipProps) {
  return (
    <div className={`tooltip-wrapper ${className}`}>
      {children}
      <div className={`tooltip tooltip-${position}`}>
        {content}
        <span className="tooltip-arrow" />
      </div>
    </div>
  );
}

export default Tooltip;
