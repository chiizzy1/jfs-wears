import { Suspense } from "react";
import { ResetPasswordForm } from "@/components/auth/ResetPasswordForm";

/**
 * Reset Password Page (Server Component)
 * Thin shell wrapper for the reset password form.
 */
export default function ResetPasswordPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <Suspense fallback={<div>Loading...</div>}>
        <ResetPasswordForm />
      </Suspense>
    </div>
  );
}
