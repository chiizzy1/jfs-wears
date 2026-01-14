import { Product } from "@/lib/admin-api";
import { cn } from "@/lib/utils";
import { MobileRow, MobileRowItem } from "@/components/ui/data-table/mobile-row";

interface ProductMobileRowProps {
  product: Product;
  className?: string;
}

export function ProductMobileRow({ product, className }: ProductMobileRowProps) {
  // Helper for stock status (duplicated logic for consistency, could be shared)
  const getStockStatus = (product: Product) => {
    const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
    if (totalStock === 0) return "Out of Stock";
    if (totalStock <= 10) return "Low Stock";
    return "Active";
  };

  const status = getStockStatus(product);
  const totalStock = product.variants?.reduce((sum, v) => sum + v.stock, 0) || 0;
  const price = product.basePrice || product.price || 0;

  return (
    <MobileRow>
      <MobileRowItem label="Category">{product.category?.name || "—"}</MobileRowItem>

      <MobileRowItem label="Price">₦{price.toLocaleString()}</MobileRowItem>

      <MobileRowItem label="Stock">
        <span className="font-mono">{totalStock}</span>
      </MobileRowItem>

      <MobileRowItem label="Status">
        <span
          className={cn(
            "text-xs uppercase tracking-wider font-medium inline-block px-2 py-0.5 rounded-none",
            status === "Active" && "bg-green-100 text-green-700",
            status === "Low Stock" && "bg-amber-100 text-amber-700",
            status === "Out of Stock" && "bg-red-100 text-red-700"
          )}
        >
          {status}
        </span>
      </MobileRowItem>
    </MobileRow>
  );
}
