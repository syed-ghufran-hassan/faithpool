import { useState } from 'react';
import { useStacks } from '../../hooks';
import { Button } from '../Button';
import { Modal } from '../Modal';
import { Avatar } from '../Avatar';
import { truncateAddress } from '../../utils';
import './ConnectWallet.css';

interface ConnectWalletProps {
  className?: string;
  variant?: 'full' | 'compact';
}

export function ConnectWallet({ className = '', variant = 'full' }: ConnectWalletProps) {
  const { address, isConnected, connect, disconnect } = useStacks();
  const [showModal, setShowModal] = useState(false);

  const handleConnect = async () => {
    try {
      await connect();
      setShowModal(false);
    } catch (error) {
      console.error('Failed to connect wallet:', error);
    }
  };

  const handleDisconnect = () => {
    disconnect();
    setShowModal(false);
  };

  if (isConnected && address) {
    return (
      <>
        <button
          className={`connect-wallet connected ${className}`}
          onClick={() => setShowModal(true)}
        >
          <Avatar name={address} size="sm" />
          <span className="connect-wallet__address">
            {truncateAddress(address)}
          </span>
        </button>

        <Modal
          isOpen={showModal}
          onClose={() => setShowModal(false)}
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
                onClick={() => navigator.clipboard.writeText(address)}
              >
                Copy Address
              </Button>
              <Button variant="danger" onClick={handleDisconnect}>
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
        className={`connect-wallet-btn ${className}`}
        onClick={handleConnect}
        size="sm"
      >
        Connect
      </Button>
    );
  }

  return (
    <>
      <Button
        className={`connect-wallet-btn ${className}`}
        onClick={() => setShowModal(true)}
      >
        Connect Wallet
      </Button>

      <Modal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        title="Connect Wallet"
      >
        <div className="connect-wallet-modal">
          <p className="connect-wallet-modal__description">
            Connect your Stacks wallet to access StackSusu savings circles.
          </p>

          <div className="connect-wallet-modal__options">
            <button className="connect-wallet-option" onClick={handleConnect}>
              <img
                src="/icons/leather-wallet.svg"
                alt="Leather"
                className="connect-wallet-option__icon"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
              <div className="connect-wallet-option__info">
                <span className="connect-wallet-option__name">Leather</span>
                <span className="connect-wallet-option__description">
                  Connect using Leather wallet
                </span>
              </div>
            </button>

            <button className="connect-wallet-option" onClick={handleConnect}>
              <img
                src="/icons/xverse-wallet.svg"
                alt="Xverse"
                className="connect-wallet-option__icon"
                onError={(e) => {
                  (e.target as HTMLImageElement).style.display = 'none';
                }}
              />
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
            </a>
          </p>
        </div>
      </Modal>
    </>
  );
}
