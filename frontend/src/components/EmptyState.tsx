import { forwardRef, type ReactNode } from 'react';
import clsx from 'clsx';
import { Inbox, Search, FileX, AlertCircle, type LucideIcon } from 'lucide-react';
import './EmptyState.css';

export type EmptyStateSize = 'sm' | 'md' | 'lg';
export type EmptyStateVariant = 'default' | 'subtle' | 'bordered' | 'card';
export type EmptyStatePreset = 'no-data' | 'no-results' | 'no-items' | 'error';

const presetConfig: Record<EmptyStatePreset, { icon: LucideIcon; title: string; description: string }> = {
  'no-data': {
    icon: Inbox,
    title: 'No data yet',
    description: 'Get started by adding your first item.',
  },
  'no-results': {
    icon: Search,
    title: 'No results found',
    description: 'Try adjusting your search or filters.',
  },
  'no-items': {
    icon: FileX,
    title: 'No items',
    description: 'There are no items to display.',
  },
  'error': {
    icon: AlertCircle,
    title: 'Something went wrong',
    description: 'An error occurred. Please try again.',
  },
};

export interface EmptyStateProps {
  /** Preset configuration */
  preset?: EmptyStatePreset;
  /** Custom icon element or Lucide icon component */
  icon?: ReactNode | LucideIcon;
  /** Title text */
  title?: string;
  /** Description text */
  description?: string;
  /** Action buttons or links */
  action?: ReactNode;
  /** Secondary action */
  secondaryAction?: ReactNode;
  /** Size variant */
  size?: EmptyStateSize;
  /** Visual variant */
  variant?: EmptyStateVariant;
  /** Custom illustration image URL */
  illustration?: string;
  /** Additional className */
  className?: string;
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  function EmptyState(
    {
      preset,
      icon,
      title,
      description,
      action,
      secondaryAction,
      size = 'md',
      variant = 'default',
      illustration,
      className,
    },
    ref
  ) {
    // Use preset config if preset is provided
    const config = preset ? presetConfig[preset] : null;
    const displayTitle = title ?? config?.title ?? 'Nothing here';
    const displayDescription = description ?? config?.description;
    
    // Determine icon to render
    const renderIcon = () => {
      if (illustration) {
        return (
          <img 
            src={illustration} 
            alt="" 
            className="empty-state__illustration"
            aria-hidden="true"
          />
        );
      }
      
      if (icon) {
        // Check if icon is a Lucide component
        if (typeof icon === 'function') {
          const IconComponent = icon as LucideIcon;
          return <IconComponent className="empty-state__icon-svg" />;
        }
        return icon;
      }
      
      if (config?.icon) {
        const PresetIcon = config.icon;
        return <PresetIcon className="empty-state__icon-svg" />;
      }
      
      return null;
    };

    const containerClasses = clsx(
      'empty-state',
      `empty-state--${size}`,
      `empty-state--${variant}`,
      className
    );

    return (
      <div ref={ref} className={containerClasses}>
        {(icon || illustration || config?.icon) && (
          <div className="empty-state__icon">{renderIcon()}</div>
        )}
        <h3 className="empty-state__title">{displayTitle}</h3>
        {displayDescription && (
          <p className="empty-state__description">{displayDescription}</p>
        )}
        {(action || secondaryAction) && (
          <div className="empty-state__actions">
            {action && <div className="empty-state__action-primary">{action}</div>}
            {secondaryAction && <div className="empty-state__action-secondary">{secondaryAction}</div>}
          </div>
        )}
      </div>
    );
  }
);

export default EmptyState;
