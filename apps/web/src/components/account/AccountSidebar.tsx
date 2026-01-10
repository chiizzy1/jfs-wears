"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuthStore } from "@/stores/auth-store";
import toast from "react-hot-toast";

export function AccountSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const { user, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push("/");
    toast.success("Logged out successfully");
  };

  const isActive = (path: string) => pathname === path;

  return (
    <aside className="md:col-span-1">
      <div className="bg-white p-6 border border-gray-100 shadow-sm">
        <div className="text-center mb-6">
          <div className="w-16 h-16 bg-black text-white flex items-center justify-center mx-auto mb-3 rounded-full text-xl font-medium">
            {user?.name?.charAt(0)?.toUpperCase() || user?.email?.charAt(0)?.toUpperCase()}
          </div>
          <h2 className="font-medium truncate px-2">{user?.name || "Customer"}</h2>
          <p className="text-xs text-muted-foreground mt-1 truncate px-2">{user?.email}</p>
        </div>

        <nav className="space-y-1">
          <Link
            href="/account"
            className={`block px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
              isActive("/account") ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Profile
          </Link>
          <Link
            href="/account/orders"
            className={`block px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
              isActive("/account/orders") ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Order History
          </Link>
          <Link
            href="/account/addresses"
            className={`block px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
              isActive("/account/addresses") ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Addresses
          </Link>
          <Link
            href="/wishlist"
            className={`block px-4 py-3 text-xs uppercase tracking-widest transition-colors ${
              isActive("/wishlist") ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            Wishlist
          </Link>
          <button
            onClick={handleLogout}
            className="block w-full text-left px-4 py-3 text-xs uppercase tracking-widest text-red-500 hover:bg-gray-50 transition-colors mt-4 border-t border-gray-100"
          >
            Sign Out
          </button>
        </nav>
      </div>
    </aside>
  );
}
