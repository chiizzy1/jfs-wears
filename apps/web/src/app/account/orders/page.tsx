import { verifySession } from "@/lib/dal";
import { AccountSidebar } from "@/components/account/AccountSidebar";
import { OrderList } from "@/components/account/OrderList";

/**
 * Order History Page (Server Component)
 *
 * Authentication is verified server-side using DAL.
 */
export default async function OrderHistoryPage() {
  // Server-side session verification - redirects if invalid
  await verifySession();

  return (
    <div className="min-h-screen bg-secondary py-12">
      <div className="container-width max-w-4xl">
        <h1 className="text-3xl font-medium mb-10 tracking-[0.02em]">My Account</h1>

        <div className="grid md:grid-cols-3 gap-8">
          <AccountSidebar />

          <main className="md:col-span-2">
            <OrderList />
          </main>
        </div>
      </div>
    </div>
  );
}
