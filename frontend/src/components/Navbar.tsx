import { useState, useEffect, useCallback } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Menu, X, Wallet, ChevronDown, LogOut, Home, Users, LayoutDashboard } from 'lucide-react';
import { useWallet } from '../context/WalletContext';
import { truncateAddress, formatSTX } from '../utils/helpers';
import clsx from 'clsx';
import './Navbar.css';

interface NavLinkConfig {
  path: string;
  label: string;
  icon: React.ReactNode;
  requiresAuth?: boolean;
}

const navLinks: NavLinkConfig[] = [
  { path: '/', label: 'Home', icon: <Home size={18} /> },
  { path: '/circles', label: 'Circles', icon: <Users size={18} /> },
  { path: '/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} />, requiresAuth: true },
];

function Navbar() {
  const location = useLocation();
  const { isConnected, isConnecting, address, balance, connect, disconnect, error } = useWallet();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isWalletDropdownOpen, setIsWalletDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Handle scroll effect
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu on route change
  useEffect(() => {
    setIsMobileMenuOpen(false);
    setIsWalletDropdownOpen(false);
  }, [location.pathname]);

  // Close dropdown when clicking outside
  useEffect(() => {
    if (isWalletDropdownOpen) {
      const handleClickOutside = (e: MouseEvent) => {
        const target = e.target as Element;
        if (!target.closest('.wallet-dropdown')) {
          setIsWalletDropdownOpen(false);
        }
      };
      document.addEventListener('click', handleClickOutside);
      return () => document.removeEventListener('click', handleClickOutside);
    }
    return undefined;
  }, [isWalletDropdownOpen]);

  const toggleMobileMenu = useCallback(() => {
    setIsMobileMenuOpen(prev => !prev);
  }, []);

  const toggleWalletDropdown = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setIsWalletDropdownOpen(prev => !prev);
  }, []);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setIsWalletDropdownOpen(false);
  }, [disconnect]);

  const isActive = (path: string) => location.pathname === path;

  const filteredLinks = navLinks.filter(
    link => !link.requiresAuth || isConnected
  );

  return (
    <nav className={clsx('navbar', { 'navbar--scrolled': isScrolled })}>
      <div className="navbar__container">
        <Link to="/" className="navbar__brand">
          <span className="navbar__brand-icon">🔄</span>
          <span className="navbar__brand-text">StackSUSU</span>
        </Link>

        {/* Desktop Navigation */}
        <div className="navbar__links">
          {filteredLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={clsx('navbar__link', { 'navbar__link--active': isActive(link.path) })}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>

        {/* Wallet Actions */}
        <div className="navbar__actions">
          {isConnected ? (
            <div className="wallet-dropdown">
              <button 
                className="wallet-dropdown__trigger"
                onClick={toggleWalletDropdown}
                aria-expanded={isWalletDropdownOpen}
              >
                <div className="wallet-dropdown__balance">
                  <Wallet size={16} />
                  <span>{formatSTX(balance, 2)}</span>
                </div>
                <div className="wallet-dropdown__address">
                  {truncateAddress(address || '')}
                </div>
                <ChevronDown 
                  size={16} 
                  className={clsx('wallet-dropdown__chevron', { 'wallet-dropdown__chevron--open': isWalletDropdownOpen })}
                />
              </button>
              
              {isWalletDropdownOpen && (
                <div className="wallet-dropdown__menu">
                  <div className="wallet-dropdown__info">
                    <span className="wallet-dropdown__label">Connected Wallet</span>
                    <span className="wallet-dropdown__full-address">{address}</span>
                  </div>
                  <div className="wallet-dropdown__divider" />
                  <button 
                    className="wallet-dropdown__item wallet-dropdown__item--danger"
                    onClick={handleDisconnect}
                  >
                    <LogOut size={16} />
                    <span>Disconnect</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <button
              onClick={connect}
              className="navbar__connect-btn"
              disabled={isConnecting}
            >
              <Wallet size={18} />
              <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
            </button>
          )}
          
          {error && <span className="navbar__error">{error}</span>}
        </div>

        {/* Mobile Menu Button */}
        <button 
          className="navbar__mobile-btn"
          onClick={toggleMobileMenu}
          aria-label={isMobileMenuOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={isMobileMenuOpen}
        >
          {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
        </button>
      </div>

      {/* Mobile Menu */}
      <div className={clsx('navbar__mobile-menu', { 'navbar__mobile-menu--open': isMobileMenuOpen })}>
        <div className="navbar__mobile-links">
          {filteredLinks.map(link => (
            <Link
              key={link.path}
              to={link.path}
              className={clsx('navbar__mobile-link', { 'navbar__mobile-link--active': isActive(link.path) })}
            >
              {link.icon}
              <span>{link.label}</span>
            </Link>
          ))}
        </div>
        
        {!isConnected && (
          <button
            onClick={connect}
            className="navbar__connect-btn navbar__connect-btn--mobile"
            disabled={isConnecting}
          >
            <Wallet size={18} />
            <span>{isConnecting ? 'Connecting...' : 'Connect Wallet'}</span>
          </button>
        )}
      </div>
    </nav>
  );
}

export default Navbar;
