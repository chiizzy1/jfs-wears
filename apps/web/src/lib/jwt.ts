/**
 * JWT Utilities for Frontend
 *
 * Lightweight token decoding and expiry checking.
 * Does NOT verify signatures - that's the backend's job.
 */

export interface JwtPayload {
  sub: string; // User ID
  email: string;
  type: "customer" | "staff";
  role?: string;
  iat: number;
  exp: number;
}

/**
 * Safely decode a JWT token without verifying signature
 * Returns null if token is invalid or malformed
 */
export function decodeToken(token: string): JwtPayload | null {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return null;

    const payload = parts[1];
    // Handle both browser and Node.js environments
    const decoded =
      typeof atob !== "undefined"
        ? atob(payload.replace(/-/g, "+").replace(/_/g, "/"))
        : Buffer.from(payload, "base64").toString("utf-8");

    return JSON.parse(decoded) as JwtPayload;
  } catch {
    return null;
  }
}

/**
 * Check if a JWT token is expired
 * Returns true if token is expired or invalid
 */
export function isTokenExpired(token: string): boolean {
  const payload = decodeToken(token);
  if (!payload) return true;

  // Add 30 second buffer for clock skew
  const now = Math.floor(Date.now() / 1000);
  return payload.exp < now + 30;
}

/**
 * Get remaining time until token expires in seconds
 * Returns 0 if token is expired or invalid
 */
export function getTokenExpirySeconds(token: string): number {
  const payload = decodeToken(token);
  if (!payload) return 0;

  const now = Math.floor(Date.now() / 1000);
  const remaining = payload.exp - now;
  return remaining > 0 ? remaining : 0;
}
