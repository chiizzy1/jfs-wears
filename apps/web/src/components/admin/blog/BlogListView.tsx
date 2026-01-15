"use client";

import { useState, useEffect, useMemo } from "react";
import { Plus, Loader2 } from "lucide-react";
import toast from "react-hot-toast";
import Link from "next/link";
import { useRouter } from "next/navigation";

import { Button } from "@/components/ui/button";
import { DataTable } from "@/components/ui/data-table/DataTable";
import { ConfirmDialog } from "@/components/ui/confirm-dialog"; // Check path
import { blogService } from "@/services/blog.service";
import { getBlogColumns } from "./columns";
import { BlogPost } from "@/types/blog";
import { BlogMobileRow } from "./BlogMobileRow";

export function BlogListView() {
  const [posts, setPosts] = useState<BlogPost[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [deleteConfirm, setDeleteConfirm] = useState<{
    isOpen: boolean;
    post: BlogPost | null;
  }>({
    isOpen: false,
    post: null,
  });

  const loadPosts = async () => {
    try {
      const data = await blogService.getAllAdmin();
      setPosts(data);
    } catch (error) {
      toast.error("Failed to load blog posts");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    loadPosts();
  }, []);

  const handleDeleteClick = (post: BlogPost) => {
    setDeleteConfirm({ isOpen: true, post });
  };

  const handleDeleteConfirm = async () => {
    if (!deleteConfirm.post) return;
    try {
      await blogService.delete(deleteConfirm.post.id);
      toast.success("Post deleted");
      loadPosts();
    } catch (error: any) {
      toast.error(error.message || "Failed to delete post");
    } finally {
      setDeleteConfirm({ isOpen: false, post: null });
    }
  };

  const columns = useMemo(
    () =>
      getBlogColumns({
        onDelete: handleDeleteClick,
      }),
    []
  );

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="h-8 w-8 animate-spin text-gray-500" />
      </div>
    );
  }

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-light tracking-tight">Blog Posts</h1>
          <p className="text-gray-500 text-sm mt-1">Manage content and articles</p>
        </div>
        <Button variant="premium" asChild>
          <Link href="/admin/blog/new">
            <Plus className="h-4 w-4 mr-2" />
            New Post
          </Link>
        </Button>
      </div>

      {/* Posts Table */}
      <div className="rounded-none border-t border-gray-100">
        <DataTable
          columns={columns}
          data={posts}
          searchKey="title"
          renderSubComponent={(props) => <BlogMobileRow post={props.row.original} />}
        />
      </div>

      {/* Delete Confirmation */}
      <ConfirmDialog
        isOpen={deleteConfirm.isOpen}
        onClose={() => setDeleteConfirm({ isOpen: false, post: null })}
        onConfirm={handleDeleteConfirm}
        title="Delete Post"
        message={`Are you sure you want to delete "${deleteConfirm.post?.title}"? This action cannot be undone.`}
        confirmLabel="Delete"
        variant="danger"
        icon="delete"
      />
    </div>
  );
}
