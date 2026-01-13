"use client";

import { AdminProfileForm } from "@/components/admin/profile/AdminProfileForm";
import { AdminPasswordForm } from "@/components/admin/profile/AdminPasswordForm";

export default function AdminProfilePage() {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-black">Account</h1>
        <p className="text-2xl font-light mt-1">My Profile</p>
      </div>

      {/* Content */}
      <div className="space-y-8">
        <AdminProfileForm />
        <AdminPasswordForm />
      </div>
    </div>
  );
}
