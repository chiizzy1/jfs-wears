/**
 * Format Utilities
 * Reusable formatting functions for currency, dates, and other common formats
 */

/**
 * Format a number as Nigerian Naira currency
 * Abbreviates large numbers with K (thousands) and M (millions)
 *
 * @param amount - The amount to format
 * @param abbreviated - Whether to use abbreviated format (default: true)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1500000) // "₦1.50M"
 * formatCurrency(25000) // "₦25.0K"
 * formatCurrency(500) // "₦500"
 * formatCurrency(1500000, false) // "₦1,500,000"
 */
export function formatCurrency(amount: number, abbreviated = true): string {
  if (abbreviated) {
    if (amount >= 1000000) {
      return `₦${(amount / 1000000).toFixed(2)}M`;
    } else if (amount >= 1000) {
      return `₦${(amount / 1000).toFixed(1)}K`;
    }
  }
  return `₦${amount.toLocaleString()}`;
}

/**
 * Format a date string to localized format
 *
 * @param dateString - ISO date string to format
 * @param options - Intl.DateTimeFormat options (default: day, month short, year)
 * @returns Formatted date string
 *
 * @example
 * formatDate("2024-01-15T10:30:00Z") // "15 Jan 2024"
 */
export function formatDate(
  dateString: string,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  const date = new Date(dateString);
  return date.toLocaleDateString("en-NG", options);
}

/**
 * Format a date to relative time (e.g., "2 hours ago")
 *
 * @param dateString - ISO date string
 * @returns Relative time string
 */
export function formatRelativeTime(dateString: string): string {
  const date = new Date(dateString);
  const now = new Date();
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diffInSeconds < 60) return "Just now";
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)}m ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)}h ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)}d ago`;

  return formatDate(dateString);
}

/**
 * Format a number with locale string
 *
 * @param num - Number to format
 * @returns Formatted number string with thousands separators
 */
export function formatNumber(num: number): string {
  return num.toLocaleString();
}

/**
 * Truncate text with ellipsis
 *
 * @param text - Text to truncate
 * @param maxLength - Maximum length before truncation
 * @returns Truncated text with ellipsis if needed
 */
export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text;
  return `${text.slice(0, maxLength)}...`;
}
