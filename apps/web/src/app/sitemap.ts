import { MetadataRoute } from "next";

export default function sitemap(): MetadataRoute.Sitemap {
  const baseUrl = "https://jfs-wears.com";

  // Static routes
  const routes = ["", "/shop", "/account", "/cart", "/login", "/register"].map((route) => ({
    url: `${baseUrl}${route}`,
    lastModified: new Date(),
    changeFrequency: "daily" as const,
    priority: route === "" ? 1 : 0.8,
  }));

  // In a real app, you would fetch products/categories here and add them to the sitemap
  // const products = await getProducts();
  // const productUrls = products.map(...)

  return [...routes];
}
