"use client";

import { Suspense } from "react";
import { VerifyEmailForm } from "@/components/auth/VerifyEmailForm";
import { Spinner } from "@/components/ui/spinner";

function VerifyEmailFallback() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Spinner size="lg" />
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <Suspense fallback={<VerifyEmailFallback />}>
        <VerifyEmailForm />
      </Suspense>
    </div>
  );
}
