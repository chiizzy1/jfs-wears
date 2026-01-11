"use client";

import { Suspense } from "react";
import { useEffect, useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { RegisterForm } from "@/components/auth/RegisterForm";
import { useAuthStore } from "@/stores/auth-store";

function RegisterPageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { isAuthenticated } = useAuthStore();
  const [isHydrated, setIsHydrated] = useState(false);

  // Wait for zustand store to hydrate from localStorage
  useEffect(() => {
    setIsHydrated(true);
  }, []);

  useEffect(() => {
    if (isHydrated && isAuthenticated) {
      const redirectTo = searchParams.get("redirect") || "/";
      // Prevent redirect loops
      if (!redirectTo.includes("/login") && !redirectTo.includes("/register")) {
        router.replace(redirectTo);
      } else {
        router.replace("/");
      }
    }
  }, [isAuthenticated, isHydrated, router, searchParams]);

  // Show loading while hydrating
  if (!isHydrated) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  // Already authenticated - wait for redirect
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <RegisterForm />
    </div>
  );
}

function RegisterPageFallback() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center">
      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
    </div>
  );
}

export default function RegisterPage() {
  return (
    <Suspense fallback={<RegisterPageFallback />}>
      <RegisterPageContent />
    </Suspense>
  );
}
