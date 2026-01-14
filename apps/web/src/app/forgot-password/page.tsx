import { ForgotPasswordForm } from "@/components/auth/ForgotPasswordForm";

/**
 * Forgot Password Page (Server Component)
 * ForgotPasswordForm is a Client Component handling all interactivity.
 */
export default function ForgotPasswordPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <ForgotPasswordForm />
    </div>
  );
}
