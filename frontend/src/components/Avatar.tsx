import { forwardRef, useState } from 'react';
import type { HTMLAttributes, ReactNode, ImgHTMLAttributes } from 'react';
import clsx from 'clsx';
import './Avatar.css';

export type AvatarSize = 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
export type AvatarStatus = 'online' | 'offline' | 'away' | 'busy';

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  address?: string;
  name?: string;
  src?: string;
  alt?: string;
  size?: AvatarSize;
  status?: AvatarStatus;
  statusPosition?: 'top-right' | 'bottom-right';
  ring?: boolean;
  ringColor?: string;
  square?: boolean;
  fallback?: ReactNode;
  children?: ReactNode;
  imgProps?: Omit<ImgHTMLAttributes<HTMLImageElement>, 'src' | 'alt'>;
}

// Generate consistent color from string
function generateColor(str: string): string {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  const hue = hash % 360;
  return `hsl(${hue}, 65%, 55%)`;
}

// Get initials from name or address
function getInitials(name?: string, address?: string): string {
  if (name) {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  }
  if (address) {
    return address.slice(0, 2).toUpperCase();
  }
  return '?';
}

const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  (
    {
      address,
      name,
      src,
      alt,
      size = 'md',
      status,
      statusPosition = 'bottom-right',
      ring = false,
      ringColor,
      square = false,
      fallback,
      children,
      className,
      style,
      imgProps,
      ...props
    },
    ref
  ) => {
    const [imageError, setImageError] = useState(false);
    const backgroundColor = address || name ? generateColor(address || name || '') : '#6b7280';
    const showImage = src && !imageError;

    const handleImageError = () => {
      setImageError(true);
    };

    return (
      <div
        ref={ref}
        className={clsx(
          'avatar',
          `avatar--${size}`,
          {
            'avatar--square': square,
            'avatar--ring': ring,
          },
          className
        )}
        style={{
          backgroundColor: showImage ? 'transparent' : backgroundColor,
          '--avatar-ring-color': ringColor || 'var(--color-primary-500)',
          ...style,
        } as React.CSSProperties}
        {...props}
      >
        {showImage ? (
          <img
            src={src}
            alt={alt || name || 'Avatar'}
            className="avatar__image"
            onError={handleImageError}
            loading="lazy"
            {...imgProps}
          />
        ) : children ? (
          <span className="avatar__content">{children}</span>
        ) : fallback ? (
          <span className="avatar__content">{fallback}</span>
        ) : (
          <span className="avatar__initials">{getInitials(name, address)}</span>
        )}

        {status && (
          <span
            className={clsx(
              'avatar__status',
              `avatar__status--${status}`,
              `avatar__status--${statusPosition}`
            )}
          />
        )}
      </div>
    );
  }
);

Avatar.displayName = 'Avatar';

// Avatar Group Component
interface AvatarGroupProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  max?: number;
  size?: AvatarSize;
  spacing?: 'tight' | 'normal' | 'loose';
}

const AvatarGroup = forwardRef<HTMLDivElement, AvatarGroupProps>(
  (
    {
      children,
      max,
      size = 'md',
      spacing = 'normal',
      className,
      ...props
    },
    ref
  ) => {
    const childArray = Array.isArray(children) ? children : [children];
    const visibleAvatars = max ? childArray.slice(0, max) : childArray;
    const remainingCount = max && childArray.length > max ? childArray.length - max : 0;

    return (
      <div
        ref={ref}
        className={clsx(
          'avatar-group',
          `avatar-group--${spacing}`,
          className
        )}
        {...props}
      >
        {visibleAvatars}
        {remainingCount > 0 && (
          <Avatar size={size} className="avatar-group__overflow">
            +{remainingCount}
          </Avatar>
        )}
      </div>
    );
  }
);

AvatarGroup.displayName = 'AvatarGroup';

export { Avatar, AvatarGroup };
export type { AvatarProps, AvatarGroupProps };
export default Avatar;
