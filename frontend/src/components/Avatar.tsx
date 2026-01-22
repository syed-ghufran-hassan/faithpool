import type { ReactNode } from 'react';
import './Avatar.css';

interface AvatarProps {
  address?: string;
  name?: string;
  src?: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  children?: ReactNode;
}

function Avatar({ address, name, src, size = 'md', className = '', children }: AvatarProps) {
  // Generate color from address or name
  const generateColor = (str: string): string => {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = str.charCodeAt(i) + ((hash << 5) - hash);
    }
    const hue = hash % 360;
    return `hsl(${hue}, 65%, 55%)`;
  };

  // Get initials
  const getInitials = (): string => {
    if (name) {
      return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
    }
    if (address) {
      return address.slice(0, 2).toUpperCase();
    }
    return '?';
  };

  const backgroundColor = address || name ? generateColor(address || name || '') : '#9ca3af';

  return (
    <div 
      className={`avatar avatar-${size} ${className}`}
      style={{ backgroundColor: src ? 'transparent' : backgroundColor }}
    >
      {src ? (
        <img src={src} alt={name || 'Avatar'} className="avatar-image" />
      ) : children ? (
        children
      ) : (
        <span className="avatar-initials">{getInitials()}</span>
      )}
    </div>
  );
}

export default Avatar;
