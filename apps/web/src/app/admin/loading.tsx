import { DashboardSkeleton } from "@/components/admin/dashboard/DashboardSkeleton";

export default function AdminLoading() {
  // We use the Dashboard Skeleton for the generic admin loading
  // The AdminLayout handles the sidebar and header, so we only need the content part
  return <DashboardSkeleton />;
}
