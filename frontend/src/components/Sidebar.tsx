import { forwardRef, useEffect, useCallback, memo, useMemo } from 'react';
import type { HTMLAttributes, ReactNode } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Search, 
  PlusCircle, 
  User, 
  Settings, 
  BookOpen, 
  HelpCircle, 
  Github, 
  X,
  type LucideIcon
} from 'lucide-react';
import clsx from 'clsx';
import './Sidebar.css';

export interface NavItem {
  /** Navigation label */
  label: string;
  /** Route path */
  path: string;
  /** Lucide icon component */
  icon: LucideIcon;
  /** Badge text (optional) */
  badge?: string;
}

export interface SidebarProps extends Omit<HTMLAttributes<HTMLElement>, 'children'> {
  /** Whether sidebar is open (mobile) */
  isOpen: boolean;
  /** Close handler */
  onClose: () => void;
  /** Custom nav items (replaces default) */
  navItems?: NavItem[];
  /** Custom resource items (replaces default) */
  resourceItems?: NavItem[];
  /** Footer content */
  footer?: ReactNode;
  /** Logo text */
  logoText?: string;
  /** Logo href */
  logoHref?: string;
}

const defaultNavItems: NavItem[] = [
  { label: 'Dashboard', path: '/dashboard', icon: LayoutDashboard },
  { label: 'Browse Circles', path: '/circles', icon: Search },
  { label: 'Create Circle', path: '/create', icon: PlusCircle },
  { label: 'Profile', path: '/profile', icon: User },
  { label: 'Settings', path: '/settings', icon: Settings },
];

const defaultResourceItems: NavItem[] = [
  { label: 'About', path: '/about', icon: BookOpen },
  { label: 'FAQ', path: '/faq', icon: HelpCircle },
];

interface NavItemComponentProps {
  item: NavItem;
  isActive: boolean;
  onClick?: () => void;
}

const NavItemComponent = memo(function NavItemComponent({
  item,
  isActive,
  onClick
}: NavItemComponentProps) {
  const Icon = item.icon;
  return (
    <li>
      <Link
        to={item.path}
        className={clsx('sidebar__nav-item', isActive && 'sidebar__nav-item--active')}
        onClick={onClick}
        aria-current={isActive ? 'page' : undefined}
      >
        <Icon className="sidebar__nav-icon" size={20} />
        <span className="sidebar__nav-label">{item.label}</span>
        {item.badge && (
          <span className="sidebar__nav-badge">{item.badge}</span>
        )}
      </Link>
    </li>
  );
});

export const Sidebar = memo(forwardRef<HTMLElement, SidebarProps>(
  function Sidebar(
    {
      isOpen,
      onClose,
      navItems = defaultNavItems,
      resourceItems = defaultResourceItems,
      footer,
      logoText = 'StackSusu',
      logoHref = '/',
      className,
      ...props
    },
    ref
  ) {
    const location = useLocation();

    // Handle escape key
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose();
        }
      };

      document.addEventListener('keydown', handleKeyDown);
      return () => document.removeEventListener('keydown', handleKeyDown);
    }, [isOpen, onClose]);

    // Prevent body scroll when open on mobile
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden';
      } else {
        document.body.style.overflow = '';
      }
      return () => {
        document.body.style.overflow = '';
      };
    }, [isOpen]);

    const handleNavClick = useCallback(() => {
      onClose();
    }, [onClose]);

    const navItemElements = useMemo(() => 
      navItems.map((item) => (
        <NavItemComponent
          key={item.path}
          item={item}
          isActive={location.pathname === item.path}
          onClick={handleNavClick}
        />
      )),
      [navItems, location.pathname, handleNavClick]
    );

    const resourceItemElements = useMemo(() => 
      resourceItems.map((item) => (
        <NavItemComponent
          key={item.path}
          item={item}
          isActive={location.pathname === item.path}
          onClick={handleNavClick}
        />
      )),
      [resourceItems, location.pathname, handleNavClick]
    );

    return (
      <>
        <div
          className={clsx('sidebar__overlay', isOpen && 'sidebar__overlay--visible')}
          onClick={onClose}
          aria-hidden="true"
        />
        <aside
          ref={ref}
          className={clsx('sidebar', isOpen && 'sidebar--open', className)}
          aria-label="Main navigation"
          {...props}
        >
          <div className="sidebar__header">
            <Link to={logoHref} className="sidebar__logo" onClick={onClose}>
              {logoText}
            </Link>
            <button 
              className="sidebar__close" 
              onClick={onClose}
              aria-label="Close navigation"
              type="button"
            >
              <X size={20} />
            </button>
          </div>

          <nav className="sidebar__nav">
            <div className="sidebar__section">
              <span className="sidebar__section-title">Main</span>
              <ul className="sidebar__list">{navItemElements}</ul>
            </div>

            {resourceItems.length > 0 && (
              <div className="sidebar__section">
                <span className="sidebar__section-title">Resources</span>
                <ul className="sidebar__list">{resourceItemElements}</ul>
              </div>
            )}
          </nav>

          <div className="sidebar__footer">
            {footer ?? (
              <a
                href="https://github.com/AdekunleBamz/Stacksusu"
                target="_blank"
                rel="noopener noreferrer"
                className="sidebar__nav-item"
              >
                <Github className="sidebar__nav-icon" size={20} />
                <span className="sidebar__nav-label">GitHub</span>
              </a>
            )}
          </div>
        </aside>
      </>
    );
  }
));

export { Sidebar as default };
