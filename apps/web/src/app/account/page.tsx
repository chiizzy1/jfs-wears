import { verifySession } from "@/lib/dal";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";

/**
 * Account Page (Server Component)
 *
 * Authentication is verified server-side using DAL.
 * - If not authenticated → redirects to /login
 * - If authenticated → renders page with user data
 *
 * Child components (ProfileForm, AccountSidebar, PasswordForm) remain Client Components
 * as they use hooks for interactivity.
 */
export default async function AccountPage() {
  // Server-side session verification - redirects if invalid
  const { user } = await verifySession();

  return (
    <div className="min-h-screen bg-secondary pt-24 pb-12">
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
