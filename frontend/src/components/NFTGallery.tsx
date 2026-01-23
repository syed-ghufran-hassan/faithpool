// NFT Gallery Component - Grid display of NFTs

import { useState, useMemo } from 'react';
import { NFTCard } from './NFTCard';
import { Input } from './Input';
import { Select } from './Select';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import type { NFTToken } from '../types/blockchain';
import './NFTGallery.css';

interface NFTGalleryProps {
  tokens: NFTToken[];
  isLoading?: boolean;
  userAddress?: string | null;
  onBuy?: (tokenId: number) => void;
  onList?: (tokenId: number) => void;
  onUnlist?: (tokenId: number) => void;
  emptyMessage?: string;
  showFilters?: boolean;
}

type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'circle';

export function NFTGallery({
  tokens,
  isLoading = false,
  userAddress,
  onBuy,
  onList,
  onUnlist,
  emptyMessage = 'No NFTs found',
  showFilters = true,
}: NFTGalleryProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [sortBy, setSortBy] = useState<SortOption>('newest');
  const [filterListed, setFilterListed] = useState<'all' | 'listed' | 'unlisted'>('all');

  const filteredAndSortedTokens = useMemo(() => {
    let result = [...tokens];

    // Filter by search
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      result = result.filter(token => 
        token.tokenId.toString().includes(query) ||
        token.metadata?.circleId?.toString().includes(query)
      );
    }

    // Filter by listing status
    if (filterListed === 'listed') {
      result = result.filter(token => token.listing !== null);
    } else if (filterListed === 'unlisted') {
      result = result.filter(token => token.listing === null);
    }

    // Sort
    result.sort((a, b) => {
      switch (sortBy) {
        case 'newest':
          return (b.metadata?.mintedAt ?? 0) - (a.metadata?.mintedAt ?? 0);
        case 'oldest':
          return (a.metadata?.mintedAt ?? 0) - (b.metadata?.mintedAt ?? 0);
        case 'price-low':
          const priceA = a.listing?.price ?? Infinity;
          const priceB = b.listing?.price ?? Infinity;
          return priceA - priceB;
        case 'price-high':
          const priceHighA = a.listing?.price ?? 0;
          const priceHighB = b.listing?.price ?? 0;
          return priceHighB - priceHighA;
        case 'circle':
          return (a.metadata?.circleId ?? 0) - (b.metadata?.circleId ?? 0);
        default:
          return 0;
      }
    });

    return result;
  }, [tokens, searchQuery, sortBy, filterListed]);

  if (isLoading) {
    return (
      <div className="nft-gallery">
        <div className="nft-gallery-grid">
          {Array.from({ length: 8 }).map((_, i) => (
            <div key={i} className="nft-card-skeleton">
              <Skeleton variant="rectangular" height={200} />
              <div style={{ padding: '16px' }}>
                <Skeleton variant="text" width="60%" />
                <Skeleton variant="text" width="80%" />
                <Skeleton variant="text" width="40%" />
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (tokens.length === 0) {
    return (
      <EmptyState
        icon="🖼️"
        title="No NFTs Yet"
        description={emptyMessage}
      />
    );
  }

  return (
    <div className="nft-gallery">
      {showFilters && (
        <div className="nft-gallery-filters">
          <Input
            placeholder="Search by ID or Circle..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="search-input"
          />

          <Select
            value={sortBy}
            onChange={(e) => setSortBy(e.target.value as SortOption)}
            options={[
              { value: 'newest', label: 'Newest First' },
              { value: 'oldest', label: 'Oldest First' },
              { value: 'price-low', label: 'Price: Low to High' },
              { value: 'price-high', label: 'Price: High to Low' },
              { value: 'circle', label: 'By Circle' },
            ]}
          />

          <Select
            value={filterListed}
            onChange={(e) => setFilterListed(e.target.value as 'all' | 'listed' | 'unlisted')}
            options={[
              { value: 'all', label: 'All NFTs' },
              { value: 'listed', label: 'Listed Only' },
              { value: 'unlisted', label: 'Unlisted Only' },
            ]}
          />
        </div>
      )}

      <div className="nft-gallery-stats">
        <span>{filteredAndSortedTokens.length} NFTs</span>
        {filteredAndSortedTokens.filter(t => t.listing).length > 0 && (
          <span>{filteredAndSortedTokens.filter(t => t.listing).length} listed</span>
        )}
      </div>

      <div className="nft-gallery-grid">
        {filteredAndSortedTokens.map(token => (
          <NFTCard
            key={token.tokenId}
            token={token}
            isOwner={userAddress === token.owner}
            onBuy={onBuy}
            onList={onList}
            onUnlist={onUnlist}
          />
        ))}
      </div>
    </div>
  );
}

export default NFTGallery;
