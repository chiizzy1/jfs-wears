"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { BlogPostFormValues, blogPostSchema } from "@/schemas/blog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft, Loader2, Save } from "lucide-react";
import Link from "next/link";
import { apiClient as api } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { CoverImageUpload } from "./cover-image-upload";

interface PostFormProps {
  initialData?: any; // Replace with proper type when available
  isEditing?: boolean;
}

export function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const form = useForm<BlogPostFormValues>({
    resolver: zodResolver(blogPostSchema),
    defaultValues: {
      title: initialData?.title || "",
      slug: initialData?.slug || "",
      excerpt: initialData?.excerpt || "",
      content: initialData?.content || "",
      coverImage: initialData?.coverImage || "",
      tags: initialData?.tags?.join(", ") || "",
      isPublished: initialData?.isPublished || false,
      metaTitle: initialData?.metaTitle || "",
      metaDescription: initialData?.metaDescription || "",
    },
  });

  const onSubmit = async (values: BlogPostFormValues) => {
    try {
      setLoading(true);
      const payload = {
        ...values,
        excerpt: values.excerpt || undefined,
        coverImage: values.coverImage || undefined,
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
        tags: values.tags
          ? values.tags
              .split(",")
              .map((t) => t.trim())
              .filter(Boolean)
          : [],
      };

      if (isEditing && initialData?.id) {
        await api.patch(`/admin/blog/${initialData.id}`, payload);
        toast.success("Post updated successfully");
      } else {
        await api.post("/admin/blog", payload);
        toast.success("Post created successfully");
        router.push("/admin/blog");
      }

      router.refresh();
    } catch (error) {
      console.error(error);
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  // Auto-generate slug from title if slug is empty
  const handleTitleBlur = () => {
    const title = form.getValues("title");
    const slug = form.getValues("slug");
    if (title && !slug) {
      const generatedSlug = title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", generatedSlug, { shouldValidate: true });
    }
  };

  return (
    <div className="space-y-6 w-full pb-20">
      <div className="flex items-center gap-4 border-b border-gray-200 pb-6">
        <Button variant="ghost" size="icon" asChild className="rounded-none">
          <Link href="/admin/blog">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-heading font-medium uppercase tracking-tight">{isEditing ? "Edit Post" : "New Post"}</h1>
          <p className="text-gray-500 text-sm mt-1">Create and manage your high-fashion editorial content.</p>
        </div>
        <div className="ml-auto flex items-center gap-2">
          <Button
            disabled={loading}
            onClick={() => form.handleSubmit(onSubmit)()}
            className="rounded-none bg-black text-white hover:bg-gray-800 h-10 px-8 uppercase tracking-widest text-xs"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Post" : "Publish Post"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
          <div className="grid gap-8 lg:grid-cols-[1fr_400px]">
            {/* Main Content */}
            <div className="space-y-8">
              <div className="bg-white border border-gray-200 p-8 space-y-6">
                <FormField
                  control={form.control}
                  name="title"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-gray-500 font-medium">Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="POST TITLE"
                          {...field}
                          onBlur={() => {
                            field.onBlur();
                            handleTitleBlur();
                          }}
                          className="h-12 text-lg font-heading rounded-none border-gray-200 focus-visible:ring-0 focus-visible:border-black transition-colors"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="slug"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-gray-500 font-medium">Slug</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="post-slug"
                          {...field}
                          className="font-mono text-sm rounded-none border-gray-200 bg-gray-50/50 focus-visible:ring-0 focus-visible:border-black"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">Unique identifier for the URL.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="excerpt"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-gray-500 font-medium">Excerpt</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Write a compelling summary for SEO and previews..."
                          className="resize-none min-h-[100px] rounded-none border-gray-200 focus-visible:ring-0 focus-visible:border-black text-base"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="content"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-gray-500 font-medium">Content</FormLabel>
                      <FormControl>
                        <RichTextEditor
                          value={field.value}
                          onChange={field.onChange}
                          placeholder="Tell your story..."
                          className="rounded-none border-gray-200 min-h-[500px]"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Sidebar */}
            <div className="space-y-8">
              <div className="bg-white border border-gray-200 p-6 space-y-6">
                <h3 className="font-heading font-medium uppercase tracking-tight text-lg border-b border-gray-100 pb-4">
                  Publishing
                </h3>

                <FormField
                  control={form.control}
                  name="isPublished"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-center justify-between p-4 border border-gray-100 bg-gray-50/50">
                      <div className="space-y-0.5">
                        <FormLabel className="text-sm font-medium uppercase tracking-wide">Visibility</FormLabel>
                        <FormDescription className="text-xs text-gray-500">{field.value ? "Public" : "Draft"}</FormDescription>
                      </div>
                      <FormControl>
                        <Switch checked={field.value} onCheckedChange={field.onChange} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="tags"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-gray-500 font-medium">Tags</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Fashion, Trends, Styling"
                          {...field}
                          className="rounded-none border-gray-200 focus-visible:ring-0 focus-visible:border-black"
                        />
                      </FormControl>
                      <FormDescription className="text-xs">Comma-separated values.</FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-white border border-gray-200 p-6 space-y-6">
                <h3 className="font-heading font-medium uppercase tracking-tight text-lg border-b border-gray-100 pb-4">Media</h3>
                <FormField
                  control={form.control}
                  name="coverImage"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-gray-500 font-medium">Cover Image</FormLabel>
                      <FormControl>
                        <CoverImageUpload value={field.value} onChange={field.onChange} disabled={loading} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>

              <div className="bg-white border border-gray-200 p-6 space-y-6">
                <h3 className="font-heading font-medium uppercase tracking-tight text-lg border-b border-gray-100 pb-4">
                  SEO Metadata
                </h3>
                <FormField
                  control={form.control}
                  name="metaTitle"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-gray-500 font-medium">Meta Title</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="SEO Title"
                          {...field}
                          className="rounded-none border-gray-200 focus-visible:ring-0 focus-visible:border-black"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="metaDescription"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel className="uppercase text-xs tracking-widest text-gray-500 font-medium">
                        Meta Description
                      </FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="SEO Description"
                          className="resize-none rounded-none border-gray-200 focus-visible:ring-0 focus-visible:border-black"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
            </div>
          </div>
        </form>
      </Form>
    </div>
  );
}
