import { useState, useEffect } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Product, Category, fetchProducts, fetchCategories } from "@/lib/api";

export function useSearch() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [totalPages, setTotalPages] = useState(1);

  // Filter state from URL
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";
  const gender = searchParams.get("gender") || "";
  const minPrice = searchParams.get("minPrice") || "";
  const maxPrice = searchParams.get("maxPrice") || "";
  const sortBy = searchParams.get("sort") || "newest";
  const page = parseInt(searchParams.get("page") || "1");

  // Local filter state for form
  const [localFilters, setLocalFilters] = useState({
    minPrice: minPrice,
    maxPrice: maxPrice,
  });

  useEffect(() => {
    async function loadData() {
      setIsLoading(true);
      try {
        const [productsData, categoriesData] = await Promise.all([
          fetchProducts({
            search: query,
            category,
            gender: gender as "men" | "women" | "unisex" | undefined,
            page,
            limit: 12,
          }),
          fetchCategories(),
        ]);

        // Client-side price filtering (better done server-side in real app)
        let filtered = productsData.products;
        if (minPrice) {
          filtered = filtered.filter((p) => p.price >= parseInt(minPrice));
        }
        if (maxPrice) {
          filtered = filtered.filter((p) => p.price <= parseInt(maxPrice));
        }

        // Client-side sorting (better done server-side)
        if (sortBy === "price-low") {
          filtered.sort((a, b) => a.price - b.price);
        } else if (sortBy === "price-high") {
          filtered.sort((a, b) => b.price - a.price);
        }

        setProducts(filtered);
        setTotalPages(productsData.totalPages);
        setCategories(categoriesData);
      } catch (error) {
        console.error("Failed to load products:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, [query, category, gender, minPrice, maxPrice, sortBy, page]);

  const updateFilter = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (value) {
      params.set(key, value);
    } else {
      params.delete(key);
    }
    params.delete("page"); // Reset to page 1 when filtering
    router.push(`/search?${params.toString()}`);
  };

  const applyPriceFilter = () => {
    const params = new URLSearchParams(searchParams.toString());
    if (localFilters.minPrice) {
      params.set("minPrice", localFilters.minPrice);
    } else {
      params.delete("minPrice");
    }
    if (localFilters.maxPrice) {
      params.set("maxPrice", localFilters.maxPrice);
    } else {
      params.delete("maxPrice");
    }
    params.delete("page");
    router.push(`/search?${params.toString()}`);
  };

  const clearFilters = () => {
    router.push(`/search${query ? `?q=${query}` : ""}`);
    setLocalFilters({ minPrice: "", maxPrice: "" });
  };

  return {
    products,
    categories,
    isLoading,
    totalPages,
    query,
    category,
    gender,
    sortBy,
    page,
    localFilters,
    setLocalFilters,
    updateFilter,
    applyPriceFilter,
    clearFilters,
  };
}
