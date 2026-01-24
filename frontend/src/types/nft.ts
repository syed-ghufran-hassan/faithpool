/**
 * NFT Type Definitions
 * Slot NFTs and marketplace
 */

export interface SlotNFT {
  tokenId: number;
  circleId: number;
  slot: number;
  originalOwner: string;
  currentOwner: string;
  mintedAt: number; // block height
  transfers: number;
  lastTransferBlock: number;
}

export interface NFTListing {
  tokenId: number;
  seller: string;
  price: number; // microSTX
  listedAt: number; // block height
  expiresAt: number; // block height
  isActive: boolean;
}

export interface NFTOffer {
  tokenId: number;
  offerer: string;
  amount: number; // microSTX
  offeredAt: number; // block height
  expiresAt: number; // block height
  accepted: boolean;
}

export interface NFTTransferHistory {
  tokenId: number;
  from: string;
  to: string;
  price: number; // microSTX (0 if gift/transfer)
  block: number;
  txId: string;
}

// Marketplace constants
export const MARKETPLACE_FEE_BPS = 250; // 2.5%
export const MIN_LISTING_PRICE = 100000; // 0.1 STX
export const DEFAULT_LISTING_DURATION_BLOCKS = 1440; // ~10 days

/**
 * Calculate marketplace fee
 */
export function calculateMarketplaceFee(priceMicroSTX: number): number {
  return Math.floor((priceMicroSTX * MARKETPLACE_FEE_BPS) / 10000);
}

/**
 * Calculate seller proceeds after fee
 */
export function calculateSellerProceeds(priceMicroSTX: number): number {
  return priceMicroSTX - calculateMarketplaceFee(priceMicroSTX);
}

/**
 * Generate NFT metadata URI
 */
export function getNFTMetadataUri(tokenId: number): string {
  return `https://api.stacksusu.xyz/nft/${tokenId}/metadata`;
}

/**
 * Generate NFT image URI
 */
export function getNFTImageUri(tokenId: number): string {
  return `https://api.stacksusu.xyz/nft/${tokenId}/image`;
}

/**
 * Check if listing is expired
 */
export function isListingExpired(listing: NFTListing, currentBlock: number): boolean {
  return currentBlock > listing.expiresAt;
}

/**
 * Check if offer is expired
 */
export function isOfferExpired(offer: NFTOffer, currentBlock: number): boolean {
  return currentBlock > offer.expiresAt;
}

/**
 * Format NFT name
 */
export function formatNFTName(circleId: number, slot: number): string {
  return `Circle #${circleId} - Slot #${slot}`;
}

/**
 * Get rarity based on slot position
 */
export function getSlotRarity(slot: number, maxSlots: number): string {
  const position = slot / maxSlots;
  if (position <= 0.1) return 'Legendary'; // First 10%
  if (position <= 0.3) return 'Rare'; // Next 20%
  if (position <= 0.6) return 'Uncommon'; // Next 30%
  return 'Common'; // Last 40%
}

/**
 * Get rarity color
 */
export function getRarityColor(rarity: string): string {
  const colors: Record<string, string> = {
    Legendary: '#fbbf24', // gold
    Rare: '#a855f7', // purple
    Uncommon: '#22c55e', // green
    Common: '#6b7280', // gray
  };
  return colors[rarity] || '#6b7280';
}
