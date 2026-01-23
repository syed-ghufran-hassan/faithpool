import React, { useState, useRef, useEffect } from 'react';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import './WalletDropdown.css';

interface WalletDropdownProps {
  address: string;
  balance: number;
  isConnected: boolean;
  network?: 'mainnet' | 'testnet' | 'devnet';
  onConnect?: () => void;
  onDisconnect?: () => void;
  onCopyAddress?: () => void;
  onViewExplorer?: () => void;
  className?: string;
}

export const WalletDropdown: React.FC<WalletDropdownProps> = ({
  address,
  balance,
  isConnected,
  network = 'mainnet',
  onConnect,
  onDisconnect,
  onCopyAddress,
  onViewExplorer,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [copied, setCopied] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const formatSTX = (microStx: number): string => {
    return (microStx / 1_000_000).toLocaleString('en-US', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };

  const truncateAddress = (addr: string): string => {
    if (addr.length <= 16) return addr;
    return `${addr.slice(0, 8)}...${addr.slice(-6)}`;
  };

  const handleCopyAddress = () => {
    navigator.clipboard.writeText(address);
    setCopied(true);
    onCopyAddress?.();
    setTimeout(() => setCopied(false), 2000);
  };

  const getNetworkColor = (net: string): 'success' | 'warning' | 'info' => {
    switch (net) {
      case 'mainnet':
        return 'success';
      case 'testnet':
        return 'warning';
      case 'devnet':
        return 'info';
      default:
        return 'info';
    }
  };

  const getExplorerUrl = (): string => {
    const baseUrl = network === 'mainnet'
      ? 'https://explorer.stacks.co'
      : `https://explorer.stacks.co/?chain=${network}`;
    return `${baseUrl}/address/${address}`;
  };

  if (!isConnected) {
    return (
      <div className={`wallet-dropdown ${className}`}>
        <Button
          variant="primary"
          onClick={onConnect}
          icon={
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 12V7H5a2 2 0 010-4h14v4" />
              <path d="M3 5v14a2 2 0 002 2h16v-5" />
              <path d="M18 12a2 2 0 100 4 2 2 0 000-4z" />
            </svg>
          }
        >
          Connect Wallet
        </Button>
      </div>
    );
  }

  return (
    <div className={`wallet-dropdown ${className}`} ref={containerRef}>
      <button
        className="wallet-dropdown__trigger"
        onClick={() => setIsOpen(!isOpen)}
        aria-expanded={isOpen}
        aria-haspopup="true"
      >
        <Avatar address={address} size="small" />
        <div className="wallet-dropdown__trigger-info">
          <span className="wallet-dropdown__trigger-balance">
            {formatSTX(balance)} STX
          </span>
          <span className="wallet-dropdown__trigger-address">
            {truncateAddress(address)}
          </span>
        </div>
        <svg
          className={`wallet-dropdown__chevron ${isOpen ? 'wallet-dropdown__chevron--open' : ''}`}
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
        >
          <polyline points="6,9 12,15 18,9" />
        </svg>
      </button>

      {isOpen && (
        <div className="wallet-dropdown__menu">
          {/* Header with balance */}
          <div className="wallet-dropdown__header">
            <div className="wallet-dropdown__avatar-large">
              <Avatar address={address} size="large" />
            </div>
            <div className="wallet-dropdown__account-info">
              <div className="wallet-dropdown__balance-row">
                <span className="wallet-dropdown__balance-label">Balance</span>
                <Badge variant={getNetworkColor(network)} size="small">
                  {network}
                </Badge>
              </div>
              <span className="wallet-dropdown__balance-value">
                {formatSTX(balance)} <small>STX</small>
              </span>
            </div>
          </div>

          {/* Address section */}
          <div className="wallet-dropdown__address-section">
            <span className="wallet-dropdown__address-label">Wallet Address</span>
            <div className="wallet-dropdown__address-row">
              <code className="wallet-dropdown__address-code">
                {truncateAddress(address)}
              </code>
              <button
                className="wallet-dropdown__copy-btn"
                onClick={handleCopyAddress}
                aria-label="Copy address"
              >
                {copied ? (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <polyline points="20 6 9 17 4 12" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="9" y="9" width="13" height="13" rx="2" ry="2" />
                    <path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1" />
                  </svg>
                )}
              </button>
            </div>
            {copied && (
              <span className="wallet-dropdown__copied-text">
                Address copied!
              </span>
            )}
          </div>

          {/* Actions */}
          <div className="wallet-dropdown__actions">
            <button
              className="wallet-dropdown__action-item"
              onClick={() => {
                window.open(getExplorerUrl(), '_blank');
                onViewExplorer?.();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 13v6a2 2 0 01-2 2H5a2 2 0 01-2-2V8a2 2 0 012-2h6" />
                <polyline points="15 3 21 3 21 9" />
                <line x1="10" y1="14" x2="21" y2="3" />
              </svg>
              <span>View on Explorer</span>
            </button>

            <button
              className="wallet-dropdown__action-item"
              onClick={() => {
                window.open('https://app.stacks.co/', '_blank');
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="12" y1="1" x2="12" y2="23" />
                <path d="M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6" />
              </svg>
              <span>Get STX</span>
            </button>

            <button
              className="wallet-dropdown__action-item wallet-dropdown__action-item--danger"
              onClick={() => {
                setIsOpen(false);
                onDisconnect?.();
              }}
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M9 21H5a2 2 0 01-2-2V5a2 2 0 012-2h4" />
                <polyline points="16 17 21 12 16 7" />
                <line x1="21" y1="12" x2="9" y2="12" />
              </svg>
              <span>Disconnect</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default WalletDropdown;
