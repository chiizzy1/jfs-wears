import Link from "next/link";
import { verifySession } from "@/lib/dal";
import { AddressList } from "@/components/account/AddressList";

/**
 * Addresses Page (Server Component)
 *
 * Authentication is verified server-side using DAL.
 */
export default async function AddressesPage() {
  // Server-side session verification - redirects if invalid
  await verifySession();

  return (
    <div className="min-h-screen bg-secondary py-12">
      <div className="container-width max-w-3xl">
        <div className="mb-6">
          <Link href="/account" className="text-sm text-gray-500 hover:text-black transition-colors">
            ← Back to Account
          </Link>
        </div>

        <AddressList />
      </div>
    </div>
  );
}
