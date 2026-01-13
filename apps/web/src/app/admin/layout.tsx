"use client";

import { usePathname } from "next/navigation";
import { AdminAuthProvider, useAdminAuth } from "@/lib/admin-auth";
import { ConfirmProvider } from "@/components/ui/confirm-dialog";
import { Toaster } from "react-hot-toast";
import { AdminSidebar, AdminHeader } from "@/components/admin/layout";

interface AdminLayoutProps {
  children: React.ReactNode;
}

/**
 * Main Admin Layout
 * Wraps all admin pages with auth, sidebar, and header
 */
export default function AdminLayout({ children }: AdminLayoutProps) {
  return (
    <AdminAuthProvider>
      <ConfirmProvider>
        <Toaster position="top-right" />
        <AdminLayoutContent>{children}</AdminLayoutContent>
      </ConfirmProvider>
    </AdminAuthProvider>
  );
}

function AdminLayoutContent({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const { isLoading } = useAdminAuth();

  // Login page - just render children without any admin chrome
  if (pathname === "/admin/login") {
    return <>{children}</>;
  }

  // For all other admin pages, show loading state while auth is checking
  if (isLoading) {
    return (
      <div className="min-h-screen bg-secondary flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-black border-t-transparent animate-spin mx-auto mb-4"></div>
          <p className="text-gray-500 text-sm">Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-secondary flex">
      {/* Desktop Sidebar */}
      <aside className="w-64 bg-white border-r border-gray-100 fixed h-full hidden md:block z-20">
        <AdminSidebar pathname={pathname} />
      </aside>

      {/* Main Content */}
      <main className="flex-1 ml-0 md:ml-64 transition-[margin] duration-200 ease-in-out">
        {/* Top Bar */}
        <AdminHeader pathname={pathname} />

        {/* Page Content */}
        <div className="p-4 sm:p-8">{children}</div>
      </main>
    </div>
  );
}
