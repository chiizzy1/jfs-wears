"use client";

import { LoginForm } from "@/components/auth/LoginForm";

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <LoginForm />
    </div>
  );
}
