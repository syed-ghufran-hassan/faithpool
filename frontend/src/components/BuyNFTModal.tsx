// Buy NFT Confirmation Modal

import { Modal } from './Modal';
import { Button } from './Button';
import { formatSTX, truncateAddress } from '../utils/helpers';
import type { NFTToken } from '../types/blockchain';
import { formatNFTDisplay } from '../services/nft';
import './BuyNFTModal.css';

interface BuyNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: NFTToken;
  userBalance: number;
  onConfirm: () => Promise<void>;
  isProcessing?: boolean;
}

export function BuyNFTModal({
  isOpen,
  onClose,
  token,
  userBalance,
  onConfirm,
  isProcessing = false,
}: BuyNFTModalProps) {
  const display = formatNFTDisplay(token);
  const price = token.listing?.price ?? 0;
  const hasEnoughBalance = userBalance >= price;
  const remainingBalance = userBalance - price;

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Confirm Purchase"
    >
      <div className="buy-nft-modal">
        <div className="nft-purchase-preview">
          <img
            src={display.image}
            alt={display.title}
            className="purchase-image"
          />
          <div className="purchase-details">
            <h3 className="purchase-title">{display.title}</h3>
            <p className="purchase-description">{display.description}</p>
            <div className="purchase-seller">
              <span className="seller-label">Seller:</span>
              <span className="seller-address">
                {truncateAddress(token.listing?.seller || token.owner || '')}
              </span>
            </div>
          </div>
        </div>

        <div className="purchase-breakdown">
          <div className="breakdown-row">
            <span>NFT Price</span>
            <span className="price-value">{formatSTX(price, 2)}</span>
          </div>
          <div className="breakdown-row">
            <span>Your Balance</span>
            <span className={!hasEnoughBalance ? 'insufficient' : ''}>
              {formatSTX(userBalance, 2)}
            </span>
          </div>
          <div className="breakdown-divider" />
          <div className="breakdown-row total">
            <span>Remaining After Purchase</span>
            <span className={remainingBalance < 0 ? 'insufficient' : ''}>
              {formatSTX(Math.max(0, remainingBalance), 2)}
            </span>
          </div>
        </div>

        {!hasEnoughBalance && (
          <div className="insufficient-funds-warning">
            <span className="warning-icon">⚠️</span>
            <span>Insufficient balance. You need {formatSTX(price - userBalance, 2)} more.</span>
          </div>
        )}

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={isProcessing}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={onConfirm}
            disabled={!hasEnoughBalance || isProcessing}
            loading={isProcessing}
          >
            Buy for {formatSTX(price, 2)}
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default BuyNFTModal;
