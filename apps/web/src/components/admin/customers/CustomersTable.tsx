"use client";

import { useMemo, useState } from "react";
import { ColumnDef } from "@tanstack/react-table";
import { TableSkeleton } from "@/components/admin/skeletons/TableSkeleton";
import { User } from "@/lib/admin-api";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { Button } from "@/components/ui/button";
import { formatDate } from "@/lib/format";
import { getCustomersColumns } from "./customers-columns";
import { CustomerMobileRow } from "./CustomerMobileRow";

interface CustomersTableProps {
  data: User[];
  isLoading: boolean;
  onDelete: (id: string, name: string) => void;
}

export function CustomersTable({ data, isLoading, onDelete }: CustomersTableProps) {
  const [globalFilter, setGlobalFilter] = useState("");

  const columns = useMemo(() => getCustomersColumns({ onDelete }), [onDelete]);

  return isLoading ? (
    <TableSkeleton />
  ) : (
    <div className="rounded-none border-t border-gray-100">
      {/* @ts-ignore */}
      <DataTable
        columns={columns}
        data={data}
        searchKey="email"
        meta={{
          pluralName: "Customers",
        }}
        renderSubComponent={(props) => <CustomerMobileRow customer={props.row.original} />}
      />
    </div>
  );
}
