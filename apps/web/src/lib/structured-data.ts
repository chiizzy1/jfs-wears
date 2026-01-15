import { WithContext, Organization, WebSite, BreadcrumbList, Product, ImageObject } from "schema-dts";

export function getOrganizationSchema(): WithContext<Organization> {
  return {
    "@context": "https://schema.org",
    "@type": "Organization",
    name: "JFS Wears",
    url: "https://jfs-wears.com",
    logo: "https://jfs-wears.com/logo.png",
    sameAs: [
      // Add social media URLs here when available
      // 'https://twitter.com/jfswears',
      // 'https://instagram.com/jfswears'
    ],
    contactPoint: {
      "@type": "ContactPoint",
      telephone: "+234-000-000-0000", // Placeholder
      contactType: "customer service",
      areaServed: "NG",
      availableLanguage: "en",
    },
  };
}

export function getWebSiteSchema(): WithContext<WebSite> {
  return {
    "@context": "https://schema.org",
    "@type": "WebSite",
    name: "JFS Wears",
    url: "https://jfs-wears.com",
    potentialAction: {
      "@type": "SearchAction",
      target: {
        "@type": "EntryPoint",
        urlTemplate: "https://jfs-wears.com/search?q={search_term_string}",
      },
      "query-input": "required name=search_term_string",
    } as any,
  };
}

export function getBreadcrumbSchema(items: { name: string; item: string }[]): WithContext<BreadcrumbList> {
  return {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    itemListElement: items.map((item, index) => ({
      "@type": "ListItem",
      position: index + 1,
      name: item.name,
      item: item.item,
    })),
  };
}

export function getProductSchema(product: {
  name: string;
  description: string;
  image: string;
  price: number;
  currency: string;
  availability: "https://schema.org/InStock" | "https://schema.org/OutOfStock";
  url: string;
  aggregateRating?: {
    ratingValue: number;
    reviewCount: number;
  };
}): WithContext<Product> {
  const schema: WithContext<Product> = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    description: product.description,
    image: product.image,
    sku: product.url.split("/").pop(),
    offers: {
      "@type": "Offer",
      price: product.price,
      priceCurrency: product.currency,
      availability: product.availability,
      url: product.url,
    },
  };

  if (product.aggregateRating && product.aggregateRating.reviewCount > 0) {
    schema.aggregateRating = {
      "@type": "AggregateRating",
      ratingValue: product.aggregateRating.ratingValue,
      reviewCount: product.aggregateRating.reviewCount,
    };
  }

  return schema;
}

export function getImageObjectSchema(url: string, caption?: string): WithContext<ImageObject> {
  return {
    "@context": "https://schema.org",
    "@type": "ImageObject",
    contentUrl: url,
    caption: caption,
  };
}
