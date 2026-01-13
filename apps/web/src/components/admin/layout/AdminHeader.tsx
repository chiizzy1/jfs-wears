"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Menu } from "lucide-react";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { NotificationDropdown } from "@/components/admin/notifications/NotificationDropdown";
import { useAdminAuth } from "@/lib/admin-auth";
import { AdminSidebar } from "./AdminSidebar";
import { adminNavItems } from "./constants";

interface AdminHeaderProps {
  pathname: string;
}

/**
 * Admin Header Component
 * Renders the top header bar with mobile menu, title, notifications, and profile
 */
export function AdminHeader({ pathname }: AdminHeaderProps) {
  const router = useRouter();
  const { user, logout } = useAdminAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const handleLogout = () => {
    logout();
    router.push("/admin/login");
    setShowLogoutConfirm(false);
  };

  const currentPageLabel = adminNavItems.find((item) => item.href === pathname)?.label || "Dashboard";

  return (
    <>
      <header className="bg-white border-b border-gray-100 sticky top-0 z-10">
        <div className="flex items-center justify-between px-4 sm:px-8 py-4 sm:py-5">
          <div className="flex items-center gap-4">
            {/* Mobile Menu Trigger */}
            <div className="md:hidden">
              <Sheet open={isMobileMenuOpen} onOpenChange={setIsMobileMenuOpen}>
                <SheetTrigger asChild>
                  <button className="p-2 -ml-2 hover:bg-gray-50 rounded-md">
                    <Menu className="w-6 h-6 text-primary" />
                  </button>
                </SheetTrigger>
                <SheetContent side="left" className="p-0 w-72">
                  <AdminSidebar pathname={pathname} />
                </SheetContent>
              </Sheet>
            </div>

            <h1 className="text-xs sm:text-sm uppercase tracking-[0.2em] font-medium text-gray-700 truncate max-w-[150px] sm:max-w-none">
              {currentPageLabel}
            </h1>
          </div>

          <div className="flex items-center gap-4">
            {/* Notifications */}
            <NotificationDropdown />

            {/* Profile */}
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 sm:w-9 sm:h-9 bg-black flex items-center justify-center text-white font-medium text-sm sm:text-base">
                {user?.name?.[0]?.toUpperCase() || "A"}
              </div>
              <div className="hidden sm:block">
                <p className="text-sm font-medium">{user?.name || "Admin"}</p>
                <button
                  onClick={() => setShowLogoutConfirm(true)}
                  className="text-xs text-gray-500 hover:text-sale transition-colors"
                >
                  Sign Out
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Sign Out Confirmation Dialog */}
      <ConfirmDialog
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        onConfirm={handleLogout}
        title="Sign Out"
        message="Are you sure you want to sign out of the admin panel?"
        confirmLabel="Sign Out"
        variant="default"
        icon="logout"
      />
    </>
  );
}
