import { MetadataRoute } from "next";
import { fetchProducts, fetchCategories } from "@/lib/api";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = "https://jfs-wears.com";

  // Static routes
  const staticRoutes = ["", "/shop", "/account", "/cart", "/login", "/register"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // Fetch data
  const [productsResult, categories] = await Promise.all([
    fetchProducts({ limit: 1000 }), // Fetch all products for sitemap
    fetchCategories(),
  ]);

  // Product routes
  const productRoutes = productsResult.products.map((product) => ({
    url: `${baseUrl}/product/${product.slug}`,
    lastModified: new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }));

  // Collection routes (Programmatic SEO)
  const genders = ["men", "women"];
  const collectionRoutes: MetadataRoute.Sitemap = [];

  // 1. Gender roots
  for (const gender of genders) {
    collectionRoutes.push({
      url: `${baseUrl}/collections/${gender}`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    });

    // 2. Gender + Category combinations
    for (const category of categories) {
      collectionRoutes.push({
        url: `${baseUrl}/collections/${gender}/${category.slug}`,
        lastModified: new Date(),
        changeFrequency: "weekly" as const,
        priority: 0.8,
      });
    }
  }

  return [...staticRoutes, ...collectionRoutes, ...productRoutes];
}
