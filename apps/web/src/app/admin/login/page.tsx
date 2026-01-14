import { AdminLoginForm } from "@/components/auth/AdminLoginForm";

/**
 * Admin Login Page (Server Component)
 *
 * Auth redirects are handled by proxy.ts middleware.
 * AdminLoginForm is a Client Component handling all interactivity.
 */
export default function AdminLoginPage() {
  return (
    <div className="min-h-screen bg-secondary flex items-center justify-center py-12 px-4">
      <AdminLoginForm />
    </div>
  );
}
