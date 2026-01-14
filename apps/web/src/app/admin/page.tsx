import { DashboardView } from "@/components/admin/dashboard/DashboardView";

/**
 * Admin Dashboard Page (Server Component)
 *
 * Thin wrapper following the "thin page" pattern.
 * DashboardView is a Client Component that handles all interactivity.
 * Auth is verified by proxy.ts before reaching this page.
 */
export default function AdminDashboard() {
  return <DashboardView />;
}
