"use client";

import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

function LoginPageContent() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center pt-24 pb-12 px-4">
      <LoginForm />
    </div>
  );
}

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
    </div>
  );
}

/**
 * Customer Login Page
 *
 * Note: Auth redirects are handled by proxy.ts middleware.
 * If user reaches this page, they are NOT authenticated.
 * If they were authenticated, proxy.ts would have redirected to /account.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <LoginPageContent />
    </Suspense>
  );
}
