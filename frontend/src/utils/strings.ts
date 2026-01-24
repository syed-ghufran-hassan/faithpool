/**
 * String manipulation utilities
 * 
 * @module utils/strings
 */

/**
 * Truncate address (e.g., "SP3FK...G6N")
 */
export function truncateAddress(address: string, startChars: number = 5, endChars: number = 4): string {
  if (!address) return '';
  if (address.length <= startChars + endChars) return address;
  return `${address.slice(0, startChars)}...${address.slice(-endChars)}`;
}

/**
 * Truncate transaction ID
 */
export function truncateTxId(txId: string, chars: number = 8): string {
  if (!txId) return '';
  if (txId.length <= chars * 2) return txId;
  return `${txId.slice(0, chars)}...${txId.slice(-chars)}`;
}

/**
 * Capitalize first letter
 */
export function capitalize(str: string): string {
  if (!str) return '';
  return str.charAt(0).toUpperCase() + str.slice(1).toLowerCase();
}

/**
 * Title case (capitalize each word)
 */
export function titleCase(str: string): string {
  if (!str) return '';
  return str.split(' ').map(word => capitalize(word)).join(' ');
}

/**
 * Slugify string (for URLs)
 */
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, '')
    .replace(/[\s_-]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

// Generate random ID
export function generateId(prefix: string = '', length: number = 8): string {
  const random = Math.random().toString(36).substring(2, 2 + length);
  return prefix ? `${prefix}-${random}` : random;
}

// Check if string is empty or whitespace
export function isBlank(str: string | null | undefined): boolean {
  return !str || str.trim().length === 0;
}

// Pluralize word based on count
export function pluralize(count: number, singular: string, plural?: string): string {
  if (count === 1) return singular;
  return plural || `${singular}s`;
}

// Format count with label (e.g., "5 members", "1 member")
export function formatCount(count: number, singular: string, plural?: string): string {
  return `${count} ${pluralize(count, singular, plural)}`;
}

// Mask sensitive data (e.g., email)
export function maskEmail(email: string): string {
  const [local, domain] = email.split('@');
  if (!domain) return email;
  const maskedLocal = local.slice(0, 2) + '***';
  return `${maskedLocal}@${domain}`;
}

// Extract initials from name
export function getInitials(name: string, max: number = 2): string {
  if (!name) return '';
  return name
    .split(' ')
    .map(part => part.charAt(0))
    .join('')
    .toUpperCase()
    .slice(0, max);
}

// Remove HTML tags
export function stripHtml(html: string): string {
  return html.replace(/<[^>]*>/g, '');
}

// Escape HTML special characters
export function escapeHtml(str: string): string {
  const entities: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return str.replace(/[&<>"']/g, char => entities[char]);
}
