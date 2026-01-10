/**
 * Input Sanitization Utilities
 *
 * Provides functions to sanitize user-generated content to prevent XSS attacks.
 * Uses sanitize-html library with strict defaults.
 */

import sanitizeHtml from "sanitize-html";

// Strict sanitization - removes ALL HTML tags
const STRICT_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: [],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

// Basic sanitization - allows only basic formatting
const BASIC_OPTIONS: sanitizeHtml.IOptions = {
  allowedTags: ["b", "i", "em", "strong", "br"],
  allowedAttributes: {},
  disallowedTagsMode: "discard",
};

/**
 * Sanitize plain text input - removes ALL HTML tags
 * Use for: review titles, order notes, customer names, etc.
 */
export function sanitizeText(input: string | undefined | null): string {
  if (!input) return "";
  return sanitizeHtml(input, STRICT_OPTIONS).trim();
}

/**
 * Sanitize rich text - allows basic formatting (bold, italic)
 * Use for: review comments, product descriptions if rich text is allowed
 */
export function sanitizeRichText(input: string | undefined | null): string {
  if (!input) return "";
  return sanitizeHtml(input, BASIC_OPTIONS).trim();
}

/**
 * Sanitize and validate email format
 */
export function sanitizeEmail(email: string | undefined | null): string {
  if (!email) return "";
  // Remove HTML and trim
  const cleaned = sanitizeText(email).toLowerCase();
  // Basic email validation pattern
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(cleaned) ? cleaned : "";
}
