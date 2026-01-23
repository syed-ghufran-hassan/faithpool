// List NFT Modal - Set price and list NFT for sale

import { useState } from 'react';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { formatSTX } from '../utils/helpers';
import './ListNFTModal.css';

interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  onConfirm: (tokenId: number, price: number) => Promise<void>;
  suggestedPrice?: number;
  floorPrice?: number;
}

export function ListNFTModal({
  isOpen,
  onClose,
  tokenId,
  onConfirm,
  suggestedPrice,
  floorPrice,
}: ListNFTModalProps) {
  const [price, setPrice] = useState(suggestedPrice?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceNum = parseFloat(price) || 0;
  const isValidPrice = priceNum >= 0.1 && priceNum <= 100000;

  const handleSubmit = async () => {
    if (!isValidPrice) {
      setError('Price must be between 0.1 and 100,000 STX');
      return;
    }

    setIsSubmitting(true);
    setError(null);

    try {
      await onConfirm(tokenId, priceNum);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to list NFT');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePriceChange = (value: string) => {
    // Only allow numbers and decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      setPrice(value);
      setError(null);
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="List NFT for Sale"
    >
      <div className="list-nft-modal">
        <div className="nft-preview">
          <div className="preview-badge">NFT #{tokenId}</div>
        </div>

        <div className="price-input-section">
          <label className="price-label">Set Your Price (STX)</label>
          <div className="price-input-wrapper">
            <Input
              type="text"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="0.00"
              className="price-input"
              autoFocus
            />
            <span className="price-suffix">STX</span>
          </div>

          {error && <p className="price-error">{error}</p>}

          <div className="price-suggestions">
            {suggestedPrice && (
              <button
                type="button"
                className="price-suggestion"
                onClick={() => setPrice(suggestedPrice.toString())}
              >
                Suggested: {formatSTX(suggestedPrice, 2)}
              </button>
            )}
            {floorPrice && (
              <button
                type="button"
                className="price-suggestion"
                onClick={() => setPrice(floorPrice.toString())}
              >
                Floor: {formatSTX(floorPrice, 2)}
              </button>
            )}
          </div>
        </div>

        <div className="listing-info">
          <div className="info-row">
            <span>Marketplace Fee</span>
            <span>2.5%</span>
          </div>
          <div className="info-row">
            <span>You Receive</span>
            <span className="receive-amount">
              {formatSTX(priceNum * 0.975, 2)}
            </span>
          </div>
        </div>

        <div className="modal-actions">
          <Button variant="secondary" onClick={onClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValidPrice || isSubmitting}
            loading={isSubmitting}
          >
            List for Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
}

export default ListNFTModal;
