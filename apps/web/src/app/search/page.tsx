import { constructMetadata } from "@/lib/seo";
import SearchPageClient from "@/components/search/SearchPageClient";

export const metadata = constructMetadata({
  title: "Search Results",
  description: "Find the best fashion items at JFS Wears.",
  noIndex: true,
});

export default function SearchPage() {
  return <SearchPageClient />;
}
