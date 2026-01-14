"use client";

import { useParams } from "next/navigation";
import { OrderDetailView } from "@/components/admin/orders/OrderDetailView";

export default function OrderDetailPage() {
  const params = useParams();
  const orderId = params.id as string;

  return <OrderDetailView orderId={orderId} />;
}
