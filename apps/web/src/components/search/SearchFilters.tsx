import { Category } from "@/lib/api";
import { Button } from "@/components/ui/button";

interface SearchFiltersProps {
  categories: Category[];
  activeCategory: string;
  activeGender: string;
  localFilters: { minPrice: string; maxPrice: string };
  setLocalFilters: (filters: { minPrice: string; maxPrice: string }) => void;
  sortBy: string;
  onUpdateFilter: (key: string, value: string) => void;
  onApplyPriceFilter: () => void;
  onClearFilters: () => void;
  hasActiveFilters: boolean;
}

export function SearchFilters({
  categories,
  activeCategory,
  activeGender,
  localFilters,
  setLocalFilters,
  sortBy,
  onUpdateFilter,
  onApplyPriceFilter,
  onClearFilters,
  hasActiveFilters,
}: SearchFiltersProps) {
  return (
    <div className="bg-white rounded-2xl p-6 shadow-sm sticky top-24 border border-gray-100">
      <div className="flex items-center justify-between mb-6">
        <h2 className="font-semibold text-sm uppercase tracking-wide">Filters</h2>
        {hasActiveFilters && (
          <button onClick={onClearFilters} className="text-xs text-red-500 hover:text-red-700 font-medium">
            Clear all
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">Category</h3>
        <div className="space-y-1">
          <button
            onClick={() => onUpdateFilter("category", "")}
            className={`block text-sm w-full text-left px-3 py-2 rounded-md transition-colors ${
              !activeCategory ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
            }`}
          >
            All Categories
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => onUpdateFilter("category", cat.slug)}
              className={`block text-sm w-full text-left px-3 py-2 rounded-md transition-colors ${
                activeCategory === cat.slug ? "bg-black text-white" : "hover:bg-gray-50 text-gray-700"
              }`}
            >
              {cat.name}
            </button>
          ))}
        </div>
      </div>

      {/* Gender Filter */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">Gender</h3>
        <div className="flex flex-wrap gap-2">
          {["", "men", "women", "unisex"].map((g) => (
            <button
              key={g || "all"}
              onClick={() => onUpdateFilter("gender", g)}
              className={`px-3 py-1.5 text-xs font-medium rounded-full border transition-colors ${
                activeGender === g
                  ? "bg-black text-white border-black"
                  : "bg-white text-gray-700 border-gray-200 hover:border-gray-300"
              }`}
            >
              {g === "" ? "All" : g.charAt(0).toUpperCase() + g.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Price Range Filter */}
      <div className="mb-8">
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">Price Range (₦)</h3>
        <div className="flex gap-2 mb-3">
          <input
            type="number"
            placeholder="Min"
            value={localFilters.minPrice}
            onChange={(e) => setLocalFilters({ ...localFilters, minPrice: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-black bg-gray-50"
          />
          <input
            type="number"
            placeholder="Max"
            value={localFilters.maxPrice}
            onChange={(e) => setLocalFilters({ ...localFilters, maxPrice: e.target.value })}
            className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-black bg-gray-50"
          />
        </div>
        <Button variant="outline" size="sm" className="w-full text-xs" onClick={onApplyPriceFilter}>
          Apply Price
        </Button>
      </div>

      {/* Sort */}
      <div>
        <h3 className="text-xs font-semibold uppercase tracking-wider mb-3 text-gray-500">Sort By</h3>
        <select
          value={sortBy}
          onChange={(e) => onUpdateFilter("sort", e.target.value)}
          className="w-full px-3 py-2 border border-gray-200 rounded-md text-sm focus:outline-none focus:border-black bg-white cursor-pointer"
        >
          <option value="newest">Newest</option>
          <option value="price-low">Price: Low to High</option>
          <option value="price-high">Price: High to Low</option>
        </select>
      </div>
    </div>
  );
}
