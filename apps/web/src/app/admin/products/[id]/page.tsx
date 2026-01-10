import { ProductEditClient } from "@/components/admin/products/ProductEditClient";

export default function EditProductPage({ params }: { params: { id: string } }) {
  return <ProductEditClient id={params.id} />;
}
