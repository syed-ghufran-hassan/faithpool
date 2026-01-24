/**
 * Circle Service
 * 
 * Handles all circle-related blockchain operations including:
 * - Fetching circle data from contracts
 * - Parsing Clarity values
 * - Circle status calculations
 * 
 * @module services/circles
 */

import { CONTRACTS, TIME } from '../config/constants';
import { callContractReadOnly, getCurrentBlockHeight } from './stacks';
import type { Circle, CircleInfo, CircleStatus } from '../types';

// ============================================================
// Clarity Value Parsers
// ============================================================

/**
 * Parse unsigned integer from Clarity hex
 * @param hex - Clarity hex-encoded uint
 */
function parseUint(hex: string): number {
  if (!hex || !hex.startsWith('0x01')) return 0;
  return parseInt(hex.slice(2 + 32), 16);
}

/**
 * Parse boolean from Clarity hex
 * @param hex - Clarity hex-encoded bool
 */
function parseBool(hex: string): boolean {
  return hex === '0x03'; // true = 0x03, false = 0x04
}

/**
 * Parse ASCII string from Clarity hex
 * @param hex - Clarity hex-encoded string-ascii
 */
function _parseString(hex: string): string {
  if (!hex || !hex.startsWith('0x0d')) return '';
  const lengthHex = hex.slice(4, 12);
  const length = parseInt(lengthHex, 16);
  const dataHex = hex.slice(12, 12 + length * 2);
  
  let result = '';
  for (let i = 0; i < dataHex.length; i += 2) {
    result += String.fromCharCode(parseInt(dataHex.slice(i, i + 2), 16));
  }
  return result;
}
// Reserved for full contract parsing
void _parseString;

/**
 * Parse principal from Clarity hex (simplified)
 * @param hex - Clarity hex-encoded principal
 */
function parsePrincipal(hex: string): string {
  if (!hex || !hex.startsWith('0x05')) return '';
  const version = parseInt(hex.slice(4, 6), 16);
  const hash = hex.slice(6, 46);
  const prefix = version === 22 ? 'SP' : 'ST';
  return `${prefix}${hash.slice(0, 30).toUpperCase()}...`;
}

/**
 * Parse circle info tuple from contract response
 * @param _resultHex - Clarity hex-encoded tuple (unused in simplified version)
 */
function parseCircleInfo(_resultHex: string): CircleInfo | null {
  try {
    // Simplified parser - production would use @stacks/transactions cvToJSON
    return null;
  } catch (error) {
    console.error('Failed to parse circle info:', error);
    return null;
  }
}

// ============================================================
// Circle Data Fetching
// ============================================================

/**
 * Get total number of circles created
 */
export async function getCircleCount(): Promise<number> {
  try {
    const result = await callContractReadOnly(CONTRACTS.CORE, 'get-circle-count');
    if (result.okay && result.result) {
      return parseUint(result.result);
    }
    return 0;
  } catch (error) {
    console.error('Failed to get circle count:', error);
    return 0;
  }
}

// Get circle info by ID
export async function getCircleInfo(circleId: number): Promise<CircleInfo | null> {
  try {
    // Convert circleId to Clarity uint hex
    const uintHex = '0x01' + circleId.toString(16).padStart(32, '0');
    
    const result = await callContractReadOnly(
      CONTRACTS.CORE,
      'get-circle-info',
      [uintHex]
    );
    
    if (result.okay && result.result) {
      // Parse the response tuple
      return parseCircleInfo(result.result);
    }
    return null;
  } catch (error) {
    console.error(`Failed to get circle ${circleId}:`, error);
    return null;
  }
}

// Check if an address is a member of a circle
export async function isMember(circleId: number, address: string): Promise<boolean> {
  try {
    const uintHex = '0x01' + circleId.toString(16).padStart(32, '0');
    const principalHex = `0x0516${address}`; // Simplified - need proper encoding
    
    const result = await callContractReadOnly(
      CONTRACTS.CORE,
      'is-member',
      [uintHex, principalHex]
    );
    
    if (result.okay && result.result) {
      return parseBool(result.result);
    }
    return false;
  } catch (error) {
    console.error('Failed to check membership:', error);
    return false;
  }
}

// Get member info
export async function getMemberInfo(circleId: number, address: string) {
  try {
    const uintHex = '0x01' + circleId.toString(16).padStart(32, '0');
    const principalHex = `0x0516${address}`;
    
    const result = await callContractReadOnly(
      CONTRACTS.CORE,
      'get-member-info',
      [uintHex, principalHex]
    );
    
    return result.okay ? result.result : null;
  } catch (error) {
    console.error('Failed to get member info:', error);
    return null;
  }
}

// Get member at slot position
export async function getMemberAtSlot(circleId: number, slot: number): Promise<string | null> {
  try {
    const circleHex = '0x01' + circleId.toString(16).padStart(32, '0');
    const slotHex = '0x01' + slot.toString(16).padStart(32, '0');
    
    const result = await callContractReadOnly(
      CONTRACTS.CORE,
      'get-member-at-slot',
      [circleHex, slotHex]
    );
    
    if (result.okay && result.result) {
      return parsePrincipal(result.result);
    }
    return null;
  } catch (error) {
    console.error('Failed to get member at slot:', error);
    return null;
  }
}

// Calculate time until next payout
export async function getTimeUntilNextPayout(circleId: number): Promise<string> {
  try {
    const circleInfo = await getCircleInfo(circleId);
    if (!circleInfo) return 'Unknown';
    
    const currentBlock = await getCurrentBlockHeight();
    // Next payout block would come from circle info
    // For now return placeholder - calculation uses currentBlock and circleInfo.payoutInterval
    void currentBlock;
    return 'Calculating...';
  } catch (error) {
    return 'Unknown';
  }
}

// Get all circles (paginated)
export async function getAllCircles(page = 1, pageSize = 10): Promise<Circle[]> {
  try {
    const count = await getCircleCount();
    const startId = (page - 1) * pageSize + 1;
    const endId = Math.min(startId + pageSize - 1, count);
    
    const circles: Circle[] = [];
    
    for (let id = startId; id <= endId; id++) {
      const info = await getCircleInfo(id);
      if (info) {
        // Map status string to CircleStatus
        let statusValue: CircleStatus = 'forming';
        if (info.status === 'active' || info.status === '1') statusValue = 'active';
        else if (info.status === 'completed' || info.status === '2') statusValue = 'completed';
        else if (info.status === 'cancelled') statusValue = 'cancelled';
        
        circles.push({
          id,
          name: info.name,
          creator: info.creator,
          contribution: info.contribution,
          frequency: 'monthly', // Default - would calculate from payoutInterval
          maxMembers: info.maxMembers,
          currentMembers: info.memberCount,
          currentRound: info.currentRound,
          totalRounds: info.maxMembers,
          status: statusValue,
          createdAt: new Date().toISOString(),
        });
      }
    }
    
    return circles;
  } catch (error) {
    console.error('Failed to get all circles:', error);
    return [];
  }
}

// Get circles where user is a member
export async function getUserCircles(address: string): Promise<Circle[]> {
  try {
    const count = await getCircleCount();
    const userCircles: Circle[] = [];
    
    // Check each circle for membership (not efficient - would use indexer in production)
    for (let id = 1; id <= count; id++) {
      const member = await isMember(id, address);
      if (member) {
        const info = await getCircleInfo(id);
        if (info) {
          // Map status string to CircleStatus
          let statusValue: CircleStatus = 'forming';
          if (info.status === 'active' || info.status === '1') statusValue = 'active';
          else if (info.status === 'completed' || info.status === '2') statusValue = 'completed';
          else if (info.status === 'cancelled') statusValue = 'cancelled';
          
          userCircles.push({
            id,
            name: info.name,
            creator: info.creator,
            contribution: info.contribution,
            frequency: 'monthly', // Default
            maxMembers: info.maxMembers,
            currentMembers: info.memberCount,
            currentRound: info.currentRound,
            totalRounds: info.maxMembers,
            status: statusValue,
            createdAt: new Date().toISOString(),
          });
        }
      }
    }
    
    return userCircles;
  } catch (error) {
    console.error('Failed to get user circles:', error);
    return [];
  }
}

// Get circles with open slots
export async function getOpenCircles(): Promise<Circle[]> {
  try {
    const allCircles = await getAllCircles(1, 100);
    return allCircles.filter(
      circle => circle.status === 'forming' && 
                circle.currentMembers < circle.maxMembers
    );
  } catch (error) {
    console.error('Failed to get open circles:', error);
    return [];
  }
}

// Get active circles
export async function getActiveCircles(): Promise<Circle[]> {
  try {
    const allCircles = await getAllCircles(1, 100);
    return allCircles.filter(circle => circle.status === 'active');
  } catch (error) {
    console.error('Failed to get active circles:', error);
    return [];
  }
}

// Format contribution amount
export function formatContribution(microSTX: number): string {
  const stx = microSTX / 1_000_000;
  return stx.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 6 });
}

// Format payout interval
export function formatPayoutInterval(blocks: number): string {
  const days = Math.round(blocks / TIME.BLOCKS_PER_DAY);
  if (days === 1) return '1 day';
  if (days === 7) return '1 week';
  if (days === 14) return '2 weeks';
  if (days === 30) return '1 month';
  return `${days} days`;
}
