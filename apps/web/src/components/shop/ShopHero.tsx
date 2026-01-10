import { Category } from "@/lib/api";

interface ShopHeroProps {
  category?: string;
  gender?: string;
  categories: Category[];
}

export function ShopHero({ category, gender, categories }: ShopHeroProps) {
  const title = category
    ? categories.find((c) => c.slug === category)?.name || "Shop"
    : gender
    ? gender === "men"
      ? "Men's Collection"
      : "Women's Collection"
    : "All Products";

  return (
    <div className="bg-primary text-white py-16">
      <div className="container-width text-center">
        <h1 className="text-4xl md:text-5xl font-bold mb-4">{title}</h1>
        <p className="text-gray-300 max-w-2xl mx-auto">Discover our curated collection of premium fashion pieces.</p>
      </div>
    </div>
  );
}
