import { Suspense } from "react";
import { LoginForm } from "@/components/auth/LoginForm";

function LoginPageFallback() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
    </div>
  );
}

/**
 * Customer Login Page (Server Component)
 *
 * Auth redirects are handled by proxy.ts middleware.
 * If user reaches this page, they are NOT authenticated.
 */
export default function LoginPage() {
  return (
    <Suspense fallback={<LoginPageFallback />}>
      <div className="min-h-screen bg-secondary flex items-center justify-center pt-24 pb-12 px-4">
        <LoginForm />
      </div>
    </Suspense>
  );
}
