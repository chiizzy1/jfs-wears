"use client";

import { ProductEditClient } from "@/components/admin/products/ProductEditClient";
import { use } from "react";

export default function EditProductPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  return <ProductEditClient id={id} />;
}
