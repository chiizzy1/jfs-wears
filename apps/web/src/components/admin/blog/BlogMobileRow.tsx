import { BlogPost } from "@/types/blog";
import { MobileRow, MobileRowItem } from "@/components/ui/data-table/mobile-row";
import { format } from "date-fns";
import { Badge } from "@/components/ui/badge";

interface BlogMobileRowProps {
  post: BlogPost;
  className?: string; // Standardize prop name to post instead of category
}

export function BlogMobileRow({ post, className }: BlogMobileRowProps) {
  return (
    <MobileRow className={className}>
      <MobileRowItem label="Slug" fullWidth>
        <span className="text-gray-500 font-mono text-sm break-all">{post.slug}</span>
      </MobileRowItem>

      <MobileRowItem label="Author">
        <span className="text-sm text-gray-700">{post.author?.name || post.authorName || "Unknown"}</span>
      </MobileRowItem>

      <MobileRowItem label="Published">
        <span className="text-sm text-gray-500">
          {post.publishedAt ? format(new Date(post.publishedAt), "MMM d, yyyy") : "-"}
        </span>
      </MobileRowItem>

      <MobileRowItem label="Status" fullWidth>
        <Badge
          variant={post.isPublished ? "default" : "secondary"}
          className={
            post.isPublished
              ? "bg-green-100 text-green-700 hover:bg-green-200 border-none shadow-none font-medium text-xs w-full justify-center"
              : "bg-gray-100 text-gray-700 hover:bg-gray-200 border-none shadow-none font-medium text-xs w-full justify-center"
          }
        >
          {post.isPublished ? "Published" : "Draft"}
        </Badge>
      </MobileRowItem>
    </MobileRow>
  );
}
