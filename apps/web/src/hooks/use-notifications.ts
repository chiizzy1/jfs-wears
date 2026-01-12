/**
 * Notifications Hook
 *
 * Provides hooks for fetching and managing admin notifications
 * with automatic polling for real-time updates.
 */

import { adminAPI } from "@/lib/admin-api";
import { useApiQuery, useApiMutation } from "./use-api";

// ========================================
// Types
// ========================================

export interface Notification {
  id: string;
  type: "ORDER_NEW" | "ORDER_STATUS" | "REVIEW_NEW" | "LOW_STOCK" | "STAFF_LOGIN";
  title: string;
  message: string;
  link?: string;
  isRead: boolean;
  readAt?: string;
  metadata?: Record<string, unknown>;
  createdAt: string;
}

export interface NotificationsResponse {
  items: Notification[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// ========================================
// Hooks
// ========================================

/**
 * Fetch notifications with automatic polling
 */
export function useNotifications(options?: { unreadOnly?: boolean; limit?: number }) {
  const { unreadOnly = false, limit = 10 } = options || {};

  return useApiQuery<NotificationsResponse>(
    ["admin", "notifications", { unreadOnly, limit }],
    () => adminAPI.get<NotificationsResponse>(`/admin/notifications?unreadOnly=${unreadOnly}&limit=${limit}`),
    {
      // Poll every 30 seconds for new notifications
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
      staleTime: 10000, // Consider data stale after 10 seconds
    }
  );
}

/**
 * Fetch unread count for badge display
 */
export function useUnreadCount() {
  return useApiQuery<{ count: number }>(
    ["admin", "notifications", "unread-count"],
    () => adminAPI.get<{ count: number }>("/admin/notifications/unread-count"),
    {
      // Poll every 30 seconds
      refetchInterval: 30000,
      refetchIntervalInBackground: false,
      staleTime: 10000,
    }
  );
}

/**
 * Mark a single notification as read
 */
export function useMarkAsRead() {
  return useApiMutation<Notification, string>((id: string) => adminAPI.patch<Notification>(`/admin/notifications/${id}/read`), {
    showSuccessToast: false,
    invalidateKeys: [
      ["admin", "notifications"],
      ["admin", "notifications", "unread-count"],
    ],
  });
}

/**
 * Mark all notifications as read
 */
export function useMarkAllAsRead() {
  return useApiMutation<{ success: boolean; count: number }, void>(
    () => adminAPI.patch<{ success: boolean; count: number }>("/admin/notifications/read-all"),
    {
      successMessage: "All notifications marked as read",
      invalidateKeys: [
        ["admin", "notifications"],
        ["admin", "notifications", "unread-count"],
      ],
    }
  );
}
