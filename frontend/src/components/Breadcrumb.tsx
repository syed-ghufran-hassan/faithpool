/**
 * Breadcrumb Navigation Component
 * 
 * Provides hierarchical navigation with customizable separators
 * and support for dynamic routes in the StackSUSU application.
 * 
 * @module components/Breadcrumb
 */

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ChevronRight, Home } from 'lucide-react';
import './Breadcrumb.css';

export interface BreadcrumbItem {
  /** Display label for the breadcrumb */
  label: string;
  /** Navigation path (optional for current page) */
  path?: string;
  /** Custom icon to display (optional) */
  icon?: React.ReactNode;
}

export interface BreadcrumbProps {
  /** Array of breadcrumb items to display */
  items?: BreadcrumbItem[];
  /** Show home icon as first item */
  showHome?: boolean;
  /** Custom separator between items */
  separator?: React.ReactNode;
  /** Additional CSS class names */
  className?: string;
  /** Maximum items to show before collapsing */
  maxItems?: number;
  /** Auto-generate breadcrumbs from URL */
  autoGenerate?: boolean;
}

/** Route label mappings for auto-generation */
const routeLabels: Record<string, string> = {
  '': 'Home',
  'circles': 'Savings Circles',
  'circle': 'Circle Details',
  'create': 'Create Circle',
  'dashboard': 'Dashboard',
  'profile': 'Profile',
  'settings': 'Settings',
  'about': 'About',
  'faq': 'FAQ',
  'leaderboard': 'Leaderboard',
  'analytics': 'Analytics',
  'notifications': 'Notifications',
  'help': 'Help Center',
};

/**
 * Generates breadcrumb items from current URL path
 */
function generateBreadcrumbsFromPath(pathname: string): BreadcrumbItem[] {
  const segments = pathname.split('/').filter(Boolean);
  const items: BreadcrumbItem[] = [];

  let currentPath = '';
  for (const segment of segments) {
    currentPath += `/${segment}`;
    const label = routeLabels[segment] || segment.charAt(0).toUpperCase() + segment.slice(1);
    items.push({
      label,
      path: currentPath,
    });
  }

  return items;
}

/**
 * Breadcrumb Navigation Component
 * 
 * @example
 * ```tsx
 * // Manual breadcrumbs
 * <Breadcrumb 
 *   items={[
 *     { label: 'Circles', path: '/circles' },
 *     { label: 'Community Savings' }
 *   ]}
 *   showHome
 * />
 * 
 * // Auto-generated from URL
 * <Breadcrumb autoGenerate showHome />
 * ```
 */
export function Breadcrumb({
  items,
  showHome = true,
  separator,
  className = '',
  maxItems = 4,
  autoGenerate = false,
}: BreadcrumbProps) {
  const location = useLocation();
  
  // Generate items from URL if autoGenerate is enabled
  const breadcrumbItems = autoGenerate 
    ? generateBreadcrumbsFromPath(location.pathname)
    : (items || []);

  // Handle collapsed breadcrumbs for long paths
  const shouldCollapse = breadcrumbItems.length > maxItems;
  const displayItems = shouldCollapse
    ? [
        breadcrumbItems[0],
        { label: '...', path: undefined },
        ...breadcrumbItems.slice(-2),
      ]
    : breadcrumbItems;

  const separatorElement = separator || (
    <ChevronRight className="breadcrumb__separator-icon" size={16} />
  );

  if (breadcrumbItems.length === 0 && !showHome) {
    return null;
  }

  return (
    <nav className={`breadcrumb ${className}`} aria-label="Breadcrumb navigation">
      <ol className="breadcrumb__list">
        {showHome && (
          <li className="breadcrumb__item">
            <Link to="/" className="breadcrumb__link breadcrumb__link--home">
              <Home size={16} />
              <span className="breadcrumb__sr-only">Home</span>
            </Link>
            {(displayItems.length > 0) && (
              <span className="breadcrumb__separator" aria-hidden="true">
                {separatorElement}
              </span>
            )}
          </li>
        )}
        
        {displayItems.map((item, index) => {
          const isLast = index === displayItems.length - 1;
          const isCollapsed = item.label === '...';

          return (
            <li 
              key={`${item.path || item.label}-${index}`} 
              className={`breadcrumb__item ${isLast ? 'breadcrumb__item--current' : ''}`}
            >
              {isCollapsed ? (
                <span className="breadcrumb__ellipsis" title="Path collapsed">
                  {item.label}
                </span>
              ) : isLast || !item.path ? (
                <span className="breadcrumb__current" aria-current="page">
                  {item.icon && <span className="breadcrumb__icon">{item.icon}</span>}
                  {item.label}
                </span>
              ) : (
                <Link to={item.path} className="breadcrumb__link">
                  {item.icon && <span className="breadcrumb__icon">{item.icon}</span>}
                  {item.label}
                </Link>
              )}
              
              {!isLast && (
                <span className="breadcrumb__separator" aria-hidden="true">
                  {separatorElement}
                </span>
              )}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}

export default Breadcrumb;
