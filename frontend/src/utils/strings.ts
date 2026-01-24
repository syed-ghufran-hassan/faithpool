/**
 * String manipulation utilities
 * 
 * @module utils/strings
 */

// ============================================================================
// Address/ID Truncation
// ============================================================================

/**
 * Truncate address (e.g., "SP3FK...G6N")
 * @param address - Full address string
 * @param startChars - Characters to show at start
 * @param endChars - Characters to show at end
 */
export function truncateAddress(address: string, startChars: number = 5, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Truncate transaction ID
 * @param txId - Full transaction ID
 * @param chars - Characters to show on each end
 */
export function truncateTxId(txId: string, chars: number = 8): string {
  if (!txId) return '';
  if (txId.length <= chars * 2) return txId;
  return `${txId.slice(0, chars)}...${txId.slice(-chars)}`;
}

// ============================================================================
// Case Transformations
// ============================================================================

/**
 * Capitalize first letter
 * @param str - String to capitalize
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Title case (capitalize each word)
 * @param str - String to convert
 */
export function titleCase(str: string): string {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
}

/**
 * Slugify string (for URLs)
 * @param str - String to slugify
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// ============================================================================
// ID Generation
// ============================================================================

/**
 * Generate random ID
 * @param prefix - Optional prefix for the ID
 * @param length - Length of random portion
 */
export function generateId(prefix: string = '', length: number = 8): string {
  const random = Math.random().toString(36).substring(2, 2 + length);
  return prefix ? `${prefix}-${random}` : random;
}

// ============================================================================
// String Validation
// ============================================================================

/**
 * Check if string is empty or whitespace
 * @param str - String to check
 */
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

// ============================================================================
// Pluralization
// ============================================================================

/**
 * Pluralize word based on count
 * @param count - Number to check
 * @param singular - Singular form
 * @param plural - Optional plural form (defaults to singular + 's')
 */
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

/**
 * Format count with label (e.g., "5 members", "1 member")
 * @param count - Number value
 * @param singular - Singular label
 * @param plural - Optional plural label
 */
export function formatCount(count: number, singular: string, plural?: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}

// ============================================================================
// Data Masking
// ============================================================================

/**
 * Mask sensitive data (e.g., email)
 * @param email - Email address to mask
 */
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.slice(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}

/**
 * Extract initials from name
 * @param name - Full name
 * @param max - Maximum initials to return
 */
export function getInitials(name: string, max: number = 2): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, max);
}

// ============================================================================
// HTML Handling
// ============================================================================

/**
 * Remove HTML tags
 * @param html - HTML string to strip
 */
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

/** HTML entity map for escaping */
const HTML_ENTITIES: Record<string, string> = {
  '&': '&amp;',
  '<': '&lt;',
  '>': '&gt;',
  '"': '&quot;',
  "'": '&#39;',
};

/**
 * Escape HTML special characters
 * @param str - String to escape
 */
export function escapeHtml(str: string): string {
  return str.replace(/[&<>"']/g, char => HTML_ENTITIES[char]);
}
