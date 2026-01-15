import { MetadataRoute } from "next";

export default function robots(): MetadataRoute.Robots {
  const baseUrl = "https://jfs-wears.com";

  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/account/"],
      },
      {
        userAgent: ["GPTBot", "ClaudeBot", "Google-Extended"],
        allow: "/",
        disallow: ["/admin/", "/account/"],
      },
    ],
    sitemap: `${baseUrl}/sitemap.xml`,
  };
}
