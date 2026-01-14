import { ProductEditClient } from "@/components/admin/products/ProductEditClient";

interface EditProductPageProps {
  params: Promise<{ id: string }>;
}

/**
 * Edit Product Page (Server Component)
 * ProductEditClient is a Client Component handling all interactivity.
 */
export default async function EditProductPage({ params }: EditProductPageProps) {
  const { id } = await params;
  return <ProductEditClient id={id} />;
}
