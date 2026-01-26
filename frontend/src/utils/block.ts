/**
 * Block Height Utilities
 * 
 * Helper functions for Stacks blockchain block operations.
 */

// Average block time in seconds (~10 minutes for Stacks)
const AVG_BLOCK_TIME_SECONDS = 600;
const API_URL = 'https://api.mainnet.hiro.so';

// ===== Block Info =====

export interface BlockInfo {
  height: number;
  hash: string;
  time: number;
  txCount: number;
}

/**
 * Get current block height
 */
export async function getCurrentBlockHeight(): Promise<number> {
  try {
    const response = await fetch(`${API_URL}/v2/info`);
    if (!response.ok) throw new Error(`API error: ${response.status}`);
    const data = await response.json();
    return data.stacks_tip_height;
  } catch (error) {
    console.error('Failed to get block height:', error);
    throw error;
  }
}

/**
 * Get block info by height
 */
export async function getBlockInfo(height: number): Promise<BlockInfo | null> {
  try {
    const response = await fetch(`${API_URL}/extended/v1/block/by_height/${height}`);
    if (!response.ok) {
      if (response.status === 404) return null;
      throw new Error(`API error: ${response.status}`);
    }
    const data = await response.json();
    return {
      height: data.height,
      hash: data.hash,
      time: data.burn_block_time,
      txCount: data.txs?.length || 0,
    };
  } catch (error) {
    console.error('Failed to get block info:', error);
    return null;
  }
}

// ===== Time Calculations =====

/**
 * Estimate blocks until a future date
 */
export function estimateBlocksUntil(targetDate: Date): number {
  const msUntil = targetDate.getTime() - Date.now();
  if (msUntil <= 0) return 0;
  const secondsUntil = msUntil / 1000;
  return Math.ceil(secondsUntil / AVG_BLOCK_TIME_SECONDS);
}

/**
 * Estimate date from block count
 */
export function estimateDateFromBlocks(blocksFromNow: number): Date {
  const ms = blocksFromNow * AVG_BLOCK_TIME_SECONDS * 1000;
  return new Date(Date.now() + ms);
}

/**
 * Estimate date from target block height
 */
export function estimateDateFromBlockHeight(
  targetHeight: number,
  currentHeight: number
): Date {
  const blocks = targetHeight - currentHeight;
  return estimateDateFromBlocks(blocks);
}

/**
 * Convert duration to blocks
 */
export function daysToBlocks(days: number): number {
  const seconds = days * 24 * 60 * 60;
  return Math.ceil(seconds / AVG_BLOCK_TIME_SECONDS);
}

/**
 * Convert blocks to duration
 */
export function blocksToDays(blocks: number): number {
  const seconds = blocks * AVG_BLOCK_TIME_SECONDS;
  return seconds / (24 * 60 * 60);
}

/**
 * Convert blocks to hours
 */
export function blocksToHours(blocks: number): number {
  const seconds = blocks * AVG_BLOCK_TIME_SECONDS;
  return seconds / 3600;
}

// ===== Formatting =====

/**
 * Format blocks as human-readable time
 */
export function formatBlocksAsTime(blocks: number): string {
  if (blocks <= 0) return 'now';
  
  const hours = blocksToHours(blocks);
  const days = blocksToDays(blocks);
  
  if (hours < 1) return '< 1 hour';
  if (hours < 24) return `~${Math.round(hours)} hours`;
  if (days < 7) return `~${Math.round(days)} days`;
  if (days < 30) return `~${Math.round(days / 7)} weeks`;
  return `~${Math.round(days / 30)} months`;
}

/**
 * Format block height for display
 */
export function formatBlockHeight(height: number): string {
  return height.toLocaleString();
}

/**
 * Format block time ago
 */
export function formatBlockTimeAgo(blockTime: number): string {
  const now = Math.floor(Date.now() / 1000);
  const diff = now - blockTime;
  
  if (diff < 60) return 'just now';
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

// ===== Block Explorer =====

/**
 * Get explorer URL for block
 */
export function getBlockExplorerUrl(
  height: number,
  network: 'mainnet' | 'testnet' = 'mainnet'
): string {
  const base = 'https://explorer.stacks.co/block';
  const chain = network === 'testnet' ? '?chain=testnet' : '';
  return `${base}/${height}${chain}`;
}

// ===== Round Calculations =====

/**
 * Calculate end block for a circle round
 */
export function calculateRoundEndBlock(
  startBlock: number,
  roundDurationDays: number
): number {
  return startBlock + daysToBlocks(roundDurationDays);
}

/**
 * Check if round has ended
 */
export function isRoundEnded(endBlock: number, currentBlock: number): boolean {
  return currentBlock >= endBlock;
}

/**
 * Calculate blocks remaining in round
 */
export function blocksRemainingInRound(
  endBlock: number,
  currentBlock: number
): number {
  return Math.max(0, endBlock - currentBlock);
}

/**
 * Calculate round progress percentage
 */
export function calculateRoundBlockProgress(
  startBlock: number,
  endBlock: number,
  currentBlock: number
): number {
  if (currentBlock >= endBlock) return 100;
  if (currentBlock <= startBlock) return 0;
  
  const total = endBlock - startBlock;
  const elapsed = currentBlock - startBlock;
  return Math.round((elapsed / total) * 100);
}

// ===== Caching =====

let cachedBlockHeight: { height: number; timestamp: number } | null = null;
const CACHE_TTL = 60000; // 1 minute

/**
 * Get cached block height (reduces API calls)
 */
export async function getCachedBlockHeight(): Promise<number> {
  if (cachedBlockHeight && Date.now() - cachedBlockHeight.timestamp < CACHE_TTL) {
    return cachedBlockHeight.height;
  }
  
  const height = await getCurrentBlockHeight();
  cachedBlockHeight = { height, timestamp: Date.now() };
  return height;
}

/**
 * Clear block height cache
 */
export function clearBlockHeightCache(): void {
  cachedBlockHeight = null;
}
