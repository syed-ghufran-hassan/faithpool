/**
 * Date and time formatting utilities
 * 
 * @module utils/date
 */

/** Time unit constants */
const SECOND = 1000;
const MINUTE = SECOND * 60;
const HOUR = MINUTE * 60;
const DAY = HOUR * 24;
const WEEK = DAY * 7;
const MONTH = DAY * 30;

/**
 * Format date relative to now (e.g., "2 hours ago", "3 days ago")
 */
export function formatRelativeTime(dateString: string | Date): string {
  const date = typeof dateString === 'string' ? new Date(dateString) : dateString;
  const now = new Date();
  const diffMs = now.getTime() - date.getTime();
  const diffSecs = Math.floor(diffMs / SECOND);
  const diffMins = Math.floor(diffMs / MINUTE);
  const diffHours = Math.floor(diffMs / HOUR);
  const diffDays = Math.floor(diffMs / DAY);
  const diffWeeks = Math.floor(diffMs / WEEK);
  const diffMonths = Math.floor(diffMs / MONTH);

  if (diffSecs < 60) return 'just now';
  if (diffMins < 60) return `${diffMins} minute${diffMins > 1 ? 's' : ''} ago`;
  if (diffHours < 24) return `${diffHours} hour${diffHours > 1 ? 's' : ''} ago`;
  if (diffDays < 7) return `${diffDays} day${diffDays > 1 ? 's' : ''} ago`;
  if (diffWeeks < 4) return `${diffWeeks} week${diffWeeks > 1 ? 's' : ''} ago`;
  if (diffMonths < 12) return `${diffMonths} month${diffMonths > 1 ? 's' : ''} ago`;
  
  return formatDate(date);
}

/**
 * Format date as "Jan 15, 2024"
 */
export function formatDate(dateInput: string | Date): string {
  const date = typeof dateInput === 'string' ? new Date(dateInput) : dateInput;
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================================================
// Long Date Formatting
// ============================================================================

/**
 * Format date as "January 15, 2024"
 * @param dateString - Date string to format
 */
export function formatDateLong(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'long',
    day: 'numeric',
    year: 'numeric',
  });
}

// ============================================================================
// Time Formatting
// ============================================================================

/**
 * Format time as "2:30 PM"
 * @param dateString - Date string to extract time from
 */
export function formatTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

/**
 * Format date and time as "Jan 15, 2024, 2:30 PM"
 * @param dateString - Date string to format
 */
export function formatDateTime(dateString: string): string {
  const date = new Date(dateString);
  return date.toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    year: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
    hour12: true,
  });
}

// ============================================================================
// Date Calculations
// ============================================================================

/**
 * Get days until a future date
 * @param dateString - Future date string
 * @returns Number of days until date (negative if past)
 */
export function getDaysUntil(dateString: string): number {
  const date = new Date(dateString);
  const now = new Date();
  const diffMs = date.getTime() - now.getTime();
  return Math.ceil(diffMs / DAY);
}

/**
 * Add days to a date
 * @param date - Starting date
 * @param days - Number of days to add (can be negative)
 */
export function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

// ============================================================================
// Date Comparisons
// ============================================================================

/**
 * Check if date is in the past
 * @param dateString - Date string to check
 */
export function isPast(dateString: string): boolean {
  return new Date(dateString) < new Date();
}

/**
 * Check if date is today
 * @param dateString - Date string to check
 */
export function isToday(dateString: string): boolean {
  const date = new Date(dateString);
  const today = new Date();
  return (
    date.getDate() === today.getDate() &&
    date.getMonth() === today.getMonth() &&
    date.getFullYear() === today.getFullYear()
  );
}

// ============================================================================
// Day Boundaries
// ============================================================================

/**
 * Get start of day (00:00:00.000)
 * @param date - Date to get start of (defaults to today)
 */
export function startOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(0, 0, 0, 0);
  return result;
}

/**
 * Get end of day (23:59:59.999)
 * @param date - Date to get end of (defaults to today)
 */
export function endOfDay(date: Date = new Date()): Date {
  const result = new Date(date);
  result.setHours(23, 59, 59, 999);
  return result;
}
