/**
 * Crypto Utilities
 * 
 * Cryptographic helper functions for hashing, encoding, and
 * blockchain-related operations in the StackSUSU application.
 * 
 * @module utils/crypto
 */

// =============================================================================
// Types
// =============================================================================

export interface HashOptions {
  algorithm?: 'SHA-256' | 'SHA-384' | 'SHA-512';
  encoding?: 'hex' | 'base64';
}

// =============================================================================
// Hashing Functions
// =============================================================================

/**
 * Hash a string using Web Crypto API
 * 
 * @param data - String to hash
 * @param options - Hash options
 * @returns Hashed string
 * 
 * @example
 * ```typescript
 * const hash = await hashString('my-data');
 * // Returns hex-encoded SHA-256 hash
 * ```
 */
export async function hashString(
  data: string,
  options: HashOptions = {}
): Promise<string> {
  const { algorithm = 'SHA-256', encoding = 'hex' } = options;
  
  const encoder = new TextEncoder();
  const dataBuffer = encoder.encode(data);
  
  const hashBuffer = await crypto.subtle.digest(algorithm, dataBuffer);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  
  if (encoding === 'base64') {
    return btoa(String.fromCharCode(...hashArray));
  }
  
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

/**
 * Hash data synchronously using simple algorithm (for non-critical use)
 * 
 * @param data - String to hash
 * @returns Simple hash string
 */
export function simpleHash(data: string): string {
  let hash = 0;
  for (let i = 0; i < data.length; i++) {
    const char = data.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0');
}

/**
 * Generate a unique identifier
 * 
 * @param prefix - Optional prefix for the ID
 * @returns Unique string identifier
 */
export function generateId(prefix?: string): string {
  const timestamp = Date.now().toString(36);
  const randomPart = Math.random().toString(36).substring(2, 9);
  const id = `${timestamp}${randomPart}`;
  return prefix ? `${prefix}_${id}` : id;
}

/**
 * Generate a cryptographically secure random string
 * 
 * @param length - Length of the random string
 * @param charset - Character set to use
 * @returns Random string
 */
export function generateSecureRandom(
  length: number = 32,
  charset: string = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
): string {
  const randomValues = new Uint32Array(length);
  crypto.getRandomValues(randomValues);
  
  return Array.from(randomValues)
    .map(v => charset[v % charset.length])
    .join('');
}

/**
 * Generate a UUID v4
 * 
 * @returns UUID string
 */
export function generateUUID(): string {
  if (typeof crypto !== 'undefined' && crypto.randomUUID) {
    return crypto.randomUUID();
  }
  
  // Fallback for older browsers
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}

// =============================================================================
// Encoding Functions
// =============================================================================

/**
 * Encode string to hex
 * 
 * @param str - String to encode
 * @returns Hex-encoded string
 */
export function stringToHex(str: string): string {
  return Array.from(str)
    .map(c => c.charCodeAt(0).toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Decode hex to string
 * 
 * @param hex - Hex string to decode
 * @returns Decoded string
 */
export function hexToString(hex: string): string {
  const bytes: number[] = [];
  for (let i = 0; i < hex.length; i += 2) {
    bytes.push(parseInt(hex.substr(i, 2), 16));
  }
  return String.fromCharCode(...bytes);
}

/**
 * Encode string to Base64
 * 
 * @param str - String to encode
 * @returns Base64-encoded string
 */
export function stringToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

/**
 * Decode Base64 to string
 * 
 * @param base64 - Base64 string to decode
 * @returns Decoded string
 */
export function base64ToString(base64: string): string {
  return decodeURIComponent(escape(atob(base64)));
}

/**
 * Convert bytes to hex string
 * 
 * @param bytes - Byte array
 * @returns Hex string
 */
export function bytesToHex(bytes: Uint8Array): string {
  return Array.from(bytes)
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

/**
 * Convert hex string to bytes
 * 
 * @param hex - Hex string
 * @returns Byte array
 */
export function hexToBytes(hex: string): Uint8Array {
  const cleanHex = hex.startsWith('0x') ? hex.slice(2) : hex;
  const bytes = new Uint8Array(cleanHex.length / 2);
  for (let i = 0; i < cleanHex.length; i += 2) {
    bytes[i / 2] = parseInt(cleanHex.substr(i, 2), 16);
  }
  return bytes;
}

// =============================================================================
// Address Utilities
// =============================================================================

/**
 * Checksum a Stacks address for display validation
 * 
 * @param address - Stacks address
 * @returns Whether the address has valid format
 */
export function isValidStacksAddressFormat(address: string): boolean {
  if (!address || typeof address !== 'string') {
    return false;
  }
  
  // Check prefix (SP for mainnet, ST for testnet)
  const prefix = address.substring(0, 2);
  if (prefix !== 'SP' && prefix !== 'ST') {
    return false;
  }
  
  // Check length (typically 39-41 characters)
  if (address.length < 39 || address.length > 41) {
    return false;
  }
  
  // Check characters (base58 alphabet without 0, O, I, l)
  const base58Regex = /^[123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz]+$/;
  return base58Regex.test(address.substring(2));
}

/**
 * Get address type (mainnet or testnet)
 * 
 * @param address - Stacks address
 * @returns 'mainnet' | 'testnet' | null
 */
export function getAddressType(address: string): 'mainnet' | 'testnet' | null {
  if (!isValidStacksAddressFormat(address)) {
    return null;
  }
  return address.startsWith('SP') ? 'mainnet' : 'testnet';
}

/**
 * Derive a deterministic color from an address (for avatars)
 * 
 * @param address - Address to derive color from
 * @returns HSL color string
 */
export function addressToColor(address: string): string {
  const hash = simpleHash(address);
  const hue = parseInt(hash.substring(0, 2), 16) * 1.41; // 0-360
  const saturation = 60 + (parseInt(hash.substring(2, 4), 16) % 20); // 60-80%
  const lightness = 45 + (parseInt(hash.substring(4, 6), 16) % 15); // 45-60%
  
  return `hsl(${Math.floor(hue)}, ${saturation}%, ${lightness}%)`;
}

/**
 * Generate avatar initials from address
 * 
 * @param address - Stacks address
 * @returns Two-character initials
 */
export function addressToInitials(address: string): string {
  if (!address || address.length < 4) {
    return '??';
  }
  return address.substring(0, 2).toUpperCase();
}

// =============================================================================
// Transaction Utilities
// =============================================================================

/**
 * Validate transaction hash format
 * 
 * @param hash - Transaction hash
 * @returns Whether the hash is valid
 */
export function isValidTransactionHash(hash: string): boolean {
  if (!hash || typeof hash !== 'string') {
    return false;
  }
  
  // Stacks tx hashes are 66 characters (0x + 64 hex chars)
  const cleanHash = hash.startsWith('0x') ? hash : `0x${hash}`;
  return /^0x[a-fA-F0-9]{64}$/.test(cleanHash);
}

/**
 * Normalize transaction hash (ensure 0x prefix)
 * 
 * @param hash - Transaction hash
 * @returns Normalized hash with 0x prefix
 */
export function normalizeTransactionHash(hash: string): string {
  if (!hash) return '';
  return hash.startsWith('0x') ? hash.toLowerCase() : `0x${hash.toLowerCase()}`;
}

/**
 * Compare two transaction hashes
 * 
 * @param hash1 - First hash
 * @param hash2 - Second hash
 * @returns Whether hashes are equal
 */
export function compareTransactionHashes(hash1: string, hash2: string): boolean {
  return normalizeTransactionHash(hash1) === normalizeTransactionHash(hash2);
}
