// NFT Gallery Component - Grid display of NFTs

import { useState, useMemo, useCallback, memo, forwardRef } from 'react';
import { Search, Image, ArrowUpDown, Filter } from 'lucide-react';
import clsx from 'clsx';
import { NFTCard } from './NFTCard';
import { Input } from './Input';
import { Select } from './Select';
import { EmptyState } from './EmptyState';
import { Skeleton } from './Skeleton';
import type { NFTToken } from '../types/blockchain';
import './NFTGallery.css';

export type SortOption = 'newest' | 'oldest' | 'price-low' | 'price-high' | 'circle';
export type FilterOption = 'all' | 'listed' | 'unlisted';

export interface NFTGalleryProps {
  tokens: NFTToken[];
  isLoading?: boolean;
  userAddress?: string | null;
  onBuy?: (tokenId: number) => void;
  onList?: (tokenId: number) => void;
  onUnlist?: (tokenId: number) => void;
  emptyMessage?: string;
  showFilters?: boolean;
  columns?: 2 | 3 | 4;
  className?: string;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Newest First' },
  { value: 'oldest', label: 'Oldest First' },
  { value: 'price-low', label: 'Price: Low to High' },
  { value: 'price-high', label: 'Price: High to Low' },
  { value: 'circle', label: 'By Circle' },
] as const;

const FILTER_OPTIONS = [
  { value: 'all', label: 'All NFTs' },
  { value: 'listed', label: 'Listed Only' },
  { value: 'unlisted', label: 'Unlisted Only' },
] as const;

const SKELETON_COUNT = 8;

export const NFTGallery = memo(forwardRef<HTMLDivElement, NFTGalleryProps>(
  function NFTGallery(
    {
      tokens,
      isLoading = false,
      userAddress,
      onBuy,
      onList,
      onUnlist,
      emptyMessage = 'No NFTs found',
      showFilters = true,
      columns,
      className,
    },
    ref
  ) {
    const [searchQuery, setSearchQuery] = useState('');
    const [sortBy, setSortBy] = useState<SortOption>('newest');
    const [filterListed, setFilterListed] = useState<FilterOption>('all');

    const handleSearchChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
      setSearchQuery(e.target.value);
    }, []);

    const handleSortChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      setSortBy(e.target.value as SortOption);
    }, []);

    const handleFilterChange = useCallback((e: React.ChangeEvent<HTMLSelectElement>) => {
      setFilterListed(e.target.value as FilterOption);
    }, []);

    const filteredAndSortedTokens = useMemo(() => {
      let result = [...tokens];

      // Filter by search
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        result = result.filter(
          (token) =>
            token.tokenId.toString().includes(query) ||
            token.metadata?.circleId?.toString().includes(query)
        );
      }

      // Filter by listing status
      if (filterListed === 'listed') {
        result = result.filter((token) => token.listing !== null);
      } else if (filterListed === 'unlisted') {
        result = result.filter((token) => token.listing === null);
      }

      // Sort
      result.sort((a, b) => {
        switch (sortBy) {
          case 'newest':
            return (b.metadata?.mintedAt ?? 0) - (a.metadata?.mintedAt ?? 0);
          case 'oldest':
            return (a.metadata?.mintedAt ?? 0) - (b.metadata?.mintedAt ?? 0);
          case 'price-low': {
            const priceA = a.listing?.price ?? Infinity;
            const priceB = b.listing?.price ?? Infinity;
            return priceA - priceB;
          }
          case 'price-high': {
            const priceHighA = a.listing?.price ?? 0;
            const priceHighB = b.listing?.price ?? 0;
            return priceHighB - priceHighA;
          }
          case 'circle':
            return (a.metadata?.circleId ?? 0) - (b.metadata?.circleId ?? 0);
          default:
            return 0;
        }
      });

      return result;
    }, [tokens, searchQuery, sortBy, filterListed]);

    const listedCount = useMemo(
      () => filteredAndSortedTokens.filter((t) => t.listing).length,
      [filteredAndSortedTokens]
    );

    if (isLoading) {
      return (
        <div ref={ref} className={clsx('nft-gallery', className)}>
          <div className="nft-gallery__grid">
            {Array.from({ length: SKELETON_COUNT }).map((_, i) => (
              <div key={i} className="nft-gallery__skeleton">
                <Skeleton variant="rectangular" height={200} />
                <div className="nft-gallery__skeleton-content">
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
          icon={<Image size={48} />}
          title="No NFTs Yet"
          description={emptyMessage}
        />
      );
    }

    return (
      <div
        ref={ref}
        className={clsx('nft-gallery', columns && `nft-gallery--cols-${columns}`, className)}
      >
        {showFilters && (
          <div className="nft-gallery__filters">
            <div className="nft-gallery__search-wrapper">
              <Search size={18} className="nft-gallery__search-icon" />
              <Input
                placeholder="Search by ID or Circle..."
                value={searchQuery}
                onChange={handleSearchChange}
                className="nft-gallery__search"
              />
            </div>

            <div className="nft-gallery__select-wrapper">
              <ArrowUpDown size={16} className="nft-gallery__select-icon" />
              <Select value={sortBy} onChange={handleSortChange} options={SORT_OPTIONS} />
            </div>

            <div className="nft-gallery__select-wrapper">
              <Filter size={16} className="nft-gallery__select-icon" />
              <Select value={filterListed} onChange={handleFilterChange} options={FILTER_OPTIONS} />
            </div>
          </div>
        )}

        <div className="nft-gallery__stats">
          <span className="nft-gallery__stat">{filteredAndSortedTokens.length} NFTs</span>
          {listedCount > 0 && (
            <span className="nft-gallery__stat nft-gallery__stat--listed">
              {listedCount} listed
            </span>
          )}
        </div>

        <div className="nft-gallery__grid">
          {filteredAndSortedTokens.map((token) => (
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
));

export default NFTGallery;
