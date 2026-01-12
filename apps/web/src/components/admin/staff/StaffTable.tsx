"use client";

import { useMemo, useState } from "react";
import { Staff } from "@/lib/admin-api";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useStaff } from "@/hooks/use-staff";
import { Button } from "@/components/ui/button";
import { ConfirmDialog } from "@/components/ui/confirm-dialog";
import { EditStaffModal } from "./EditStaffModal";

export function StaffTable() {
  const { staff, isLoading, deleteStaff } = useStaff();
  const [editingStaff, setEditingStaff] = useState<Staff | null>(null);
  const [deleteConfirm, setDeleteConfirm] = useState<{ isOpen: boolean; staff: Staff | null }>({
    isOpen: false,
    staff: null,
  });

  const handleDeleteConfirm = () => {
    if (deleteConfirm.staff) {
      deleteStaff.mutate(deleteConfirm.staff.id);
    }
  };

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        accessorKey: "name",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Name</span>,
        cell: ({ row }) => (
          <span className="font-medium text-sm text-primary uppercase tracking-wide">{row.getValue("name")}</span>
        ),
      },
      {
        accessorKey: "email",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Email</span>,
        cell: ({ row }) => <span className="text-xs text-muted-foreground">{row.getValue("email")}</span>,
      },
      {
        accessorKey: "role",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Role</span>,
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          return <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">{role}</span>;
        },
      },
      {
        accessorKey: "status",
        header: () => <span className="text-xs uppercase tracking-widest text-muted-foreground font-medium">Status</span>,
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <div className="flex items-center gap-2">
              <div className={`w-1.5 h-1.5 rounded-full ${isActive ? "bg-green-500" : "bg-red-500"}`} />
              <span className="text-xs uppercase tracking-widest font-medium text-muted-foreground">
                {isActive ? "Active" : "Inactive"}
              </span>
            </div>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const staffMember = row.original;
          return (
            <div className="flex justify-end gap-4">
              <Button
                variant="ghost"
                className="h-auto p-0 text-xs uppercase tracking-widest hover:text-black hover:bg-transparent hover:underline underline-offset-4"
                onClick={() => setEditingStaff(staffMember)}
              >
                Edit
              </Button>
              <Button
                variant="ghost"
                className="h-auto p-0 text-xs uppercase tracking-widest hover:text-red-600 hover:bg-transparent text-gray-400"
                onClick={() => setDeleteConfirm({ isOpen: true, staff: staffMember })}
                disabled={deleteStaff.isPending}
              >
                Delete
              </Button>
            </div>
          );
        },
      },
    ],
    [deleteStaff]
  );

  if (isLoading) {
    return <div>Loading staff...</div>;
  }

  return (
    <>
      <DataTable columns={columns} data={staff} searchKey="name" />
      <EditStaffModal isOpen={!!editingStaff} onClose={() => setEditingStaff(null)} staff={editingStaff} />

      {/* Delete Confirmation Dialog */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, staff: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Staff Member"
        message={`Are you sure you want to delete "${deleteConfirm.staff?.name}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        icon="delete"
      />
    </>
  );
}
