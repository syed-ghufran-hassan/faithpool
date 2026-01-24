import { useState, useCallback, memo } from 'react';
import { Wallet, Copy, LogOut, ExternalLink } from 'lucide-react';
import clsx from 'clsx';
import { useWallet } from '../../context';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Avatar } from '../Avatar';
import { truncateAddress } from '../../utils';
import './ConnectWallet.css';

export interface ConnectWalletProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export const ConnectWallet = memo<ConnectWalletProps>(function ConnectWallet({
  className = '',
  variant = 'full',
}) {
  const { address, isConnected, connect, disconnect } = useWallet();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = useCallback(async () => {
    try {
      await connect();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  }, [connect]);

  const handleDisconnect = useCallback(() => {
    disconnect();
    setShowModal(false);
  }, [disconnect]);

  const handleOpenModal = useCallback(() => {
    setShowModal(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setShowModal(false);
  }, []);

  const handleCopyAddress = useCallback(() => {
    if (address) {
      navigator.clipboard.writeText(address);
    }
  }, [address]);

  if (isConnected && address) {
    return (
      <>
        <button
          className={clsx('connect-wallet', 'connect-wallet--connected', className)}
          onClick={handleOpenModal}
        >
          <Avatar name={address} size="sm" />
          <span className="connect-wallet__address">
            {truncateAddress(address)}
          </span>
        </button>

        <Modal
          isOpen={showModal}
          onClose={handleCloseModal}
          title="Wallet Connected"
        >
          <div className="connect-wallet-modal">
            <div className="connect-wallet-modal__info">
              <Avatar name={address} size="lg" />
              <div className="connect-wallet-modal__address">
                <span className="connect-wallet-modal__label">Address</span>
                <code className="connect-wallet-modal__value">{address}</code>
              </div>
            </div>

            <div className="connect-wallet-modal__actions">
              <Button
                variant="secondary"
                onClick={handleCopyAddress}
                leftIcon={<Copy size={16} />}
              >
                Copy Address
              </Button>
              <Button
                variant="danger"
                onClick={handleDisconnect}
                leftIcon={<LogOut size={16} />}
              >
                Disconnect
              </Button>
            </div>
          </div>
        </Modal>
      </>
    );
  }

  if (variant === 'compact') {
    return (
      <Button
        className={clsx('connect-wallet-btn', className)}
        onClick={handleConnect}
        size="sm"
        leftIcon={<Wallet size={16} />}
      >
        Connect
      </Button>
    );
  }

  return (
    <>
      <Button
        className={clsx('connect-wallet-btn', className)}
        onClick={handleOpenModal}
        leftIcon={<Wallet size={18} />}
      >
        Connect Wallet
      </Button>

      <Modal
        isOpen={showModal}
        onClose={handleCloseModal}
        title="Connect Wallet"
      >
        <div className="connect-wallet-modal">
          <p className="connect-wallet-modal__description">
            Connect your Stacks wallet to access StackSusu savings circles.
          </p>

          <div className="connect-wallet-modal__options">
            <button className="connect-wallet-option" onClick={handleConnect}>
              <div className="connect-wallet-option__icon-wrapper">
                <Wallet size={24} />
              </div>
              <div className="connect-wallet-option__info">
                <span className="connect-wallet-option__name">Leather</span>
                <span className="connect-wallet-option__description">
                  Connect using Leather wallet
                </span>
              </div>
            </button>

            <button className="connect-wallet-option" onClick={handleConnect}>
              <div className="connect-wallet-option__icon-wrapper">
                <Wallet size={24} />
              </div>
              <div className="connect-wallet-option__info">
                <span className="connect-wallet-option__name">Xverse</span>
                <span className="connect-wallet-option__description">
                  Connect using Xverse wallet
                </span>
              </div>
            </button>
          </div>

          <p className="connect-wallet-modal__footer">
            Don't have a wallet?{' '}
            <a
              href="https://leather.io/install-extension"
              target="_blank"
              rel="noopener noreferrer"
            >
              Get Leather
              <ExternalLink size={12} />
            </a>
          </p>
        </div>
      </Modal>
    </>
  );
});

export default ConnectWallet;
