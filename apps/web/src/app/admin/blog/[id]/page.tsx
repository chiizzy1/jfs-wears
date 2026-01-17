"use client";

import { useEffect, useState, use } from "react";
import { PostForm } from "@/components/admin/blog/post-form";
import { blogService } from "@/services/blog.service";
import { Loader2 } from "lucide-react";
import toast from "react-hot-toast";

export default function EditPostPage(props: { params: Promise<{ id: string }> }) {
  const params = use(props.params);
  const [post, setPost] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadPost() {
      try {
        const data = await blogService.getById(params.id);
        setPost(data);
      } catch (error) {
        toast.error("Failed to load post");
      } finally {
        setLoading(false);
      }
    }
    loadPost();
  }, [params.id]);

  if (loading) {
    return (
      <div className="flex h-[50vh] items-center justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-gray-400" />
      </div>
    );
  }

  if (!post) {
    return <div>Post not found</div>;
  }

  return <PostForm initialData={post} isEditing />;
}
