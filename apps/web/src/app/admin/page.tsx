"use client";

import { DashboardView } from "@/components/admin/dashboard/DashboardView";

/**
 * Admin Dashboard Page
 * Thin wrapper following the "thin page" pattern from rules.md
 * All logic is delegated to DashboardView component
 */
export default function AdminDashboard() {
  return <DashboardView />;
}
