"use client";

import { RegisterForm } from "@/components/auth/RegisterForm";

export default function RegisterPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <RegisterForm />
    </div>
  );
}
