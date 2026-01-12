/**
 * Format Utilities
 * Reusable formatting functions for currency, dates, and other common formats
 */

/**
 * Format a number as Nigerian Naira currency
 * Abbreviates large numbers with K (thousands) and M (millions)
 * Handles Prisma Decimal types which are returned as strings
 *
 * @param amount - The amount to format (number or string from Prisma Decimal)
 * @param abbreviated - Whether to use abbreviated format (default: true)
 * @returns Formatted currency string
 *
 * @example
 * formatCurrency(1500000) // "₦1.50M"
 * formatCurrency(25000) // "₦25.0K"
 * formatCurrency(500) // "₦500"
 * formatCurrency("25000") // "₦25.0K" (handles string from Prisma)
 * formatCurrency(1500000, false) // "₦1,500,000"
 */
export function formatCurrency(amount: number | string | null | undefined, abbreviated = true): string {
  if (amount === null || amount === undefined) {
    return "₦0";
  }

  const numAmount = typeof amount === "string" ? parseFloat(amount) : amount;

  if (isNaN(numAmount)) {
    return "₦0";
  }

  if (abbreviated) {
    if (numAmount >= 1000000) {
      return `₦${(numAmount / 1000000).toFixed(2)}M`;
    } else if (numAmount >= 1000) {
      return `₦${(numAmount / 1000).toFixed(1)}K`;
    }
  }
  return `₦${numAmount.toLocaleString()}`;
}

/**
 * Format a date string to localized format
 * Handles null/undefined and invalid dates gracefully
 *
 * @param dateString - ISO date string to format (or null/undefined)
 * @param options - Intl.DateTimeFormat options (default: day, month short, year)
 * @returns Formatted date string or "N/A" if invalid
 *
 * @example
 * formatDate("2024-01-15T10:30:00Z") // "15 Jan 2024"
 * formatDate(null) // "N/A"
 */
export function formatDate(
  dateString: string | null | undefined,
  options: Intl.DateTimeFormatOptions = { day: "numeric", month: "short", year: "numeric" }
): string {
  if (!dateString) {
    return "N/A";
  }

  try {
    const date = new Date(dateString);

    if (isNaN(date.getTime())) {
      return "N/A";
    }

    return date.toLocaleDateString("en-NG", options);
  } catch {
    return "N/A";
  }
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
