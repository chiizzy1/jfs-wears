"use client";

import { useRouter } from "next/navigation";
import { AdminLoginForm } from "@/components/auth/AdminLoginForm";
import { useAdminAuth } from "@/lib/admin-auth";
import { useEffect } from "react";

export default function AdminLoginPage() {
  const router = useRouter();
  const { isAuthenticated } = useAdminAuth();

  useEffect(() => {
    if (isAuthenticated) {
      router.push("/admin");
    }
  }, [isAuthenticated, router]);

  if (isAuthenticated) return null;

  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <AdminLoginForm />
    </div>
  );
}
