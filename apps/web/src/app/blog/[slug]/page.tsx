import { blogService } from "@/services/blog.service";
import { constructMetadata } from "@/lib/seo";
import { Breadcrumbs } from "@/components/common/Breadcrumbs";
import { format } from "date-fns";
import Image from "next/image";
import { notFound } from "next/navigation";
import { Metadata } from "next";

export const dynamic = "force-dynamic";

interface PageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const { slug } = await params;
  try {
    const post = await blogService.getBySlug(slug);
    if (!post) return constructMetadata({ title: "Article Not Found" });

    return constructMetadata({
      title: post.metaTitle || post.title,
      description: post.metaDescription || post.excerpt,
      image: post.coverImage,
      type: "article",
    });
  } catch (error) {
    return constructMetadata({ title: "Article Not Found" });
  }
}

export default async function BlogPostPage({ params }: PageProps) {
  const { slug } = await params;
  let post;

  try {
    post = await blogService.getBySlug(slug);
  } catch (error) {
    notFound();
  }

  if (!post) {
    notFound();
  }

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    headline: post.title,
    image: post.coverImage ? [post.coverImage] : [],
    datePublished: post.publishedAt,
    dateModified: post.updatedAt,
    author: [
      {
        "@type": "Person",
        name: post.author?.name || post.authorName || "JFS Wears Team",
      },
    ],
    publisher: {
      "@type": "Organization",
      name: "JFS Wears",
      logo: {
        "@type": "ImageObject",
        url: "https://jfswears.com/logo.png", // Replace with actual logo URL if available
      },
    },
    description: post.excerpt,
  };

  return (
    <main className="min-h-screen bg-white" itemScope itemType="https://schema.org/BlogPosting">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }} />

      {/* Hero Section */}
      <header className="relative h-[60vh] min-h-[400px]">
        {post.coverImage && (
          <Image src={post.coverImage} alt={post.title} fill className="object-cover" priority itemProp="image" />
        )}
        <div className="absolute inset-0 bg-linear-to-t from-black/80 via-black/40 to-transparent" />
        <div className="absolute bottom-0 left-0 right-0 p-8 md:p-12 text-white">
          <div className="container-width max-w-4xl mx-auto">
            <div className="mb-6">
              <Breadcrumbs
                items={[
                  { label: "Home", href: "/" },
                  { label: "Blog", href: "/blog" },
                  { label: post.title, href: `/blog/${post.slug}` },
                ]}
              />
            </div>

            <div className="flex items-center gap-4 text-sm md:text-base text-white/80 mb-4 font-light tracking-wide">
              <span itemProp="datePublished" content={post.publishedAt || post.createdAt}>
                {post.publishedAt
                  ? format(new Date(post.publishedAt), "MMMM d, yyyy")
                  : format(new Date(post.createdAt), "MMMM d, yyyy")}
              </span>
              {post.readTime && (
                <>
                  <span className="w-1 h-1 rounded-full bg-white/50" />
                  <span>{post.readTime} min read</span>
                </>
              )}
            </div>

            <h1
              className="text-3xl md:text-5xl lg:text-6xl font-light tracking-tight leading-tight max-w-3xl"
              itemProp="headline"
            >
              {post.title}
            </h1>
          </div>
        </div>
      </header>

      {/* Content */}
      <div className="container-width max-w-3xl mx-auto px-4 py-16 md:py-24">
        {/* Author info (optional, can be expanded) */}
        {(post.author?.name || post.authorName) && (
          <div
            className="mb-12 flex items-center gap-4 border-b border-gray-100 pb-8"
            itemProp="author"
            itemScope
            itemType="https://schema.org/Person"
          >
            <div className="w-12 h-12 rounded-full bg-gray-100 flex items-center justify-center text-gray-400 uppercase font-bold text-lg">
              {post.author?.name?.[0] || post.authorName?.[0] || "J"}
            </div>
            <div>
              <p className="text-sm text-gray-400 uppercase tracking-widest">Written by</p>
              <p className="font-medium text-lg" itemProp="name">
                {post.author?.name || post.authorName}
              </p>
            </div>
          </div>
        )}

        <article
          itemProp="articleBody"
          className="prose prose-lg prose-neutral max-w-none 
          prose-headings:font-light prose-headings:tracking-tight 
          prose-p:text-gray-600 prose-p:leading-loose
          prose-a:text-primary prose-a:no-underline prose-a:border-b prose-a:border-primary/20 hover:prose-a:border-primary
          prose-img:rounded-sm prose-img:shadow-sm"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />

        {/* Tags */}
        {post.tags && post.tags.length > 0 && (
          <div className="mt-16 pt-8 border-t border-gray-100">
            <h3 className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Tags</h3>
            <div className="flex flex-wrap gap-2" itemProp="keywords">
              {post.tags.map((tag: string) => (
                <span key={tag} className="px-3 py-1 bg-secondary text-gray-600 text-sm rounded-full">
                  {tag}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>
    </main>
  );
}
