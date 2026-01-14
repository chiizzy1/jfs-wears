"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { ActivityLogsTable, AuditLog } from "@/components/admin/activity/ActivityLogsTable";

interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ENTITY_TYPES = ["All", "Order", "Product", "Staff", "Category", "Promotion", "Settings"];

export default function ActivityPage() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [entityFilter, setEntityFilter] = useState("All");

  useEffect(() => {
    fetchLogs();
  }, [page, entityFilter]);

  const fetchLogs = async () => {
    setIsLoading(true);
    try {
      const params = new URLSearchParams({
        page: page.toString(),
        limit: "25",
      });
      if (entityFilter !== "All") {
        params.append("entity", entityFilter);
      }

      const data = await apiClient.get<AuditLogResponse>(`/audit-logs?${params}`);
      setLogs(data.logs);
      setTotalPages(data.totalPages);
      setTotal(data.total);
    } catch (error) {
      console.error("Failed to fetch audit logs:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-black">Security</h1>
          <p className="text-2xl font-light mt-1">Activity Log</p>
        </div>
        <div className="flex items-center gap-4">
          <Select
            value={entityFilter}
            onValueChange={(v) => {
              setEntityFilter(v);
              setPage(1);
            }}
          >
            <SelectTrigger className="w-[140px] h-9 text-xs uppercase tracking-widest">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {ENTITY_TYPES.map((type) => (
                <SelectItem key={type} value={type} className="text-xs uppercase tracking-widest">
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <span className="text-xs text-gray-500">{total} activities</span>
        </div>
      </div>

      {/* Activity Logs Table */}
      <ActivityLogsTable logs={logs} isLoading={isLoading} page={page} totalPages={totalPages} onPageChange={setPage} />
    </div>
  );
}
