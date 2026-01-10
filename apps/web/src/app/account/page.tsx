"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";

export default function AccountPage() {
  const router = useRouter();
  const { isAuthenticated } = useAuthStore();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && !isAuthenticated) {
      router.push("/login?redirect=/account");
    }
  }, [mounted, isAuthenticated, router]);

  if (!mounted || !isAuthenticated) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="animate-pulse text-muted-foreground">Loading...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary py-12">
      <div className="container-width max-w-4xl">
        <h1 className="text-3xl font-medium mb-10 tracking-[0.02em]">My Account</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <AccountSidebar />

          <main className="md:col-span-2">
            <ProfileForm />
            <PasswordForm />
          </main>
        </div>
      </div>
    </div>
  );
}
