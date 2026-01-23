// Buy NFT Confirmation Modal

import { memo, useCallback } from 'react';
import { AlertTriangle, User, ShoppingCart } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from './Modal';
import { Button } from './Button';
import { formatSTX, truncateAddress } from '../utils/helpers';
import type { NFTToken } from '../types/blockchain';
import { formatNFTDisplay } from '../services/nft';
import './BuyNFTModal.css';

export interface BuyNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: NFTToken;
  userBalance: number;
  onConfirm: () => Promise<void>;
  isProcessing?: boolean;
  className?: string;
}

export const BuyNFTModal = memo<BuyNFTModalProps>(function BuyNFTModal({
  isOpen,
  onClose,
  token,
  userBalance,
  onConfirm,
  isProcessing = false,
  className,
}) {
  const display = formatNFTDisplay(token);
  const price = token.listing?.price ?? 0;
  const hasEnoughBalance = userBalance >= price;
  const remainingBalance = userBalance - price;

  const handleConfirm = useCallback(async () => {
    await onConfirm();
  }, [onConfirm]);

  const handleClose = useCallback(() => {
    if (!isProcessing) {
      onClose();
    }
  }, [onClose, isProcessing]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="Confirm Purchase"
    >
      <div className={clsx('buy-nft-modal', className)}>
        <div className="buy-nft-modal__preview">
          <img
            src={display.image}
            alt={display.title}
            className="buy-nft-modal__image"
          />
          <div className="buy-nft-modal__details">
            <h3 className="buy-nft-modal__title">{display.title}</h3>
            <p className="buy-nft-modal__description">{display.description}</p>
            <div className="buy-nft-modal__seller">
              <User size={12} className="buy-nft-modal__seller-icon" />
              <span className="buy-nft-modal__seller-label">Seller:</span>
              <span className="buy-nft-modal__seller-address">
                {truncateAddress(token.listing?.seller || token.owner || '')}
              </span>
            </div>
          </div>
        </div>

        <div className="buy-nft-modal__breakdown">
          <div className="buy-nft-modal__row">
            <span>NFT Price</span>
            <span className="buy-nft-modal__price">{formatSTX(price, 2)}</span>
          </div>
          <div className="buy-nft-modal__row">
            <span>Your Balance</span>
            <span className={clsx(!hasEnoughBalance && 'buy-nft-modal__insufficient')}>
              {formatSTX(userBalance, 2)}
            </span>
          </div>
          <div className="buy-nft-modal__divider" />
          <div className="buy-nft-modal__row buy-nft-modal__row--total">
            <span>Remaining After Purchase</span>
            <span className={clsx(remainingBalance < 0 && 'buy-nft-modal__insufficient')}>
              {formatSTX(Math.max(0, remainingBalance), 2)}
            </span>
          </div>
        </div>

        {!hasEnoughBalance && (
          <div className="buy-nft-modal__warning" role="alert">
            <AlertTriangle size={20} className="buy-nft-modal__warning-icon" />
            <span>Insufficient balance. You need {formatSTX(price - userBalance, 2)} more.</span>
          </div>
        )}

        <div className="buy-nft-modal__actions">
          <Button variant="secondary" onClick={handleClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleConfirm}
            disabled={!hasEnoughBalance || isProcessing}
            loading={isProcessing}
            leftIcon={<ShoppingCart size={16} />}
          >
            Buy for {formatSTX(price, 2)}
          </Button>
        </div>
      </div>
    </Modal>
  );
});

export default BuyNFTModal;
