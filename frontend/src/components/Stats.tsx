import { memo, forwardRef, type ReactNode } from 'react';
import { TrendingUp, TrendingDown, type LucideIcon } from 'lucide-react';
import clsx from 'clsx';
import './Stats.css';

export interface StatItem {
  label: string;
  value: string | number;
  change?: {
    value: number;
    type: 'increase' | 'decrease';
  };
  icon?: ReactNode | LucideIcon;
}

export interface StatsProps {
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  variant?: 'default' | 'compact' | 'outlined';
  className?: string;
}

function renderIcon(icon: StatItem['icon']): ReactNode {
  if (!icon) return null;
  
  // Check if it's a Lucide icon component
  if (typeof icon === 'function') {
    const IconComponent = icon as LucideIcon;
    return <IconComponent size={24} />;
  }
  
  // Otherwise render as-is (ReactNode)
  return icon;
}

export const Stats = memo(forwardRef<HTMLDivElement, StatsProps>(
  function Stats({ stats, columns = 4, variant = 'default', className }, ref) {
    return (
      <div
        ref={ref}
        className={clsx(
          'stats',
          `stats--cols-${columns}`,
          variant !== 'default' && `stats--${variant}`,
          className
        )}
      >
        {stats.map((stat, index) => (
          <div key={index} className="stats__card">
            {stat.icon && (
              <span className="stats__icon">{renderIcon(stat.icon)}</span>
            )}
            <div className="stats__content">
              <span className="stats__value">{stat.value}</span>
              <span className="stats__label">{stat.label}</span>
              {stat.change && (
                <span
                  className={clsx(
                    'stats__change',
                    `stats__change--${stat.change.type}`
                  )}
                >
                  {stat.change.type === 'increase' ? (
                    <TrendingUp size={12} />
                  ) : (
                    <TrendingDown size={12} />
                  )}
                  {Math.abs(stat.change.value)}%
                </span>
              )}
            </div>
          </div>
        ))}
      </div>
    );
  }
));

export default Stats;
