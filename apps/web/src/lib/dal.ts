/**
 * Data Access Layer (DAL) for server-side authentication
 *
 * Use these functions in Server Components to verify sessions.
 * - verifySession(): Redirects to /login if invalid
 * - getUser(): Returns null if invalid (no redirect)
 */

import { cookies } from "next/headers";
import { redirect } from "next/navigation";

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001";

export interface User {
  id: string;
  email: string;
  name?: string;
  phone?: string;
  profileImage?: string;
}

export interface Session {
  user: User;
}

/**
 * Verify session server-side. Redirects to /login if invalid.
 * Use this in protected Server Component pages.
 *
 * @example
 * export default async function AccountPage() {
 *   const { user } = await verifySession();
 *   return <div>Welcome, {user.name}</div>;
 * }
 */
export async function verifySession(): Promise<Session> {
  const cookieStore = await cookies();
  const token = cookieStore.get("access_token")?.value;

  if (!token) {
    redirect("/login");
  }

  try {
    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Cookie: `access_token=${token}` },
      cache: "no-store",
    });

    if (!res.ok) {
      redirect("/login");
    }

    return res.json();
  } catch {
    redirect("/login");
  }
}

/**
 * Get user without redirecting (for optional auth contexts).
 * Use this when you want to show different UI for logged-in vs logged-out users.
 *
 * @example
 * export default async function Header() {
 *   const session = await getUser();
 *   if (session) return <UserMenu user={session.user} />;
 *   return <LoginButton />;
 * }
 */
export async function getUser(): Promise<Session | null> {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("access_token")?.value;
    if (!token) return null;

    const res = await fetch(`${API_URL}/api/auth/me`, {
      headers: { Cookie: `access_token=${token}` },
      cache: "no-store",
    });

    if (!res.ok) return null;
    return res.json();
  } catch {
    return null;
  }
}
