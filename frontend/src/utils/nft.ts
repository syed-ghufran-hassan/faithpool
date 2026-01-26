/**
 * NFT-related utility functions for StackSUSU
 */

import { microStxToStx } from './stx';

export interface NFTMetadata {
  id: number;
  circleId: number;
  owner: string;
  mintedAt: number;
  circleName: string;
  contributionAmount: number;
  roundsCompleted: number;
  tier: string;
}

export interface NFTListing {
  nftId: number;
  seller: string;
  price: number;
  listedAt: number;
}

/**
 * Generate NFT image URL based on tier and attributes
 */
export function getNFTImageUrl(tier: string, circleId: number): string {
  const tierColors: Record<string, string> = {
    Bronze: 'cd7f32',
    Silver: 'c0c0c0',
    Gold: 'ffd700',
    Platinum: 'e5e4e2',
    Diamond: '00ffff',
  };
  
  const color = tierColors[tier] || 'f97316';
  // Using placeholder for NFT images
  return `https://via.placeholder.com/400x400/${color}/ffffff?text=${tier}+NFT+%23${circleId}`;
}

/**
 * Get NFT rarity based on tier
 */
export function getNFTRarity(tier: string): {
  name: string;
  level: number;
  color: string;
} {
  const rarities: Record<string, { name: string; level: number; color: string }> = {
    Bronze: { name: 'Common', level: 1, color: '#cd7f32' },
    Silver: { name: 'Uncommon', level: 2, color: '#c0c0c0' },
    Gold: { name: 'Rare', level: 3, color: '#ffd700' },
    Platinum: { name: 'Epic', level: 4, color: '#e5e4e2' },
    Diamond: { name: 'Legendary', level: 5, color: '#00ffff' },
  };
  
  return rarities[tier] || { name: 'Common', level: 1, color: '#cd7f32' };
}

/**
 * Calculate NFT score based on attributes
 */
export function calculateNFTScore(nft: NFTMetadata): number {
  let score = 0;
  
  // Base score from tier
  const tierScores: Record<string, number> = {
    Bronze: 100,
    Silver: 200,
    Gold: 400,
    Platinum: 800,
    Diamond: 1600,
  };
  score += tierScores[nft.tier] || 100;
  
  // Bonus for contribution amount
  const stxAmount = microStxToStx(nft.contributionAmount);
  score += Math.floor(stxAmount * 10);
  
  // Bonus for rounds completed
  score += nft.roundsCompleted * 50;
  
  return score;
}

/**
 * Format NFT price for display
 */
export function formatNFTPrice(microStx: number): string {
  const stx = microStxToStx(microStx);
  if (stx >= 1000000) {
    return `${(stx / 1000000).toFixed(2)}M STX`;
  }
  if (stx >= 1000) {
    return `${(stx / 1000).toFixed(2)}K STX`;
  }
  return `${stx.toFixed(2)} STX`;
}

/**
 * Generate NFT metadata URI
 */
export function generateNFTMetadataUri(nft: NFTMetadata): string {
  const metadata = {
    name: `StackSUSU Completion #${nft.id}`,
    description: `Proof of completing savings circle "${nft.circleName}"`,
    image: getNFTImageUrl(nft.tier, nft.circleId),
    attributes: [
      { trait_type: 'Circle ID', value: nft.circleId },
      { trait_type: 'Tier', value: nft.tier },
      { trait_type: 'Rounds Completed', value: nft.roundsCompleted },
      { trait_type: 'Contribution', value: `${microStxToStx(nft.contributionAmount)} STX` },
    ],
  };
  
  return `data:application/json;base64,${btoa(JSON.stringify(metadata))}`;
}

/**
 * Check if NFT is listed for sale
 */
export function isNFTListed(listings: NFTListing[], nftId: number): boolean {
  return listings.some(l => l.nftId === nftId);
}

/**
 * Get NFT listing details
 */
export function getNFTListing(listings: NFTListing[], nftId: number): NFTListing | null {
  return listings.find(l => l.nftId === nftId) || null;
}

/**
 * Sort NFTs by various criteria
 */
export function sortNFTs(
  nfts: NFTMetadata[],
  sortBy: 'id' | 'tier' | 'score' | 'minted' = 'id',
  direction: 'asc' | 'desc' = 'desc'
): NFTMetadata[] {
  const tierOrder = ['Diamond', 'Platinum', 'Gold', 'Silver', 'Bronze'];
  
  const sorted = [...nfts].sort((a, b) => {
    let comparison = 0;
    
    switch (sortBy) {
      case 'id':
        comparison = a.id - b.id;
        break;
      case 'tier':
        comparison = tierOrder.indexOf(a.tier) - tierOrder.indexOf(b.tier);
        break;
      case 'score':
        comparison = calculateNFTScore(a) - calculateNFTScore(b);
        break;
      case 'minted':
        comparison = a.mintedAt - b.mintedAt;
        break;
    }
    
    return direction === 'asc' ? comparison : -comparison;
  });
  
  return sorted;
}

/**
 * Filter NFTs by tier
 */
export function filterNFTsByTier(nfts: NFTMetadata[], tier: string | 'all'): NFTMetadata[] {
  if (tier === 'all') return nfts;
  return nfts.filter(nft => nft.tier === tier);
}

/**
 * Get NFT floor price from listings
 */
export function getFloorPrice(listings: NFTListing[]): number {
  if (listings.length === 0) return 0;
  return Math.min(...listings.map(l => l.price));
}

/**
 * Get total NFT volume from listings
 */
export function getTotalVolume(listings: NFTListing[]): number {
  return listings.reduce((sum, l) => sum + l.price, 0);
}
