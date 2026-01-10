/**
 * Server-side Authentication Utilities
 *
 * For use in Server Components and API routes.
 * Reads auth tokens from cookies.
 */

import { cookies } from "next/headers";
import { decodeToken, isTokenExpired, JwtPayload } from "./jwt";

export interface AuthUser {
  id: string;
  email: string;
  type: "customer" | "staff";
  role?: string;
}

/**
 * Get the current authenticated user from cookies
 * Returns null if not authenticated or token is invalid/expired
 */
export async function getServerUser(): Promise<AuthUser | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;

    if (!accessToken) {
      return null;
    }

    if (isTokenExpired(accessToken)) {
      return null;
    }

    const payload = decodeToken(accessToken);
    if (!payload) {
      return null;
    }

    return {
      id: payload.sub,
      email: payload.email,
      type: payload.type,
      role: payload.role,
    };
  } catch {
    return null;
  }
}

/**
 * Require authentication - throws if user is not authenticated
 * Use in layouts/pages that require auth
 */
export async function requireAuth(): Promise<AuthUser> {
  const user = await getServerUser();
  if (!user) {
    throw new Error("Authentication required");
  }
  return user;
}

/**
 * Check if current user is an admin
 */
export async function isAdmin(): Promise<boolean> {
  const user = await getServerUser();
  return user?.type === "staff" && user?.role === "ADMIN";
}

/**
 * Get the raw JWT payload from cookies
 * Useful for accessing additional claims
 */
export async function getJWTPayload(): Promise<JwtPayload | null> {
  try {
    const cookieStore = await cookies();
    const accessToken = cookieStore.get("access_token")?.value;
    if (!accessToken) return null;
    return decodeToken(accessToken);
  } catch {
    return null;
  }
}
