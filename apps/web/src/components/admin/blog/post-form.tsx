"use client";

import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useRouter } from "next/navigation";
import { useState } from "react";
import toast from "react-hot-toast";
import { BlogPostFormValues, blogPostSchema } from "@/schemas/blog";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage, FormDescription } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import { RichTextEditor } from "@/components/ui/rich-text-editor";
import { ArrowLeft, Loader2, Save, Sparkles } from "lucide-react";
import Link from "next/link";
import { apiClient as api, getErrorMessage, isApiError } from "@/lib/api-client";
import { cn } from "@/lib/utils";
import { CoverImageUpload } from "./cover-image-upload";
import { aiService } from "@/services/ai.service";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

interface PostFormProps {
  initialData?: any; // Replace with proper type when available
  isEditing?: boolean;
}

export function PostForm({ initialData, isEditing = false }: PostFormProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [aiDialogOpen, setAiDialogOpen] = useState(false);
  const [aiTopic, setAiTopic] = useState("");
  const [aiOutline, setAiOutline] = useState("");
  const [aiLoading, setAiLoading] = useState(false);

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

      // Clean payload - convert empty strings to undefined for optional fields
      const payload = {
        title: values.title,
        slug: values.slug,
        content: values.content,
        excerpt: values.excerpt || undefined,
        coverImage: values.coverImage || undefined,
        metaTitle: values.metaTitle || undefined,
        metaDescription: values.metaDescription || undefined,
        isPublished: values.isPublished ?? false,
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
      console.error("Blog post submission error:", error);

      // Use centralized error handler for user-friendly messages
      const errorMessage = getErrorMessage(error);

      // Show specific toast based on error type
      if (isApiError(error)) {
        if (error.isValidationError) {
          toast.error(`Validation Error: ${errorMessage}`);
        } else if (error.isUnauthorized) {
          toast.error("Session expired. Please log in again.");
        } else if (error.isNetworkError) {
          toast.error(`Connection Error: ${errorMessage}`);
        } else {
          toast.error(`Failed to save post: ${errorMessage}`);
        }
      } else {
        toast.error(errorMessage || "Something went wrong");
      }
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

  // Handle form validation errors with toast notification
  const onInvalid = (errors: Record<string, { message?: string }>) => {
    const errorFields = Object.keys(errors);
    if (errorFields.length === 1) {
      toast.error(errors[errorFields[0]]?.message || "Please fill in all required fields");
    } else {
      const messages = errorFields.slice(0, 3).map((field) => {
        return errors[field]?.message || `${field} is required`;
      });
      toast.error(`Please fix: ${messages.join(", ")}${errorFields.length > 3 ? "..." : ""}`);
    }
  };

  // AI Blog Generation Handler
  const handleAIGenerate = async () => {
    if (!aiTopic.trim()) {
      toast.error("Please enter a topic for the blog post");
      return;
    }

    try {
      setAiLoading(true);
      const result = await aiService.generateBlog({
        topic: aiTopic,
        outline: aiOutline || undefined,
        existingDraft: form.getValues("content") || undefined,
      });

      // Populate form with AI-generated content
      form.setValue("title", result.title);
      form.setValue("excerpt", result.excerpt);
      form.setValue("content", result.content);
      form.setValue("tags", result.tags.join(", "));
      form.setValue("metaTitle", result.metaTitle);
      form.setValue("metaDescription", result.metaDescription);

      // Auto-generate slug from title
      const generatedSlug = result.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, "-")
        .replace(/(^-|-$)/g, "");
      form.setValue("slug", generatedSlug);

      toast.success("Blog post generated! Review and edit as needed.");
      setAiDialogOpen(false);
      setAiTopic("");
      setAiOutline("");
    } catch (error: any) {
      toast.error(error.message || "Failed to generate blog post");
    } finally {
      setAiLoading(false);
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
          {/* AI Generate Button */}
          <Dialog open={aiDialogOpen} onOpenChange={setAiDialogOpen}>
            <DialogTrigger asChild>
              <Button
                type="button"
                variant="outline"
                className="rounded-none h-10 px-4 gap-2 text-xs uppercase tracking-widest border-purple-300 text-purple-700 hover:bg-purple-50"
              >
                <Sparkles className="h-4 w-4" />
                Generate with AI
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="flex items-center gap-2">
                  <Sparkles className="h-5 w-5 text-purple-600" />
                  Generate Blog Post with AI
                </DialogTitle>
                <DialogDescription>
                  Enter a topic and optional outline. AI will generate title, content, excerpt, and SEO metadata.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Topic *</label>
                  <Input
                    placeholder="e.g., Top 10 Ankara Styles for 2026"
                    value={aiTopic}
                    onChange={(e) => setAiTopic(e.target.value)}
                    className="rounded-none"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Outline (optional)</label>
                  <Textarea
                    placeholder="Optional: Provide an outline or key points to cover..."
                    value={aiOutline}
                    onChange={(e) => setAiOutline(e.target.value)}
                    rows={4}
                    className="rounded-none"
                  />
                </div>
              </div>
              <DialogFooter>
                <Button type="button" variant="outline" onClick={() => setAiDialogOpen(false)} className="rounded-none">
                  Cancel
                </Button>
                <Button
                  type="button"
                  onClick={handleAIGenerate}
                  disabled={aiLoading || !aiTopic.trim()}
                  className="rounded-none bg-purple-600 hover:bg-purple-700 text-white gap-2"
                >
                  {aiLoading ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" /> Generating...
                    </>
                  ) : (
                    <>
                      <Sparkles className="h-4 w-4" /> Generate
                    </>
                  )}
                </Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
          <Button
            disabled={loading}
            onClick={() => form.handleSubmit(onSubmit, onInvalid)()}
            className="rounded-none bg-black text-white hover:bg-gray-800 h-10 px-8 uppercase tracking-widest text-xs"
          >
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {isEditing ? "Update Post" : "Publish Post"}
          </Button>
        </div>
      </div>

      <Form {...form}>
        <form onSubmit={form.handleSubmit(onSubmit, onInvalid)} className="space-y-8">
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
