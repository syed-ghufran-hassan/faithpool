// NFTCard component - Display NFT with metadata

import { forwardRef, memo, type HTMLAttributes } from 'react';
import {
  Tag,
  ShoppingCart,
  XCircle,
  ExternalLink,
  Heart,
  Share2,
  MoreHorizontal,
  Verified,
} from 'lucide-react';
import clsx from 'clsx';
import { formatSTX } from '../utils/helpers';
import { formatNFTDisplay } from '../services/nft';
import type { NFTToken } from '../types/blockchain';
import { Badge } from './Badge';
import { Button } from './Button';
import { Card } from './Card';
import './NFTCard.css';

// ============================================================================
// Types
// ============================================================================

export interface NFTCardProps extends Omit<HTMLAttributes<HTMLDivElement>, 'title'> {
  /** NFT token data */
  token: NFTToken;
  /** Whether current user owns this NFT */
  isOwner?: boolean;
  /** Handler for listing NFT */
  onList?: (tokenId: number) => void;
  /** Handler for unlisting NFT */
  onUnlist?: (tokenId: number) => void;
  /** Handler for buying NFT */
  onBuy?: (tokenId: number) => void;
  /** Handler for viewing details */
  onViewDetails?: (tokenId: number) => void;
  /** Handler for favoriting */
  onFavorite?: (tokenId: number) => void;
  /** Handler for sharing */
  onShare?: (tokenId: number) => void;
  /** Whether NFT is favorited */
  isFavorited?: boolean;
  /** Show verified badge */
  isVerified?: boolean;
  /** Visual variant */
  variant?: 'default' | 'minimal' | 'featured';
  /** Size variant */
  size?: 'sm' | 'md' | 'lg';
  /** Loading state */
  loading?: boolean;
}

export interface NFTCardCompactProps extends HTMLAttributes<HTMLDivElement> {
  /** NFT token data */
  token: NFTToken;
  /** Click handler */
  onClick?: () => void;
  /** Show price */
  showPrice?: boolean;
}

// ============================================================================
// NFTCard Component
// ============================================================================

export const NFTCard = memo(
  forwardRef<HTMLDivElement, NFTCardProps>(
    (
      {
        token,
        isOwner = false,
        onList,
        onUnlist,
        onBuy,
        onViewDetails,
        onFavorite,
        onShare,
        isFavorited = false,
        isVerified = false,
        variant = 'default',
        size = 'md',
        loading = false,
        className,
        ...props
      },
      ref
    ) => {
      const display = formatNFTDisplay(token);
      const isListed = token.listing !== null;

      if (loading) {
        return (
          <Card
            ref={ref}
            className={clsx('nft-card', 'nft-card--loading', `nft-card--${size}`, className)}
            {...props}
          >
            <div className="nft-card__image-skeleton" />
            <div className="nft-card__info">
              <div className="nft-card__title-skeleton" />
              <div className="nft-card__desc-skeleton" />
            </div>
          </Card>
        );
      }

      return (
        <Card
          ref={ref}
          className={clsx(
            'nft-card',
            `nft-card--${variant}`,
            `nft-card--${size}`,
            { 'nft-card--listed': isListed },
            className
          )}
          onClick={() => onViewDetails?.(token.tokenId)}
          {...props}
        >
          <div className="nft-card__image-container">
            <img src={display.image} alt={display.title} className="nft-card__image" />

            {/* Overlay actions */}
            <div className="nft-card__overlay">
              {onFavorite && (
                <button
                  className={clsx('nft-card__action-btn', { 'nft-card__action-btn--active': isFavorited })}
                  onClick={(e) => {
                    e.stopPropagation();
                    onFavorite(token.tokenId);
                  }}
                  aria-label={isFavorited ? 'Remove from favorites' : 'Add to favorites'}
                >
                  <Heart size={16} fill={isFavorited ? 'currentColor' : 'none'} />
                </button>
              )}
              {onShare && (
                <button
                  className="nft-card__action-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    onShare(token.tokenId);
                  }}
                  aria-label="Share"
                >
                  <Share2 size={16} />
                </button>
              )}
            </div>

            {/* Price tag */}
            {isListed && (
              <div className="nft-card__price-tag">
                <Tag size={12} />
                {formatSTX(token.listing!.price, 2)}
              </div>
            )}

            {/* Verified badge */}
            {isVerified && (
              <div className="nft-card__verified">
                <Verified size={14} />
              </div>
            )}
          </div>

          <div className="nft-card__info">
            <div className="nft-card__header">
              <h3 className="nft-card__title">
                {display.title}
                {isOwner && (
                  <Badge variant="primary" size="sm">
                    Owned
                  </Badge>
                )}
              </h3>
            </div>

            <p className="nft-card__description">{display.description}</p>

            {variant !== 'minimal' && display.attributes.length > 0 && (
              <div className="nft-card__attributes">
                {display.attributes.slice(0, 3).map((attr) => (
                  <div key={attr.trait} className="nft-card__attribute">
                    <span className="nft-card__attr-trait">{attr.trait}</span>
                    <span className="nft-card__attr-value">{attr.value}</span>
                  </div>
                ))}
                {display.attributes.length > 3 && (
                  <div className="nft-card__attribute nft-card__attribute--more">
                    <MoreHorizontal size={14} />
                    <span>+{display.attributes.length - 3}</span>
                  </div>
                )}
              </div>
            )}

            <div className="nft-card__actions">
              {isOwner ? (
                isListed ? (
                  <Button
                    variant="secondary"
                    size="sm"
                    leftIcon={<XCircle size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onUnlist?.(token.tokenId);
                    }}
                  >
                    Unlist
                  </Button>
                ) : (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<Tag size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onList?.(token.tokenId);
                    }}
                  >
                    List for Sale
                  </Button>
                )
              ) : (
                isListed && (
                  <Button
                    variant="primary"
                    size="sm"
                    leftIcon={<ShoppingCart size={14} />}
                    onClick={(e) => {
                      e.stopPropagation();
                      onBuy?.(token.tokenId);
                    }}
                  >
                    Buy Now
                  </Button>
                )
              )}
              <Button
                variant="ghost"
                size="sm"
                leftIcon={<ExternalLink size={14} />}
                onClick={(e) => {
                  e.stopPropagation();
                  onViewDetails?.(token.tokenId);
                }}
              >
                Details
              </Button>
            </div>
          </div>
        </Card>
      );
    }
  )
);

NFTCard.displayName = 'NFTCard';

// ============================================================================
// NFTCardCompact Component
// ============================================================================

export const NFTCardCompact = memo(
  forwardRef<HTMLDivElement, NFTCardCompactProps>(
    ({ token, onClick, showPrice = true, className, ...props }, ref) => {
      const display = formatNFTDisplay(token);
      const isListed = token.listing !== null;

      return (
        <div
          ref={ref}
          className={clsx('nft-card-compact', className)}
          onClick={onClick}
          role={onClick ? 'button' : undefined}
          tabIndex={onClick ? 0 : undefined}
          {...props}
        >
          <img src={display.image} alt={display.title} className="nft-card-compact__image" />
          <div className="nft-card-compact__info">
            <span className="nft-card-compact__id">#{token.tokenId}</span>
            {showPrice && isListed && (
              <span className="nft-card-compact__price">
                {formatSTX(token.listing!.price, 2)}
              </span>
            )}
          </div>
        </div>
      );
    }
  )
);

NFTCardCompact.displayName = 'NFTCardCompact';

// ============================================================================
// Exports
// ============================================================================

export default NFTCard;
