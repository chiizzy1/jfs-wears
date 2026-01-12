"use client";

import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import toast from "react-hot-toast";
import { adminAPI } from "@/lib/admin-api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Plus, Trash2, GripVertical, Image as ImageIcon, Video, Eye, EyeOff, Edit2, X } from "lucide-react";

interface StorefrontHero {
  id: string;
  headline: string;
  subheadline?: string;
  ctaText?: string;
  ctaLink?: string;
  mediaUrl: string;
  mediaType: "IMAGE" | "VIDEO";
  thumbnailUrl?: string;
  productId?: string;
  categoryId?: string;
  order: number;
  isActive: boolean;
  product?: { id: string; name: string; slug: string };
  category?: { id: string; name: string; slug: string };
}

interface StorefrontSection {
  id: string;
  title: string;
  subtitle?: string;
  type: "FEATURED" | "CATEGORY" | "COLLECTION";
  categoryId?: string;
  mediaUrl?: string;
  mediaType?: "IMAGE" | "VIDEO";
  order: number;
  isActive: boolean;
  maxProducts: number;
  category?: { id: string; name: string; slug: string };
}

interface Category {
  id: string;
  name: string;
  slug: string;
}

export default function StorefrontPage() {
  const [activeTab, setActiveTab] = useState<"heroes" | "categories" | "carousels">("heroes");
  const [heroes, setHeroes] = useState<StorefrontHero[]>([]);
  const [sections, setSections] = useState<StorefrontSection[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [showHeroModal, setShowHeroModal] = useState(false);
  const [showSectionModal, setShowSectionModal] = useState(false);
  const [editingHero, setEditingHero] = useState<StorefrontHero | null>(null);
  const [editingSection, setEditingSection] = useState<StorefrontSection | null>(null);
  const [sectionModalType, setSectionModalType] = useState<"CATEGORY" | "carousel">("carousel");

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      const [heroesRes, sectionsRes, categoriesRes] = await Promise.all([
        adminAPI.get<StorefrontHero[]>("/admin/storefront/heroes"),
        adminAPI.get<StorefrontSection[]>("/admin/storefront/sections"),
        adminAPI.get<Category[]>("/categories"),
      ]);
      setHeroes(heroesRes);
      setSections(sectionsRes);
      setCategories(categoriesRes);
    } catch (err) {
      console.error("Error fetching storefront data:", err);
      toast.error("Failed to load storefront data");
    } finally {
      setLoading(false);
    }
  };

  const toggleHeroActive = async (hero: StorefrontHero) => {
    try {
      await adminAPI.patch(`/admin/storefront/heroes/${hero.id}`, { isActive: !hero.isActive });
      setHeroes((prev) => prev.map((h) => (h.id === hero.id ? { ...h, isActive: !h.isActive } : h)));
      toast.success(`Hero ${hero.isActive ? "hidden" : "shown"}`);
    } catch {
      toast.error("Failed to update hero");
    }
  };

  const toggleSectionActive = async (section: StorefrontSection) => {
    try {
      await adminAPI.patch(`/admin/storefront/sections/${section.id}`, { isActive: !section.isActive });
      setSections((prev) => prev.map((s) => (s.id === section.id ? { ...s, isActive: !s.isActive } : s)));
      toast.success(`Section ${section.isActive ? "hidden" : "shown"}`);
    } catch {
      toast.error("Failed to update section");
    }
  };

  const deleteHero = async (id: string) => {
    if (!confirm("Delete this hero slide?")) return;
    try {
      await adminAPI.delete(`/admin/storefront/heroes/${id}`);
      setHeroes((prev) => prev.filter((h) => h.id !== id));
      toast.success("Hero deleted");
    } catch {
      toast.error("Failed to delete hero");
    }
  };

  const deleteSection = async (id: string) => {
    if (!confirm("Delete this section?")) return;
    try {
      await adminAPI.delete(`/admin/storefront/sections/${id}`);
      setSections((prev) => prev.filter((s) => s.id !== id));
      toast.success("Section deleted");
    } catch {
      toast.error("Failed to delete section");
    }
  };

  // Filter sections by purpose
  const categoryGridSections = categories; // Categories themselves (with images)
  const carouselSections = sections.filter((s) => s.type === "CATEGORY" || s.type === "FEATURED");

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold tracking-tight">Storefront CMS</h1>
          <p className="text-muted-foreground text-sm mt-1">Manage hero slides, category grid, and product carousels</p>
        </div>
      </div>

      {/* Tabs - Now 3 tabs */}
      <div className="flex gap-4 border-b border-gray-200">
        <button
          onClick={() => setActiveTab("heroes")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "heroes" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Hero Slides
        </button>
        <button
          onClick={() => setActiveTab("categories")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "categories" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Category Grid
        </button>
        <button
          onClick={() => setActiveTab("carousels")}
          className={`pb-3 px-1 text-sm font-medium border-b-2 transition-colors ${
            activeTab === "carousels" ? "border-black text-black" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          Product Carousels
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-black" />
        </div>
      ) : activeTab === "heroes" ? (
        <HeroesTab
          heroes={heroes}
          categories={categories}
          onToggle={toggleHeroActive}
          onDelete={deleteHero}
          onEdit={(hero) => {
            setEditingHero(hero);
            setShowHeroModal(true);
          }}
          onAdd={() => {
            setEditingHero(null);
            setShowHeroModal(true);
          }}
          onRefresh={fetchData}
        />
      ) : activeTab === "categories" ? (
        <CategoryGridTab categories={categories} onRefresh={fetchData} />
      ) : (
        <CarouselsTab
          sections={carouselSections}
          categories={categories}
          onToggle={toggleSectionActive}
          onDelete={deleteSection}
          onEdit={(section) => {
            setEditingSection(section);
            setShowSectionModal(true);
          }}
          onAdd={() => {
            setEditingSection(null);
            setShowSectionModal(true);
          }}
          onRefresh={fetchData}
        />
      )}

      {/* Modals */}
      {showHeroModal && (
        <HeroModal
          hero={editingHero}
          categories={categories}
          onClose={() => setShowHeroModal(false)}
          onSuccess={() => {
            setShowHeroModal(false);
            fetchData();
          }}
        />
      )}

      {showSectionModal && (
        <SectionModal
          section={editingSection}
          categories={categories}
          onClose={() => setShowSectionModal(false)}
          onSuccess={() => {
            setShowSectionModal(false);
            fetchData();
          }}
        />
      )}
    </div>
  );
}

// ============================================
// HEROES TAB
// ============================================

function HeroesTab({
  heroes,
  categories,
  onToggle,
  onDelete,
  onEdit,
  onAdd,
  onRefresh,
}: {
  heroes: StorefrontHero[];
  categories: Category[];
  onToggle: (hero: StorefrontHero) => void;
  onDelete: (id: string) => void;
  onEdit: (hero: StorefrontHero) => void;
  onAdd: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Button onClick={onAdd} variant="premium">
          <Plus className="h-4 w-4 mr-2" /> Add Hero Slide
        </Button>
      </div>

      {heroes.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg py-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No hero slides yet</p>
          <Button onClick={onAdd} variant="outline" className="mt-4">
            Add First Slide
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {heroes.map((hero) => (
            <div
              key={hero.id}
              className={`flex items-center gap-4 p-4 border rounded-lg ${hero.isActive ? "bg-white" : "bg-gray-50 opacity-60"}`}
            >
              <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
              <div className="w-24 h-16 bg-gray-100 rounded overflow-hidden flex-shrink-0">
                {hero.mediaType === "VIDEO" ? (
                  <video src={hero.mediaUrl} className="w-full h-full object-cover" muted />
                ) : (
                  <img src={hero.mediaUrl} alt="" className="w-full h-full object-cover" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className="font-medium truncate">{hero.headline}</p>
                <p className="text-sm text-gray-500 truncate">{hero.subheadline || "No subheadline"}</p>
                <div className="flex gap-2 mt-1">
                  {hero.mediaType === "VIDEO" && (
                    <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded">VIDEO</span>
                  )}
                  {hero.category && (
                    <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded">{hero.category.name}</span>
                  )}
                  {hero.product && (
                    <span className="text-xs bg-green-100 text-green-700 px-2 py-0.5 rounded">{hero.product.name}</span>
                  )}
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onToggle(hero)} className="p-2 hover:bg-gray-100 rounded">
                  {hero.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                </button>
                <button onClick={() => onEdit(hero)} className="p-2 hover:bg-gray-100 rounded">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(hero.id)} className="p-2 hover:bg-red-50 rounded text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// CATEGORY GRID TAB - For managing category images
// ============================================

const API_BASE_URL_CAT = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function CategoryGridTab({ categories, onRefresh }: { categories: Category[]; onRefresh: () => void }) {
  const [uploading, setUploading] = useState<string | null>(null);

  const handleImageUpload = async (categoryId: string, file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }

    setUploading(categoryId);
    const formData = new FormData();
    formData.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL_CAT}/upload/category/${categoryId}`, {
        method: "POST",
        body: formData,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(error.message);
      }

      toast.success("Category image updated!");
      onRefresh();
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Failed to upload image");
    } finally {
      setUploading(null);
    }
  };

  return (
    <div className="space-y-4">
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-blue-800">
          <strong>Category Grid</strong> appears on the homepage as "Shop by Category". Upload images for each category to
          customize how they appear.
        </p>
      </div>

      {categories.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg py-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No categories found</p>
          <p className="text-sm text-gray-400 mt-1">Create categories first in the Categories page</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((category) => (
            <div key={category.id} className="border rounded-lg overflow-hidden bg-white">
              {/* Category Image */}
              <div className="aspect-[4/3] bg-gray-100 relative group">
                {(category as any).imageUrl ? (
                  <img src={(category as any).imageUrl} alt={category.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-gray-400">
                    <ImageIcon className="h-12 w-12" />
                  </div>
                )}
                {/* Upload overlay */}
                <label className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer flex items-center justify-center">
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    onChange={(e) => {
                      const file = e.target.files?.[0];
                      if (file) handleImageUpload(category.id, file);
                    }}
                    disabled={uploading === category.id}
                  />
                  {uploading === category.id ? (
                    <div className="text-white text-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white mx-auto mb-2" />
                      <span className="text-sm">Uploading...</span>
                    </div>
                  ) : (
                    <div className="text-white text-center">
                      <ImageIcon className="h-8 w-8 mx-auto mb-2" />
                      <span className="text-sm">Click to upload</span>
                    </div>
                  )}
                </label>
              </div>
              {/* Category Info */}
              <div className="p-3">
                <p className="font-medium">{category.name}</p>
                <p className="text-xs text-gray-400">/{category.slug}</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// CAROUSELS TAB - For product carousels
// ============================================

function CarouselsTab({
  sections,
  categories,
  onToggle,
  onDelete,
  onEdit,
  onAdd,
  onRefresh,
}: {
  sections: StorefrontSection[];
  categories: Category[];
  onToggle: (section: StorefrontSection) => void;
  onDelete: (id: string) => void;
  onEdit: (section: StorefrontSection) => void;
  onAdd: () => void;
  onRefresh: () => void;
}) {
  return (
    <div className="space-y-4">
      <div className="bg-green-50 border border-green-200 rounded-lg p-4 mb-6">
        <p className="text-sm text-green-800">
          <strong>Product Carousels</strong> display below "Trending Now" on the homepage. Select a category and products will
          auto-populate.
        </p>
      </div>

      <div className="flex justify-end">
        <Button onClick={onAdd} variant="premium" className="gap-2">
          <Plus className="h-4 w-4" /> Add Product Carousel
        </Button>
      </div>

      {sections.length === 0 ? (
        <div className="border border-dashed border-gray-300 rounded-lg py-12 text-center">
          <ImageIcon className="h-12 w-12 mx-auto text-gray-300 mb-4" />
          <p className="text-gray-500">No product carousels yet</p>
          <Button onClick={onAdd} variant="outline" className="mt-4">
            Add First Carousel
          </Button>
        </div>
      ) : (
        <div className="space-y-3">
          {sections.map((section) => (
            <div
              key={section.id}
              className={`flex items-center gap-4 p-4 border rounded-lg ${
                section.isActive ? "bg-white" : "bg-gray-50 opacity-60"
              }`}
            >
              <GripVertical className="h-5 w-5 text-gray-400 cursor-grab" />
              <div className="flex-1 min-w-0">
                <p className="font-medium">{section.title}</p>
                <p className="text-sm text-gray-500">{section.subtitle || "No subtitle"}</p>
                <div className="flex gap-2 mt-1">
                  <span
                    className={`text-xs px-2 py-0.5 rounded ${
                      section.type === "FEATURED"
                        ? "bg-yellow-100 text-yellow-700"
                        : section.type === "CATEGORY"
                        ? "bg-blue-100 text-blue-700"
                        : "bg-purple-100 text-purple-700"
                    }`}
                  >
                    {section.type === "CATEGORY" ? "Category" : "Featured"}
                  </span>
                  {section.category && (
                    <span className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded">{section.category.name}</span>
                  )}
                  <span className="text-xs text-gray-400">Max: {section.maxProducts} products</span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button onClick={() => onToggle(section)} className="p-2 hover:bg-gray-100 rounded">
                  {section.isActive ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4 text-gray-400" />}
                </button>
                <button onClick={() => onEdit(section)} className="p-2 hover:bg-gray-100 rounded">
                  <Edit2 className="h-4 w-4" />
                </button>
                <button onClick={() => onDelete(section.id)} className="p-2 hover:bg-red-50 rounded text-red-500">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ============================================
// HERO MODAL
// ============================================

const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001/api";

function HeroModal({
  hero,
  categories,
  onClose,
  onSuccess,
}: {
  hero: StorefrontHero | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    headline: hero?.headline || "",
    subheadline: hero?.subheadline || "",
    ctaText: hero?.ctaText || "Shop Now",
    ctaLink: hero?.ctaLink || "",
    mediaUrl: hero?.mediaUrl || "",
    mediaType: hero?.mediaType || "IMAGE",
    categoryId: hero?.categoryId || "",
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const fileInputRef = React.useRef<HTMLInputElement>(null);

  const handleFileUpload = async (file: File) => {
    if (!file) return;

    // Validate file type
    const isImage = file.type.startsWith("image/");
    const isVideo = file.type.startsWith("video/");
    if (!isImage && !isVideo) {
      toast.error("Please upload an image or video file");
      return;
    }

    // Validate size (100MB for video, 10MB for image)
    const maxSize = isVideo ? 100 * 1024 * 1024 : 10 * 1024 * 1024;
    if (file.size > maxSize) {
      toast.error(`File too large. Max ${isVideo ? "100MB" : "10MB"}`);
      return;
    }

    setUploading(true);
    const formDataUpload = new FormData();
    formDataUpload.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload/storefront`, {
        method: "POST",
        body: formDataUpload,
        credentials: "include",
      });

      if (!res.ok) {
        const error = await res.json().catch(() => ({ message: "Upload failed" }));
        throw new Error(error.message);
      }

      const result = await res.json();
      setFormData({
        ...formData,
        mediaUrl: result.secureUrl,
        mediaType: result.mediaType,
      });
      toast.success("Media uploaded successfully");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Upload failed");
    } finally {
      setUploading(false);
    }
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    const file = e.dataTransfer.files[0];
    if (file) handleFileUpload(file);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.headline || !formData.mediaUrl) {
      toast.error("Headline and media are required");
      return;
    }

    setSaving(true);
    try {
      if (hero) {
        await adminAPI.patch(`/admin/storefront/heroes/${hero.id}`, formData);
        toast.success("Hero updated");
      } else {
        await adminAPI.post("/admin/storefront/heroes", formData);
        toast.success("Hero created");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save hero");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{hero ? "Edit Hero Slide" : "Add Hero Slide"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          {/* Media Upload */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Media (Image or Video) *</label>
            <div
              onDrop={handleDrop}
              onDragOver={(e) => e.preventDefault()}
              onClick={() => fileInputRef.current?.click()}
              className={`border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${
                uploading
                  ? "border-blue-400 bg-blue-50"
                  : formData.mediaUrl
                  ? "border-green-400 bg-green-50"
                  : "border-gray-300 hover:border-gray-400"
              }`}
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*,video/*"
                onChange={(e) => e.target.files?.[0] && handleFileUpload(e.target.files[0])}
                className="hidden"
              />
              {uploading ? (
                <div className="flex flex-col items-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mb-2" />
                  <p className="text-sm text-gray-500">Uploading to Cloudinary...</p>
                </div>
              ) : formData.mediaUrl ? (
                <div className="space-y-2">
                  {formData.mediaType === "VIDEO" ? (
                    <video src={formData.mediaUrl} className="h-32 mx-auto rounded" muted />
                  ) : (
                    <img src={formData.mediaUrl} alt="Preview" className="h-32 mx-auto rounded object-cover" />
                  )}
                  <p className="text-sm text-green-600 font-medium">{formData.mediaType} uploaded ✓</p>
                  <p className="text-xs text-gray-400">Click to replace</p>
                </div>
              ) : (
                <div className="flex flex-col items-center">
                  {formData.mediaType === "VIDEO" ? (
                    <Video className="h-10 w-10 text-gray-300 mb-2" />
                  ) : (
                    <ImageIcon className="h-10 w-10 text-gray-300 mb-2" />
                  )}
                  <p className="text-sm text-gray-500">Drag & drop or click to upload</p>
                  <p className="text-xs text-gray-400 mt-1">JPEG, PNG, GIF, MP4, WebM</p>
                </div>
              )}
            </div>
          </div>

          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Headline *</label>
            <Input
              value={formData.headline}
              onChange={(e) => setFormData({ ...formData, headline: e.target.value })}
              placeholder="Summer Collection 2026"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Subheadline</label>
            <Textarea
              value={formData.subheadline}
              onChange={(e) => setFormData({ ...formData, subheadline: e.target.value })}
              placeholder="Discover our latest arrivals"
              rows={2}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">CTA Text</label>
              <Input
                value={formData.ctaText}
                onChange={(e) => setFormData({ ...formData, ctaText: e.target.value })}
                placeholder="Shop Now"
              />
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">CTA Link</label>
              <Input
                value={formData.ctaLink}
                onChange={(e) => setFormData({ ...formData, ctaLink: e.target.value })}
                placeholder="/shop"
              />
            </div>
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Link to Category</label>
            <Select
              value={formData.categoryId || "none"}
              onValueChange={(v) => setFormData({ ...formData, categoryId: v === "none" ? "" : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="None" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">None</SelectItem>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? "Saving..." : hero ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================
// SECTION MODAL
// ============================================

function SectionModal({
  section,
  categories,
  onClose,
  onSuccess,
}: {
  section: StorefrontSection | null;
  categories: Category[];
  onClose: () => void;
  onSuccess: () => void;
}) {
  const [formData, setFormData] = useState({
    title: section?.title || "",
    subtitle: section?.subtitle || "",
    type: section?.type || "FEATURED",
    categoryId: section?.categoryId || "",
    mediaUrl: section?.mediaUrl || "",
    mediaType: section?.mediaType || "IMAGE",
    maxProducts: section?.maxProducts || 10,
  });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const sectionFileRef = React.useRef<HTMLInputElement>(null);

  const handleImageUpload = async (file: File) => {
    if (!file.type.startsWith("image/")) {
      toast.error("Please upload an image file");
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Image must be under 10MB");
      return;
    }

    setUploading(true);
    const uploadForm = new FormData();
    uploadForm.append("file", file);

    try {
      const res = await fetch(`${API_BASE_URL}/upload/storefront`, {
        method: "POST",
        body: uploadForm,
        credentials: "include",
      });
      if (!res.ok) throw new Error("Upload failed");
      const result = await res.json();
      setFormData({ ...formData, mediaUrl: result.secureUrl, mediaType: result.mediaType });
      toast.success("Image uploaded!");
    } catch {
      toast.error("Failed to upload image");
    } finally {
      setUploading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.title) {
      toast.error("Title is required");
      return;
    }
    if (formData.type === "CATEGORY" && !formData.categoryId) {
      toast.error("Category is required for Category type sections");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        ...formData,
        categoryId: formData.categoryId || null,
        mediaUrl: formData.mediaUrl || null,
      };

      if (section) {
        await adminAPI.patch(`/admin/storefront/sections/${section.id}`, payload);
        toast.success("Section updated");
      } else {
        await adminAPI.post("/admin/storefront/sections", payload);
        toast.success("Section created");
      }
      onSuccess();
    } catch {
      toast.error("Failed to save section");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-lg font-semibold">{section ? "Edit Section" : "Add Section"}</h2>
          <button onClick={onClose} className="p-1 hover:bg-gray-100 rounded">
            <X className="h-5 w-5" />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="p-4 space-y-4">
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Title *</label>
            <Input
              value={formData.title}
              onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              placeholder="Latest Drops"
            />
          </div>
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Subtitle</label>
            <Input
              value={formData.subtitle}
              onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
              placeholder="Fresh from the factory"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Type</label>
              <Select value={formData.type} onValueChange={(v) => setFormData({ ...formData, type: v as any })}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="FEATURED">Featured Products</SelectItem>
                  <SelectItem value="CATEGORY">Category Products</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Max Products</label>
              <Input
                type="number"
                min={1}
                max={20}
                value={formData.maxProducts}
                onChange={(e) => setFormData({ ...formData, maxProducts: parseInt(e.target.value) || 10 })}
              />
            </div>
          </div>
          {formData.type === "CATEGORY" && (
            <div>
              <label className="text-xs uppercase tracking-wider text-gray-500 block mb-1">Category *</label>
              <Select value={formData.categoryId} onValueChange={(v) => setFormData({ ...formData, categoryId: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.id}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          )}
          {/* Optional Image Upload for Category Grid display */}
          <div>
            <label className="text-xs uppercase tracking-wider text-gray-500 block mb-2">Section Image (optional)</label>
            <p className="text-xs text-gray-400 mb-2">
              Upload an image for Category Grid display. Leave empty for product carousels.
            </p>
            <div
              onClick={() => sectionFileRef.current?.click()}
              onDrop={(e) => {
                e.preventDefault();
                e.dataTransfer.files[0] && handleImageUpload(e.dataTransfer.files[0]);
              }}
              onDragOver={(e) => e.preventDefault()}
              className={`border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-colors ${
                uploading
                  ? "border-blue-400 bg-blue-50"
                  : formData.mediaUrl
                  ? "border-green-400 bg-green-50"
                  : "border-gray-200 hover:border-gray-300"
              }`}
            >
              <input
                ref={sectionFileRef}
                type="file"
                accept="image/*"
                onChange={(e) => e.target.files?.[0] && handleImageUpload(e.target.files[0])}
                className="hidden"
              />
              {uploading ? (
                <div className="flex flex-col items-center py-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-500 mb-2" />
                  <p className="text-xs text-gray-500">Uploading...</p>
                </div>
              ) : formData.mediaUrl ? (
                <div className="space-y-2">
                  <img src={formData.mediaUrl} alt="Section" className="h-16 mx-auto rounded object-cover" />
                  <p className="text-xs text-green-600">Click to replace</p>
                </div>
              ) : (
                <div className="py-2">
                  <ImageIcon className="h-6 w-6 text-gray-300 mx-auto mb-1" />
                  <p className="text-xs text-gray-400">Click to upload (optional)</p>
                </div>
              )}
            </div>
          </div>
          <div className="flex justify-end gap-3 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={saving || uploading}>
              {saving ? "Saving..." : section ? "Update" : "Create"}
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
