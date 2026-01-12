"use client";

import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

/**
 * Admin Login Page
 *
 * Note: Auth redirects are handled by proxy.ts middleware.
 * If user reaches this page, they are NOT authenticated.
 * If they were authenticated, proxy.ts would have redirected to /admin.
 */
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <AdminLoginForm />
    </div>
  );
}
