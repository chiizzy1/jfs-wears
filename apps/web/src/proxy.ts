/**
 * Next.js Proxy for Route Protection (Next.js 16+)
 *
 * Strategy: Lightweight checks with backend verification
 * - Reads access_token cookie
 * - Checks expiration (no signature verification)
 * - Redirects unauthenticated users from protected routes
 * - Redirects authenticated users away from login pages
 */

import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Protected route patterns
const PROTECTED_ROUTES = ["/admin", "/account"];

// Auth routes that authenticated users should be redirected AWAY from
const AUTH_ROUTES = ["/login", "/register", "/forgot-password", "/reset-password", "/admin/login"];

/**
 * Check if a JWT token is expired (without signature verification)
 */
function isTokenExpired(token: string): boolean {
  try {
    const parts = token.split(".");
    if (parts.length !== 3) return true;

    const payload = parts[1];
    const decoded = JSON.parse(atob(payload.replace(/-/g, "+").replace(/_/g, "/")));

    // Add 30 second buffer for clock skew
    const now = Math.floor(Date.now() / 1000);
    return decoded.exp < now + 30;
  } catch {
    return true;
  }
}

/**
 * Check if path matches any protected route pattern
 */
function isProtectedRoute(pathname: string): boolean {
  return PROTECTED_ROUTES.some((route) => pathname.startsWith(route));
}

/**
 * Check if path is an auth route (login, register, etc.)
 */
function isAuthRoute(pathname: string): boolean {
  return AUTH_ROUTES.some((route) => pathname.startsWith(route));
}

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;
  const accessToken = request.cookies.get("access_token")?.value;

  // Check if user is authenticated (has valid, non-expired token)
  const isAuthenticated = accessToken && !isTokenExpired(accessToken);

  // Protected routes - redirect to appropriate login if not authenticated
  // Exception: /admin/login should be accessible to allow staff login
  if (isProtectedRoute(pathname) && pathname !== "/admin/login") {
    if (!isAuthenticated) {
      // Admin routes redirect to admin login
      if (pathname.startsWith("/admin")) {
        return NextResponse.redirect(new URL("/admin/login", request.url));
      }
      // Customer routes (like /account) redirect to customer login
      const loginUrl = new URL("/login", request.url);
      loginUrl.searchParams.set("redirect", pathname);
      return NextResponse.redirect(loginUrl);
    }
  }

  // Auth routes - redirect authenticated users to appropriate dashboard
  if (isAuthRoute(pathname)) {
    if (isAuthenticated) {
      // Check if admin or customer based on token payload
      try {
        const parts = accessToken!.split(".");
        const payload = JSON.parse(atob(parts[1].replace(/-/g, "+").replace(/_/g, "/")));
        const redirectTo = payload.type === "staff" ? "/admin" : "/account";
        return NextResponse.redirect(new URL(redirectTo, request.url));
      } catch {
        // If token parsing fails, redirect to home
        return NextResponse.redirect(new URL("/", request.url));
      }
    }
  }

  return NextResponse.next();
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (logo, images, etc.)
     */
    "/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)",
  ],
};
