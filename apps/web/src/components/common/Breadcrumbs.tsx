"use client";

import Link from "next/link";
import { ChevronRight, Home } from "lucide-react";
import { getBreadcrumbSchema } from "@/lib/structured-data";

interface BreadcrumbsProps {
  items: {
    label: string;
    href: string;
  }[];
}

export function Breadcrumbs({ items }: BreadcrumbsProps) {
  // Generate schema for search engines
  const breadcrumbSchema = getBreadcrumbSchema(
    items.map((item) => ({
      name: item.label,
      item: item.href,
    }))
  );

  return (
    <nav aria-label="Breadcrumb" className="mb-6">
      {/* Inject JSON-LD Schema */}
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbSchema) }} />

      <ol className="flex items-center space-x-2 text-sm text-gray-500">
        <li>
          <Link href="/" className="flex items-center hover:text-primary transition-colors">
            <Home className="h-4 w-4" />
            <span className="sr-only">Home</span>
          </Link>
        </li>

        {items.map((item, index) => (
          <li key={item.href} className="flex items-center">
            <ChevronRight className="h-4 w-4 mx-1 text-gray-400" />
            {index === items.length - 1 ? (
              <span className="font-medium text-primary line-clamp-1 max-w-[200px] sm:max-w-xs">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-primary transition-colors line-clamp-1 max-w-[150px] sm:max-w-none">
                {item.label}
              </Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}
