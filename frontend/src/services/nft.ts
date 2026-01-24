/**
 * NFT Service
 * 
 * Handles NFT badge queries and marketplace operations:
 * - Token ownership and metadata
 * - Marketplace listings
 * - Minting and transfers
 * 
 * @module services/nft
 */

import { CONTRACTS } from '../config/constants';
import { stacksFetchApi, callReadOnlyFunction } from './stacks';
import type { NFTToken, NFTListing, NFTMetadata } from '../types/blockchain';

// ============================================================
// Clarity Value Parsers
// ============================================================

/**
 * Parse Clarity uint response to number
 */
function parseUint(response: unknown): number {
  if (!response) return 0;
  const resp = response as Record<string, unknown>;
  if (resp['type'] === 'uint' || resp['type'] === 1) {
    return parseInt(resp['value'] as string, 10);
  }
  return 0;
}

/**
 * Parse Clarity bool response (kept for potential future use)
 */
function _parseBool(response: unknown): boolean {
  if (!response) return false;
  const resp = response as Record<string, unknown>;
  if (resp['type'] === 'bool' || resp['type'] === 3) {
    return resp['value'] === true || resp['value'] === 'true';
  }
  return false;
}
void _parseBool;

/**
 * Parse Clarity principal response
 */
function parsePrincipal(response: unknown): string | null {
  if (!response) return null;
  const resp = response as Record<string, unknown>;
  if (resp['type'] === 'principal' || resp['type'] === 5) {
    return resp['value'] as string;
  }
  return null;
}

/**
 * Parse Clarity optional response
 */
function parseOptional<T>(response: unknown, parser: (v: unknown) => T): T | null {
  if (!response) return null;
  const resp = response as Record<string, unknown>;
  if (resp['type'] === 'none' || resp['type'] === 9) return null;
  if (resp['type'] === 'some' || resp['type'] === 10) {
    return parser(resp['value']);
  }
  return null;
}

// ============================================================
// NFT Queries
// ============================================================

/**
 * Get owner of an NFT token
 * @param tokenId - Token ID
 * @returns Owner address or null if not found
 */
export async function getNFTOwner(tokenId: number): Promise<string | null> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.NFT,
      'get-owner',
      [{ type: 'uint', value: tokenId.toString() }]
    );
    
    return parseOptional(response, parsePrincipal);
  } catch (error) {
    console.error('Failed to get NFT owner:', error);
    return null;
  }
}

/**
 * Get token URI for an NFT
 * @param tokenId - Token ID
 * @returns Token URI or null if not found
 */
export async function getNFTTokenUri(tokenId: number): Promise<string | null> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.NFT,
      'get-token-uri',
      [{ type: 'uint', value: tokenId.toString() }]
    );
    
    return parseOptional(response, (v) => {
      const val = v as Record<string, unknown>;
      return (val['value'] as string) || String(v);
    });
  } catch (error) {
    console.error('Failed to get NFT token URI:', error);
    return null;
  }
}

// Get NFT metadata
export async function getNFTMetadata(tokenId: number): Promise<NFTMetadata | null> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.NFT,
      'get-nft-metadata',
      [{ type: 'uint', value: tokenId.toString() }]
    ) as unknown as Record<string, unknown>;
    
    if (!response || response['type'] === 'none') return null;
    
    const data = (response['type'] === 'some' ? response['value'] : response) as Record<string, unknown>;
    const slotNumber = parseUint(data['slot-number']);
    
    return {
      tokenId,
      circleId: parseUint(data['circle-id']),
      slot: slotNumber,
      slotNumber,
      mintedAt: parseUint(data['minted-at']),
      mintedBy: parsePrincipal(data['minted-by']) || '',
      completedRounds: parseUint(data['completed-rounds']),
    };
  } catch (error) {
    console.error('Failed to get NFT metadata:', error);
    return null;
  }
}

// Check if NFT is listed for sale
export async function getNFTListing(tokenId: number): Promise<NFTListing | null> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.NFT,
      'get-listing',
      [{ type: 'uint', value: tokenId.toString() }]
    ) as unknown as Record<string, unknown>;
    
    if (!response || response['type'] === 'none') return null;
    
    const data = (response['type'] === 'some' ? response['value'] : response) as Record<string, unknown>;
    
    return {
      tokenId,
      seller: parsePrincipal(data['seller']) || '',
      price: parseUint(data['price']) / 1_000_000,
      listedAt: parseUint(data['listed-at']),
    };
  } catch (error) {
    console.error('Failed to get NFT listing:', error);
    return null;
  }
}

// Get total supply of NFTs
export async function getNFTTotalSupply(): Promise<number> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.NFT,
      'get-last-token-id',
      []
    );
    
    return parseUint(response);
  } catch (error) {
    console.error('Failed to get NFT total supply:', error);
    return 0;
  }
}

// Get user's NFT balance
export async function getUserNFTBalance(userAddress: string): Promise<number> {
  try {
    const response = await callReadOnlyFunction(
      CONTRACTS.NFT,
      'get-balance',
      [{ type: 'principal', value: userAddress }]
    );
    
    return parseUint(response);
  } catch (error) {
    console.error('Failed to get user NFT balance:', error);
    return 0;
  }
}

// Get all NFTs owned by a user
export async function getUserNFTs(userAddress: string): Promise<NFTToken[]> {
  try {
    // Fetch from Hiro API for SIP-009 tokens
    const [address, name] = CONTRACTS.NFT.split('.');
    const response = await stacksFetchApi<{ results: Array<{ value?: { repr?: string } }> }>(
      `/extended/v1/tokens/nft/holdings?principal=${userAddress}&asset_identifiers=${address}.${name}::stacksusu-slot`
    );
    
    const tokens: NFTToken[] = [];
    
    if (response.results) {
      for (const holding of response.results) {
        const tokenId = parseInt(holding.value?.repr?.replace('u', '') || '0');
        const metadata = await getNFTMetadata(tokenId);
        const listing = await getNFTListing(tokenId);
        
        tokens.push({
          tokenId,
          owner: userAddress,
          metadata,
          listing,
        });
      }
    }
    
    return tokens;
  } catch (error) {
    console.error('Failed to get user NFTs:', error);
    return [];
  }
}

// Get all listed NFTs (marketplace)
export async function getMarketplaceListings(limit: number = 50): Promise<NFTToken[]> {
  try {
    // This would ideally use an indexer
    // For now, scan recent token IDs
    const totalSupply = await getNFTTotalSupply();
    const listings: NFTToken[] = [];
    
    const startId = Math.max(1, totalSupply - limit);
    
    for (let tokenId = startId; tokenId <= totalSupply; tokenId++) {
      const listing = await getNFTListing(tokenId);
      if (listing) {
        const metadata = await getNFTMetadata(tokenId);
        const owner = await getNFTOwner(tokenId);
        
        listings.push({
          tokenId,
          owner: owner || listing.seller,
          metadata,
          listing,
        });
      }
    }
    
    return listings;
  } catch (error) {
    console.error('Failed to get marketplace listings:', error);
    return [];
  }
}

// Check if NFT can be transferred
export async function canTransferNFT(tokenId: number, sender: string): Promise<boolean> {
  const owner = await getNFTOwner(tokenId);
  return owner === sender;
}

// Get floor price for circle NFTs
export async function getCircleFloorPrice(circleId: number): Promise<number | null> {
  try {
    const totalSupply = await getNFTTotalSupply();
    let floorPrice: number | null = null;
    
    for (let tokenId = 1; tokenId <= totalSupply; tokenId++) {
      const metadata = await getNFTMetadata(tokenId);
      if (metadata?.circleId === circleId) {
        const listing = await getNFTListing(tokenId);
        if (listing) {
          if (floorPrice === null || listing.price < floorPrice) {
            floorPrice = listing.price;
          }
        }
      }
    }
    
    return floorPrice;
  } catch (error) {
    console.error('Failed to get floor price:', error);
    return null;
  }
}

// Generate NFT image placeholder
export function generateNFTImage(metadata: NFTMetadata | null): string {
  if (!metadata) {
    return '/nft-placeholder.png';
  }
  
  // Generate a deterministic color based on circle ID
  const hue = (metadata.circleId * 137) % 360;
  const slotNum = metadata['slotNumber'] ?? metadata.slot ?? 0;
  const rounds = metadata['completedRounds'] ?? 0;
  const svg = `
    <svg xmlns="http://www.w3.org/2000/svg" width="400" height="400" viewBox="0 0 400 400">
      <defs>
        <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" style="stop-color:hsl(${hue}, 70%, 50%)" />
          <stop offset="100%" style="stop-color:hsl(${(hue + 60) % 360}, 70%, 50%)" />
        </linearGradient>
      </defs>
      <rect width="400" height="400" fill="url(#grad)" />
      <circle cx="200" cy="160" r="80" fill="rgba(255,255,255,0.2)" />
      <text x="200" y="170" text-anchor="middle" fill="white" font-size="48" font-weight="bold">
        #${slotNum}
      </text>
      <text x="200" y="280" text-anchor="middle" fill="white" font-size="24">
        Circle ${metadata.circleId}
      </text>
      <text x="200" y="320" text-anchor="middle" fill="rgba(255,255,255,0.7)" font-size="16">
        ${rounds} rounds completed
      </text>
    </svg>
  `;
  
  return `data:image/svg+xml,${encodeURIComponent(svg)}`;
}

// Format NFT for display
export function formatNFTDisplay(token: NFTToken): {
  title: string;
  description: string;
  image: string;
  attributes: { trait: string; value: string }[];
} {
  const meta = token.metadata ?? null;
  return {
    title: `StackSUSU Slot #${token.tokenId}`,
    description: meta 
      ? `Slot ${meta['slotNumber']} in Circle ${meta.circleId}`
      : 'StackSUSU Membership Slot',
    image: generateNFTImage(meta),
    attributes: [
      { trait: 'Circle ID', value: meta?.circleId?.toString() || 'Unknown' },
      { trait: 'Slot Number', value: meta?.['slotNumber']?.toString() || 'Unknown' },
      { trait: 'Completed Rounds', value: meta?.['completedRounds']?.toString() || '0' },
    ],
  };
}
