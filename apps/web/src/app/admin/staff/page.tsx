"use client";

import { useState } from "react";
import { StaffTable } from "@/components/admin/staff/StaffTable"; // Ensure this import path is correct
import { AddStaffModal } from "@/components/admin/staff/AddStaffModal"; // Ensure this import path is correct
import { Button } from "@/components/ui/button"; // Ensure this import path is correct
import { Plus } from "lucide-react";
import { useStaff } from "@/hooks/use-staff";

export default function StaffPage() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { staff } = useStaff();

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted">Staff</h1>
          <p className="text-2xl font-light mt-1">Team Management</p>
        </div>
        <div className="flex gap-2">
          <Button
            onClick={() => setIsModalOpen(true)}
            className="px-6 py-3 bg-black text-white text-xs uppercase tracking-[0.15em] hover:bg-black/90 transition-colors flex items-center gap-2"
          >
            <Plus className="w-4 h-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Total Staff</p>
          <p className="text-3xl font-light mt-3">{staff.length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Admins</p>
          <p className="text-3xl font-light mt-3">{staff.filter((s) => s.role === "ADMIN").length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Managers</p>
          <p className="text-3xl font-light mt-3">{staff.filter((s) => s.role === "MANAGER").length}</p>
        </div>
        <div className="bg-white p-6 border border-gray-100">
          <p className="text-xs uppercase tracking-[0.15em] text-muted font-medium">Staff</p>
          <p className="text-3xl font-light mt-3">{staff.filter((s) => s.role === "STAFF").length}</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="bg-white border border-gray-100 rounded-sm">
        <StaffTable />
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
