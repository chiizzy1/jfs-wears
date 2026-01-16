import { verifySession } from "@/lib/dal";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { PageHero } from "@/components/common/PageHero";
import { ProfileForm } from "@/components/account/ProfileForm";
import { PasswordForm } from "@/components/account/PasswordForm";
import { DeleteAccountSection } from "@/components/account/DeleteAccountSection";

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
    <div className="min-h-screen bg-secondary pb-12">
      <PageHero title="My Account" alignment="center" />

      <div className="container-width max-w-4xl">
        <div className="grid md:grid-cols-3 gap-8">
          <AccountSidebar />

          <main className="md:col-span-2">
            <ProfileForm />
            <PasswordForm />
            <DeleteAccountSection />
          </main>
        </div>
      </div>
    </div>
  );
}
