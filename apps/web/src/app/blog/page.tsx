import { blogService } from "@/services/blog.service";
import { constructMetadata } from "@/lib/seo";
import { PageHero } from "@/components/common/PageHero";
import Link from "next/link";
import { format } from "date-fns";
import Image from "next/image";
import { ArrowRight } from "lucide-react";

function stripHtml(html: string) {
  return html.replace(/<[^>]*>?/gm, "") || "";
}

export const metadata = constructMetadata({
  title: "Fashion & Style Blog | JFS Wears",
  description: "Discover the latest fashion trends, style tips, and news from JFS Wears.",
});

export const dynamic = "force-dynamic";

export default async function BlogIndexPage() {
  const posts = await blogService.getAllPublished();

  return (
    <div className="min-h-screen bg-secondary">
      <PageHero
        title="The Journal"
        description="Stories about fashion, culture, and the art of dressing well."
        breadcrumbs={[
          { label: "Home", href: "/" },
          { label: "Blog", href: "/blog" },
        ]}
      />

      <div className="container-width py-12 px-4 md:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {posts.map((post) => (
            <Link
              key={post.id}
              href={`/blog/${post.slug}`}
              className="group block bg-white border border-gray-100 overflow-hidden hover:shadow-lg transition-all duration-300"
            >
              <div className="aspect-video relative bg-gray-100 overflow-hidden">
                {post.coverImage ? (
                  <Image
                    src={post.coverImage}
                    alt={post.title}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-300 bg-gray-50">
                    <span className="text-4xl font-thin opacity-20">JFS</span>
                  </div>
                )}
              </div>
              <div className="p-6">
                <div className="flex items-center gap-2 text-xs font-medium text-primary mb-3">
                  <span className="uppercase tracking-wider">Article</span>
                  <span className="w-1 h-1 rounded-full bg-primary/40" />
                  <span>
                    {new Date(post.publishedAt || post.createdAt).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>

                <h2 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors text-gray-900 line-clamp-2">
                  {post.title}
                </h2>

                <p className="text-gray-700 line-clamp-3 mb-4 leading-relaxed">
                  {post.excerpt || stripHtml(post.content).slice(0, 150) + "..."}
                </p>

                <div className="flex items-center justify-between text-sm mt-auto pt-4 border-t border-gray-100">
                  <span className="text-gray-600 font-medium">By {post.author?.name || "JFS Team"}</span>
                  <span className="flex items-center text-primary font-medium group/btn">
                    Read more
                    <ArrowRight className="w-4 h-4 ml-1 transition-transform group-hover/btn:translate-x-1" />
                  </span>
                </div>
              </div>
            </Link>
          ))}
        </div>

        {posts.length === 0 && (
          <div className="text-center py-20">
            <p className="text-gray-400 text-lg">No stories published yet.</p>
          </div>
        )}
      </div>
    </div>
  );
}
