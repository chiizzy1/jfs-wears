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
          <h1 className="text-3xl font-light tracking-tight">Staff Management</h1>
          <p className="text-gray-500 mt-1 text-sm uppercase tracking-wider">Team & Access Control</p>
        </div>
        <div className="flex gap-2">
          <Button onClick={() => setIsModalOpen(true)} variant="premium" className="flex items-center gap-2">
            <Plus className="w-4 h-4" />
            Add Staff
          </Button>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 divide-y md:divide-y-0 md:divide-x divide-gray-200">
        <div className="px-6 first:pl-0">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">Total Staff</p>
          <p className="text-4xl font-light mt-2 tracking-tight">{staff.length}</p>
        </div>
        <div className="px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">Admins</p>
          <p className="text-4xl font-light mt-2 tracking-tight">{staff.filter((s) => s.role === "ADMIN").length}</p>
        </div>
        <div className="px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">Managers</p>
          <p className="text-4xl font-light mt-2 tracking-tight">{staff.filter((s) => s.role === "MANAGER").length}</p>
        </div>
        <div className="px-6">
          <p className="text-[10px] uppercase tracking-[0.2em] text-gray-500 font-medium">Staff</p>
          <p className="text-4xl font-light mt-2 tracking-tight">{staff.filter((s) => s.role === "STAFF").length}</p>
        </div>
      </div>

      {/* Staff Table */}
      <div className="border-t border-gray-100">
        <StaffTable />
      </div>

      {/* Add Staff Modal */}
      <AddStaffModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} />
    </div>
  );
}
