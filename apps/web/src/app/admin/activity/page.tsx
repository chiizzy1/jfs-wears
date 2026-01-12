"use client";

import { useState, useEffect } from "react";
import { apiClient } from "@/lib/api-client";
import { Button } from "@/components/ui/button";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Loader2, Clock, User, FileText, ChevronLeft, ChevronRight } from "lucide-react";

interface AuditLog {
  id: string;
  staffId: string | null;
  staffEmail: string | null;
  staffName: string | null;
  action: string;
  entity: string;
  entityId: string | null;
  description: string;
  metadata: any;
  ipAddress: string | null;
  createdAt: string;
  staff: {
    id: string;
    name: string;
    email: string;
    role: string;
  } | null;
}

interface AuditLogResponse {
  logs: AuditLog[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

const ACTION_LABELS: Record<string, { label: string; color: string }> = {
  LOGIN: { label: "Login", color: "bg-blue-100 text-blue-700" },
  LOGOUT: { label: "Logout", color: "bg-gray-100 text-gray-700" },
  PASSWORD_CHANGE: { label: "Password Change", color: "bg-yellow-100 text-yellow-700" },
  CREATE: { label: "Create", color: "bg-green-100 text-green-700" },
  UPDATE: { label: "Update", color: "bg-blue-100 text-blue-700" },
  DELETE: { label: "Delete", color: "bg-red-100 text-red-700" },
  RESTORE: { label: "Restore", color: "bg-purple-100 text-purple-700" },
  ORDER_STATUS_UPDATE: { label: "Order Status", color: "bg-orange-100 text-orange-700" },
  ORDER_CANCEL: { label: "Order Cancel", color: "bg-red-100 text-red-700" },
  ORDER_REFUND: { label: "Order Refund", color: "bg-pink-100 text-pink-700" },
  SETTINGS_UPDATE: { label: "Settings", color: "bg-indigo-100 text-indigo-700" },
  EXPORT_DATA: { label: "Export", color: "bg-teal-100 text-teal-700" },
};

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

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;

    return date.toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getActionBadge = (action: string) => {
    const config = ACTION_LABELS[action] || { label: action, color: "bg-gray-100 text-gray-700" };
    return (
      <span className={`text-[10px] font-medium uppercase tracking-widest px-2 py-0.5 ${config.color}`}>{config.label}</span>
    );
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-xs uppercase tracking-[0.15em] font-medium text-muted-foreground">Security</h1>
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
          <span className="text-xs text-muted-foreground">{total} activities</span>
        </div>
      </div>

      {/* Activity List */}
      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <Loader2 className="w-6 h-6 animate-spin text-muted-foreground" />
        </div>
      ) : logs.length === 0 ? (
        <div className="flex flex-col items-center justify-center h-64 text-muted-foreground">
          <FileText className="w-12 h-12 mb-4 opacity-30" />
          <p className="text-sm">No activity logs found</p>
        </div>
      ) : (
        <div className="space-y-1">
          {logs.map((log) => (
            <div key={log.id} className="flex items-start gap-4 p-4 hover:bg-gray-50 transition-colors border-b border-gray-100">
              {/* Avatar */}
              <div className="w-8 h-8 bg-black text-white flex items-center justify-center text-xs font-medium flex-shrink-0">
                {log.staff?.name?.[0]?.toUpperCase() || log.staffName?.[0]?.toUpperCase() || "?"}
              </div>

              {/* Content */}
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-medium text-sm truncate">{log.staff?.name || log.staffName || "Unknown"}</span>
                  {getActionBadge(log.action)}
                  <span className="text-xs text-muted-foreground">{log.entity}</span>
                </div>
                <p className="text-sm text-muted-foreground truncate">{log.description}</p>
              </div>

              {/* Time */}
              <div className="flex items-center gap-1 text-xs text-muted-foreground flex-shrink-0">
                <Clock className="w-3 h-3" />
                {formatDate(log.createdAt)}
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between pt-4 border-t border-gray-100">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.max(1, p - 1))}
            disabled={page === 1}
            className="text-xs uppercase tracking-widest"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Previous
          </Button>
          <span className="text-xs text-muted-foreground">
            Page {page} of {totalPages}
          </span>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
            disabled={page === totalPages}
            className="text-xs uppercase tracking-widest"
          >
            Next
            <ChevronRight className="w-4 h-4 ml-1" />
          </Button>
        </div>
      )}
    </div>
  );
}
