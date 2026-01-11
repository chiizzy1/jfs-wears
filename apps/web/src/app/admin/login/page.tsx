"use client";

import { useRouter } from "next/navigation";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { useAdminAuth } from "@/lib/admin-auth";
import { useEffect } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated, isLoading } = useAdminAuth();

  useEffect(() => {
    if (!isLoading && isAuthenticated) {
      router.replace("/admin");
    }
  }, [isAuthenticated, isLoading, router]);

  // Show loading spinner while checking auth status
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
      </div>
    );
  }

  // Already authenticated, redirect will happen via useEffect
  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <AdminLoginForm />
    </div>
  );
}
