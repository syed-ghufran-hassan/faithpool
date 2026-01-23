// NFTCard component - Display NFT with metadata

import { formatSTX } from '../utils/helpers';
import { generateNFTImage, formatNFTDisplay } from '../services/nft';
import type { NFTToken, NFTMetadata, NFTListing } from '../types/blockchain';
import Badge from './Badge';
import Button from './Button';
import Card from './Card';
import './NFTCard.css';

interface NFTCardProps {
  token: NFTToken;
  isOwner?: boolean;
  onList?: (tokenId: number) => void;
  onUnlist?: (tokenId: number) => void;
  onBuy?: (tokenId: number) => void;
  onViewDetails?: (tokenId: number) => void;
}

export function NFTCard({
  token,
  isOwner = false,
  onList,
  onUnlist,
  onBuy,
  onViewDetails,
}: NFTCardProps) {
  const display = formatNFTDisplay(token);
  const isListed = token.listing !== null;

  return (
    <Card className="nft-card" onClick={() => onViewDetails?.(token.tokenId)}>
      <div className="nft-image-container">
        <img 
          src={display.image} 
          alt={display.title}
          className="nft-image"
        />
        {isListed && (
          <div className="nft-price-tag">
            {formatSTX(token.listing!.price, 2)}
          </div>
        )}
      </div>

      <div className="nft-info">
        <h3 className="nft-title">{display.title}</h3>
        <p className="nft-description">{display.description}</p>

        <div className="nft-attributes">
          {display.attributes.map((attr) => (
            <div key={attr.trait} className="nft-attribute">
              <span className="attr-trait">{attr.trait}</span>
              <span className="attr-value">{attr.value}</span>
            </div>
          ))}
        </div>

        <div className="nft-actions">
          {isOwner ? (
            isListed ? (
              <Button
                variant="secondary"
                size="sm"
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
                onClick={(e) => {
                  e.stopPropagation();
                  onBuy?.(token.tokenId);
                }}
              >
                Buy Now
              </Button>
            )
          )}
        </div>
      </div>
    </Card>
  );
}

// Compact version for grids
export function NFTCardCompact({ 
  token,
  onClick,
}: { 
  token: NFTToken;
  onClick?: () => void;
}) {
  const display = formatNFTDisplay(token);
  const isListed = token.listing !== null;

  return (
    <div className="nft-card-compact" onClick={onClick}>
      <img 
        src={display.image} 
        alt={display.title}
        className="nft-image-compact"
      />
      <div className="nft-compact-info">
        <span className="nft-compact-id">#{token.tokenId}</span>
        {isListed && (
          <span className="nft-compact-price">
            {formatSTX(token.listing!.price, 2)}
          </span>
        )}
      </div>
    </div>
  );
}

export default NFTCard;
