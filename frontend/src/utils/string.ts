/**
 * String Utility Functions
 * 
 * Comprehensive string manipulation utilities.
 */

/**
 * Truncate a string to a maximum length with ellipsis
 */
export function truncate(str: string, maxLength: number, suffix: string = '...'): string {
  if (str.length <= maxLength) return str;
  return str.slice(0, maxLength - suffix.length) + suffix;
}

/**
 * Truncate in the middle, keeping start and end visible
 */
export function truncateMiddle(str: string, maxLength: number, separator: string = '...'): string {
  if (str.length <= maxLength) return str;
  const charsToShow = maxLength - separator.length;
  const frontChars = Math.ceil(charsToShow / 2);
  const backChars = Math.floor(charsToShow / 2);
  return str.slice(0, frontChars) + separator + str.slice(-backChars);
}

/**
 * Truncate a blockchain address for display
 */
export function truncateAddress(address: string, startChars: number = 6, endChars: number = 4): string {
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Capitalize the first letter of a string
 */
export function capitalize(str: string): string {
  if (!str) return str;
  return str.charAt(0).toUpperCase() + str.slice(1);
}

/**
 * Capitalize first letter of each word
 */
export function titleCase(str: string): string {
  return str
    .toLowerCase()
    .split(' ')
    .map(word => capitalize(word))
    .join(' ');
}

/**
 * Convert string to kebab-case
 */
export function toKebabCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1-$2')
    .replace(/[\s_]+/g, '-')
    .toLowerCase();
}

/**
 * Convert string to camelCase
 */
export function toCamelCase(str: string): string {
  return str
    .replace(/[-_\s]+(.)?/g, (_, char) => (char ? char.toUpperCase() : ''))
    .replace(/^(.)/, (_, char) => char.toLowerCase());
}

/**
 * Convert string to snake_case
 */
export function toSnakeCase(str: string): string {
  return str
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    .replace(/[-\s]+/g, '_')
    .toLowerCase();
}

/**
 * Convert string to PascalCase
 */
export function toPascalCase(str: string): string {
  const camel = toCamelCase(str);
  return camel.charAt(0).toUpperCase() + camel.slice(1);
}

/**
 * Remove all whitespace from a string
 */
export function removeWhitespace(str: string): string {
  return str.replace(/\s+/g, '');
}

/**
 * Normalize whitespace (collapse multiple spaces into one)
 */
export function normalizeWhitespace(str: string): string {
  return str.replace(/\s+/g, ' ').trim();
}

/**
 * Check if a string is empty or only whitespace
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

/**
 * Check if a string contains only alphanumeric characters
 */
export function isAlphanumeric(str: string): boolean {
  return /^[a-zA-Z0-9]+$/.test(str);
}

/**
 * Check if a string is a valid email format
 */
export function isValidEmail(str: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(str);
}

/**
 * Check if a string is a valid URL
 */
export function isValidUrl(str: string): boolean {
  try {
    new URL(str);
    return true;
  } catch {
    return false;
  }
}

/**
 * Check if a string is a valid Stacks address
 */
export function isValidStacksAddress(str: string): boolean {
  // Stacks addresses start with SP (mainnet) or ST (testnet) followed by base58 characters
  return /^S[PT][A-Za-z0-9]{38,40}$/.test(str);
}

/**
 * Check if a string is a valid transaction hash
 */
export function isValidTxHash(str: string): boolean {
  return /^0x[a-fA-F0-9]{64}$/.test(str) || /^[a-fA-F0-9]{64}$/.test(str);
}

/**
 * Escape HTML special characters
 */
export function escapeHtml(str: string): string {
  const htmlEscapes: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => htmlEscapes[char]);
}

/**
 * Unescape HTML entities
 */
export function unescapeHtml(str: string): string {
  const htmlUnescapes: Record<string, string> = {
    '&amp;': '&',
    '&lt;': '<',
    '&gt;': '>',
    '&quot;': '"',
    '&#39;': "'",
  };
  return str.replace(/&(?:amp|lt|gt|quot|#39);/g, entity => htmlUnescapes[entity] || entity);
}

/**
 * Generate a slug from a string
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/**
 * Pad a string to a certain length
 */
export function padStart(str: string, length: number, char: string = ' '): string {
  return str.padStart(length, char);
}

/**
 * Pad a string at the end to a certain length
 */
export function padEnd(str: string, length: number, char: string = ' '): string {
  return str.padEnd(length, char);
}

/**
 * Repeat a string n times
 */
export function repeat(str: string, times: number): string {
  return str.repeat(times);
}

/**
 * Reverse a string
 */
export function reverse(str: string): string {
  return str.split('').reverse().join('');
}

/**
 * Count occurrences of a substring
 */
export function countOccurrences(str: string, substring: string): number {
  if (!substring) return 0;
  return (str.match(new RegExp(escapeRegExp(substring), 'g')) || []).length;
}

/**
 * Escape special regex characters in a string
 */
export function escapeRegExp(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

/**
 * Remove accents/diacritics from a string
 */
export function removeAccents(str: string): string {
  return str.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
}

/**
 * Mask a string (e.g., for sensitive data)
 */
export function mask(str: string, visibleStart: number = 4, visibleEnd: number = 4, maskChar: string = '*'): string {
  if (str.length <= visibleStart + visibleEnd) return str;
  const start = str.slice(0, visibleStart);
  const end = str.slice(-visibleEnd);
  const masked = maskChar.repeat(str.length - visibleStart - visibleEnd);
  return start + masked + end;
}

/**
 * Extract initials from a name
 */
export function getInitials(name: string, maxLength: number = 2): string {
  return name
    .split(' ')
    .map(part => part.charAt(0).toUpperCase())
    .slice(0, maxLength)
    .join('');
}

/**
 * Convert a string to a hash (simple non-cryptographic hash)
 */
export function simpleHash(str: string): number {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash = hash & hash; // Convert to 32-bit integer
  }
  return Math.abs(hash);
}

/**
 * Format a contract identifier for display
 */
export function formatContractId(contractId: string): string {
  const [address, name] = contractId.split('.');
  if (!name) return contractId;
  return `${truncateAddress(address)}.${name}`;
}

export default {
  truncate,
  truncateMiddle,
  truncateAddress,
  capitalize,
  titleCase,
  toKebabCase,
  toCamelCase,
  toSnakeCase,
  toPascalCase,
  removeWhitespace,
  normalizeWhitespace,
  isBlank,
  isAlphanumeric,
  isValidEmail,
  isValidUrl,
  isValidStacksAddress,
  isValidTxHash,
  escapeHtml,
  unescapeHtml,
  slugify,
  padStart,
  padEnd,
  repeat,
  reverse,
  countOccurrences,
  escapeRegExp,
  removeAccents,
  mask,
  getInitials,
  simpleHash,
  formatContractId,
};
