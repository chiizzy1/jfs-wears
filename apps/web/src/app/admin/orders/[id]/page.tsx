import { OrderDetailView } from "@/components/admin/orders/OrderDetailView";

interface OrderDetailPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Order Detail Page (Server Component)
 * OrderDetailView is a Client Component handling all interactivity.
 */
export default async function OrderDetailPage({ params }: OrderDetailPageProps) {
  const { id } = await params;
  return <OrderDetailView orderId={id} />;
}
