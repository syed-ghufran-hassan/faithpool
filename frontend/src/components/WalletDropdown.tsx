import { forwardRef, useState, useRef, useEffect, useCallback, memo } from 'react';
import { 
  Wallet, 
  ChevronDown, 
  Copy, 
  Check, 
  ExternalLink, 
  DollarSign, 
  LogOut 
} from 'lucide-react';
import clsx from 'clsx';
import { Button } from './Button';
import { Avatar } from './Avatar';
import { Badge } from './Badge';
import './WalletDropdown.css';

export type NetworkType = 'mainnet' | 'testnet' | 'devnet';

export interface WalletDropdownProps {
  /** Wallet address */
  address: string;
  /** Balance in microSTX */
  balance: number;
  /** Connection status */
  isConnected: boolean;
  /** Network type */
  network?: NetworkType;
  /** Connect handler */
  onConnect?: () => void;
  /** Disconnect handler */
  onDisconnect?: () => void;
  /** Copy address handler */
  onCopyAddress?: () => void;
  /** View explorer handler */
  onViewExplorer?: () => void;
  /** Optional class name */
  className?: string;
  /** Show balance in trigger */
  showBalanceInTrigger?: boolean;
}

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

const getNetworkBadgeVariant = (net: NetworkType): 'success' | 'warning' | 'info' => {
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

export const WalletDropdown = memo(forwardRef<HTMLDivElement, WalletDropdownProps>(
  function WalletDropdown(
    {
      address,
      balance,
      isConnected,
      network = 'mainnet',
      onConnect,
      onDisconnect,
      onCopyAddress,
      onViewExplorer,
      className,
      showBalanceInTrigger = true,
    },
    ref
  ) {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const containerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
      const handleClickOutside = (event: MouseEvent) => {
        if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
          setIsOpen(false);
        }
      };

      const handleEscape = (event: KeyboardEvent) => {
        if (event.key === 'Escape') {
          setIsOpen(false);
        }
      };

      if (isOpen) {
        document.addEventListener('mousedown', handleClickOutside);
        document.addEventListener('keydown', handleEscape);
      }

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
      };
    }, [isOpen]);

    const handleCopyAddress = useCallback(() => {
      navigator.clipboard.writeText(address);
      setCopied(true);
      onCopyAddress?.();
      setTimeout(() => setCopied(false), 2000);
    }, [address, onCopyAddress]);

    const getExplorerUrl = useCallback((): string => {
      const baseUrl = network === 'mainnet'
        ? 'https://explorer.stacks.co'
        : `https://explorer.stacks.co/?chain=${network}`;
      return `${baseUrl}/address/${address}`;
    }, [network, address]);

    const handleToggle = useCallback(() => {
      setIsOpen(prev => !prev);
    }, []);

    if (!isConnected) {
      return (
        <div ref={ref} className={clsx('wallet-dropdown', className)}>
          <Button
            variant="primary"
            onClick={onConnect}
            leftIcon={<Wallet size={18} />}
          >
            Connect Wallet
          </Button>
        </div>
      );
    }

    return (
      <div ref={ref} className={clsx('wallet-dropdown', className)}>
        <div ref={containerRef}>
          <button
            className="wallet-dropdown__trigger"
            onClick={handleToggle}
            aria-expanded={isOpen}
            aria-haspopup="true"
          >
            <Avatar address={address} size="sm" />
            {showBalanceInTrigger && (
              <div className="wallet-dropdown__trigger-info">
                <span className="wallet-dropdown__trigger-balance">
                  {formatSTX(balance)} STX
                </span>
                <span className="wallet-dropdown__trigger-address">
                  {truncateAddress(address)}
                </span>
              </div>
            )}
            <ChevronDown 
              className={clsx(
                'wallet-dropdown__chevron',
                isOpen && 'wallet-dropdown__chevron--open'
              )}
              size={16}
            />
          </button>

          {isOpen && (
            <div className="wallet-dropdown__menu" role="menu">
              {/* Header with balance */}
              <div className="wallet-dropdown__header">
                <div className="wallet-dropdown__avatar-large">
                  <Avatar address={address} size="lg" />
                </div>
                <div className="wallet-dropdown__account-info">
                  <div className="wallet-dropdown__balance-row">
                    <span className="wallet-dropdown__balance-label">Balance</span>
                    <Badge variant={getNetworkBadgeVariant(network)} size="sm">
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
                    type="button"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
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
                  type="button"
                >
                  <ExternalLink size={18} />
                  <span>View on Explorer</span>
                </button>

                <button
                  className="wallet-dropdown__action-item"
                  onClick={() => {
                    window.open('https://app.stacks.co/', '_blank');
                  }}
                  type="button"
                >
                  <DollarSign size={18} />
                  <span>Get STX</span>
                </button>

                <button
                  className="wallet-dropdown__action-item wallet-dropdown__action-item--danger"
                  onClick={() => {
                    setIsOpen(false);
                    onDisconnect?.();
                  }}
                  type="button"
                >
                  <LogOut size={18} />
                  <span>Disconnect</span>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>
    );
  }
));

export { WalletDropdown as default };
