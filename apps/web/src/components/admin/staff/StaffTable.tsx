"use client";

import { useMemo } from "react";
import { Staff } from "@/lib/admin-api";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ColumnDef } from "@tanstack/react-table";
import { useStaff } from "@/hooks/use-staff";
import { Button } from "@/components/ui/button";
import { Trash2 } from "lucide-react";

export function StaffTable() {
  const { staff, isLoading, deleteStaff } = useStaff();

  const columns = useMemo<ColumnDef<Staff>[]>(
    () => [
      {
        accessorKey: "name",
        header: "Name",
        cell: ({ row }) => <div className="font-medium">{row.getValue("name")}</div>,
      },
      {
        accessorKey: "email",
        header: "Email",
      },
      {
        accessorKey: "role",
        header: "Role",
        cell: ({ row }) => {
          const role = row.getValue("role") as string;
          let badgeClass = "bg-gray-100 text-gray-800";
          if (role === "ADMIN") badgeClass = "bg-purple-100 text-purple-800";
          else if (role === "MANAGER") badgeClass = "bg-blue-100 text-blue-800";

          return <span className={`px-2 py-1 rounded-full text-xs font-semibold ${badgeClass}`}>{role}</span>;
        },
      },
      {
        accessorKey: "status",
        header: "Status",
        cell: ({ row }) => {
          const isActive = row.original.isActive;
          return (
            <span
              className={`px-2 py-1 rounded-full text-xs font-semibold ${
                isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800"
              }`}
            >
              {isActive ? "Active" : "Inactive"}
            </span>
          );
        },
      },
      {
        id: "actions",
        cell: ({ row }) => {
          const staffMember = row.original;
          return (
            <div className="flex justify-end">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => {
                  if (confirm("Are you sure you want to delete this staff member?")) {
                    deleteStaff.mutate(staffMember.id);
                  }
                }}
                disabled={deleteStaff.isPending}
              >
                <Trash2 className="h-4 w-4 text-red-500" />
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

  return <DataTable columns={columns} data={staff} searchKey="name" />;
}
