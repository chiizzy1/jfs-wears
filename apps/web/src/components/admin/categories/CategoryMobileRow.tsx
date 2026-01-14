import { Category } from "@/types/category.types";
import { MobileRow, MobileRowItem } from "@/components/ui/data-table/mobile-row";

interface CategoryMobileRowProps {
  category: Category;
  className?: string;
}

export function CategoryMobileRow({ category, className }: CategoryMobileRowProps) {
  return (
    <MobileRow className={className}>
      <MobileRowItem label="Slug" fullWidth>
        <span className="text-gray-500 font-mono text-sm break-all">{category.slug}</span>
      </MobileRowItem>

      <MobileRowItem label="Description" fullWidth>
        <span className="text-gray-500 text-sm block">{category.description || "—"}</span>
      </MobileRowItem>

      <MobileRowItem label="Products" fullWidth>
        <span
          className={`inline-flex items-center justify-center min-w-8 px-2 py-1 text-xs font-medium rounded-none ${
            (category._count?.products || 0) > 0 ? "bg-blue-50 text-blue-700" : "bg-gray-50 text-gray-500"
          }`}
        >
          {category._count?.products || 0}
        </span>
      </MobileRowItem>
    </MobileRow>
  );
}
