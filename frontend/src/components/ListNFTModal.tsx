// List NFT Modal - Set price and list NFT for sale

import { useState, useCallback, memo } from 'react';
import { Tag, Percent, Coins, AlertCircle, Sparkles, TrendingDown } from 'lucide-react';
import clsx from 'clsx';
import { Modal } from './Modal';
import { Input } from './Input';
import { Button } from './Button';
import { formatSTX } from '../utils/helpers';
import './ListNFTModal.css';

export interface ListNFTModalProps {
  isOpen: boolean;
  onClose: () => void;
  tokenId: number;
  onConfirm: (tokenId: number, price: number) => Promise<void>;
  suggestedPrice?: number;
  floorPrice?: number;
  className?: string;
}

const MARKETPLACE_FEE = 0.025; // 2.5%
const MIN_PRICE = 0.1;
const MAX_PRICE = 100000;

export const ListNFTModal = memo<ListNFTModalProps>(function ListNFTModal({
  isOpen,
  onClose,
  tokenId,
  onConfirm,
  suggestedPrice,
  floorPrice,
  className,
}) {
  const [price, setPrice] = useState(suggestedPrice?.toString() || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const priceNum = parseFloat(price) || 0;
  const isValidPrice = priceNum >= MIN_PRICE && priceNum <= MAX_PRICE;
  const receiveAmount = priceNum * (1 - MARKETPLACE_FEE);

  const handleSubmit = useCallback(async () => {
    if (!isValidPrice) {
      setError(`Price must be between ${MIN_PRICE} and ${MAX_PRICE.toLocaleString()} STX`);
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
  }, [isValidPrice, onConfirm, tokenId, priceNum, onClose]);

  const handlePriceChange = useCallback((value: string) => {
    // Only allow numbers and decimal point
    if (/^[0-9]*\.?[0-9]*$/.test(value)) {
      setPrice(value);
      setError(null);
    }
  }, []);

  const handleClose = useCallback(() => {
    if (!isSubmitting) {
      onClose();
    }
  }, [onClose, isSubmitting]);

  const handleSetSuggested = useCallback(() => {
    if (suggestedPrice) {
      setPrice(suggestedPrice.toString());
    }
  }, [suggestedPrice]);

  const handleSetFloor = useCallback(() => {
    if (floorPrice) {
      setPrice(floorPrice.toString());
    }
  }, [floorPrice]);

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title="List NFT for Sale"
    >
      <div className={clsx('list-nft-modal', className)}>
        <div className="list-nft-modal__preview">
          <div className="list-nft-modal__badge">
            <Tag size={16} />
            NFT #{tokenId}
          </div>
        </div>

        <div className="list-nft-modal__price-section">
          <label className="list-nft-modal__label">Set Your Price (STX)</label>
          <div className="list-nft-modal__input-wrapper">
            <Input
              type="text"
              value={price}
              onChange={(e) => handlePriceChange(e.target.value)}
              placeholder="0.00"
              className="list-nft-modal__input"
              autoFocus
            />
            <span className="list-nft-modal__suffix">STX</span>
          </div>

          {error && (
            <p className="list-nft-modal__error" role="alert">
              <AlertCircle size={14} />
              {error}
            </p>
          )}

          <div className="list-nft-modal__suggestions">
            {suggestedPrice && (
              <button
                type="button"
                className="list-nft-modal__suggestion"
                onClick={handleSetSuggested}
              >
                <Sparkles size={14} />
                Suggested: {formatSTX(suggestedPrice, 2)}
              </button>
            )}
            {floorPrice && (
              <button
                type="button"
                className="list-nft-modal__suggestion"
                onClick={handleSetFloor}
              >
                <TrendingDown size={14} />
                Floor: {formatSTX(floorPrice, 2)}
              </button>
            )}
          </div>
        </div>

        <div className="list-nft-modal__info">
          <div className="list-nft-modal__info-row">
            <span>
              <Percent size={14} />
              Marketplace Fee
            </span>
            <span>{(MARKETPLACE_FEE * 100).toFixed(1)}%</span>
          </div>
          <div className="list-nft-modal__info-row list-nft-modal__info-row--highlight">
            <span>
              <Coins size={14} />
              You Receive
            </span>
            <span className="list-nft-modal__receive">
              {formatSTX(receiveAmount, 2)}
            </span>
          </div>
        </div>

        <div className="list-nft-modal__actions">
          <Button variant="secondary" onClick={handleClose} disabled={isSubmitting}>
            Cancel
          </Button>
          <Button
            variant="primary"
            onClick={handleSubmit}
            disabled={!isValidPrice || isSubmitting}
            loading={isSubmitting}
            leftIcon={<Tag size={16} />}
          >
            List for Sale
          </Button>
        </div>
      </div>
    </Modal>
  );
});

export default ListNFTModal;
