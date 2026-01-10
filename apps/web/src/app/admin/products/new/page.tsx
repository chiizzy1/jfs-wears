"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { adminAPI, Category, CreateVariantDto } from "@/lib/admin-api";
import toast from "react-hot-toast";

interface ImagePreview {
  file: File;
  preview: string;
}

export default function AddProductPage() {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [categories, setCategories] = useState<Category[]>([]);

  // Form state
  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [basePrice, setBasePrice] = useState("");
  const [categoryId, setCategoryId] = useState("");
  const [gender, setGender] = useState<"MEN" | "WOMEN" | "UNISEX">("UNISEX");
  const [isFeatured, setIsFeatured] = useState(false);

  // Images
  const [images, setImages] = useState<ImagePreview[]>([]);
  const [isDragging, setIsDragging] = useState(false);

  // Variants
  const [variants, setVariants] = useState<CreateVariantDto[]>([{ size: "", color: "", sku: "", stock: 0 }]);

  // Fetch categories on mount
  useEffect(() => {
    const loadCategories = async () => {
      try {
        const token = localStorage.getItem("admin_token");
        if (token) {
          adminAPI.setToken(token);
        }
        const cats = await adminAPI.getCategories();
        setCategories(cats);
        if (cats.length > 0) {
          setCategoryId(cats[0].id);
        }
      } catch (error) {
        console.error("Failed to load categories:", error);
        toast.error("Failed to load categories");
      }
    };
    loadCategories();
  }, []);

  // Handle image drop
  const handleDrop = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const files = Array.from(e.dataTransfer.files).filter((f) => f.type.startsWith("image/"));
    addImages(files);
  }, []);

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const files = Array.from(e.target.files);
      addImages(files);
    }
  };

  const addImages = (files: File[]) => {
    const newImages = files.map((file) => ({
      file,
      preview: URL.createObjectURL(file),
    }));
    setImages((prev) => [...prev, ...newImages].slice(0, 10)); // Max 10 images
  };

  const removeImage = (index: number) => {
    setImages((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Variant management
  const addVariant = () => {
    setVariants((prev) => [...prev, { size: "", color: "", sku: "", stock: 0 }]);
  };

  const removeVariant = (index: number) => {
    setVariants((prev) => prev.filter((_, i) => i !== index));
  };

  const updateVariant = (index: number, field: keyof CreateVariantDto, value: string | number) => {
    setVariants((prev) => prev.map((v, i) => (i === index ? { ...v, [field]: value } : v)));
  };

  // Generate SKU suggestion
  const generateSku = (index: number) => {
    const variant = variants[index];
    const prefix = name.slice(0, 2).toUpperCase() || "PR";
    const size = variant.size?.slice(0, 1).toUpperCase() || "X";
    const color = variant.color?.slice(0, 3).toUpperCase() || "CLR";
    const random = Math.random().toString(36).substring(2, 6).toUpperCase();
    updateVariant(index, "sku", `${prefix}-${size}-${color}-${random}`);
  };

  // Form submission
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (!name.trim()) {
      toast.error("Product name is required");
      return;
    }
    if (!categoryId) {
      toast.error("Please select a category");
      return;
    }
    if (!basePrice || parseFloat(basePrice) <= 0) {
      toast.error("Please enter a valid price");
      return;
    }

    // Validate variants
    const validVariants = variants.filter((v) => v.sku && v.size && v.color);
    if (validVariants.length === 0) {
      toast.error("Please add at least one complete variant (size, color, SKU)");
      return;
    }

    setIsLoading(true);

    try {
      // Ensure token is set before API calls
      const token = localStorage.getItem("admin_token");
      if (!token) {
        toast.error("Session expired. Please login again.");
        router.push("/admin/login");
        return;
      }
      adminAPI.setToken(token);

      // 1. Create the product
      const product = await adminAPI.createProduct({
        name: name.trim(),
        description: description.trim(),
        basePrice: parseFloat(basePrice),
        categoryId,
        gender,
        isFeatured,
        variants: validVariants,
      });

      toast.success("Product created!");

      // 2. Upload images if any
      if (images.length > 0) {
        toast.loading("Uploading images...", { id: "uploading" });
        try {
          const files = images.map((img) => img.file);
          await adminAPI.uploadProductImages(product.id, files);
          toast.success("Images uploaded!", { id: "uploading" });
        } catch (uploadError) {
          console.error("Image upload failed:", uploadError);
          toast.error("Product created but image upload failed", {
            id: "uploading",
          });
        }
      }

      // 3. Redirect to products list
      router.push("/admin/products");
    } catch (error) {
      console.error("Failed to create product:", error);
      toast.error(error instanceof Error ? error.message : "Failed to create product");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center justify-between mb-8">
        <div>
          <Link href="/admin/products" className="text-sm text-gray-500 hover:text-accent flex items-center gap-1 mb-2">
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
            </svg>
            Back to Products
          </Link>
          <h1 className="text-2xl font-bold">Add New Product</h1>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="space-y-8">
        {/* Product Details */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Product Details</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Name */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Product Name <span className="text-error">*</span>
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g., Premium Streetwear Hoodie"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            {/* Description */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe your product..."
                rows={4}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent resize-none"
              />
            </div>

            {/* Category */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Category <span className="text-error">*</span>
              </label>
              <select
                value={categoryId}
                onChange={(e) => setCategoryId(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent bg-white"
                required
              >
                {categories.map((cat) => (
                  <option key={cat.id} value={cat.id}>
                    {cat.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Price */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Base Price (₦) <span className="text-error">*</span>
              </label>
              <input
                type="number"
                value={basePrice}
                onChange={(e) => setBasePrice(e.target.value)}
                placeholder="15000"
                min="0"
                step="100"
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent focus:ring-1 focus:ring-accent"
                required
              />
            </div>

            {/* Gender */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
              <select
                value={gender}
                onChange={(e) => setGender(e.target.value as "MEN" | "WOMEN" | "UNISEX")}
                className="w-full px-4 py-3 border border-gray-200 rounded-lg focus:outline-none focus:border-accent bg-white"
              >
                <option value="UNISEX">Unisex</option>
                <option value="MEN">Men</option>
                <option value="WOMEN">Women</option>
              </select>
            </div>

            {/* Featured */}
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="featured"
                checked={isFeatured}
                onChange={(e) => setIsFeatured(e.target.checked)}
                className="w-5 h-5 text-accent rounded border-gray-300 focus:ring-accent"
              />
              <label htmlFor="featured" className="text-sm font-medium text-gray-700">
                Featured Product (shown on homepage)
              </label>
            </div>
          </div>
        </div>

        {/* Images */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-semibold mb-4">Product Images</h2>

          {/* Drop Zone */}
          <div
            onDrop={handleDrop}
            onDragOver={(e) => {
              e.preventDefault();
              setIsDragging(true);
            }}
            onDragLeave={() => setIsDragging(false)}
            className={`border-2 border-dashed rounded-xl p-8 text-center transition-colors ${
              isDragging ? "border-accent bg-accent/5" : "border-gray-300 hover:border-accent"
            }`}
          >
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={1.5}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z"
              />
            </svg>
            <p className="mt-2 text-sm text-gray-600">
              Drag and drop images here, or{" "}
              <label className="text-accent cursor-pointer hover:underline">
                browse
                <input type="file" multiple accept="image/*" onChange={handleFileSelect} className="hidden" />
              </label>
            </p>
            <p className="mt-1 text-xs text-gray-500">PNG, JPG, WebP up to 10MB. Max 10 images.</p>
          </div>

          {/* Image Previews */}
          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4">
              {images.map((img, index) => (
                <div key={index} className="relative group">
                  <div className="aspect-square rounded-lg overflow-hidden bg-gray-100">
                    <Image src={img.preview} alt={`Preview ${index + 1}`} fill className="object-cover" />
                  </div>
                  {index === 0 && (
                    <span className="absolute top-2 left-2 bg-accent text-white text-xs px-2 py-1 rounded">Main</span>
                  )}
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-2 right-2 bg-error text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Variants */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold">Product Variants</h2>
            <Button type="button" variant="outline" size="sm" onClick={addVariant}>
              <svg className="w-4 h-4 mr-1" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add Variant
            </Button>
          </div>

          <div className="space-y-4">
            {variants.map((variant, index) => (
              <div key={index} className="grid grid-cols-2 md:grid-cols-5 gap-3 p-4 bg-gray-50 rounded-lg">
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Size</label>
                  <input
                    type="text"
                    value={variant.size}
                    onChange={(e) => updateVariant(index, "size", e.target.value)}
                    placeholder="S, M, L, XL"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Color</label>
                  <input
                    type="text"
                    value={variant.color}
                    onChange={(e) => updateVariant(index, "color", e.target.value)}
                    placeholder="Black, White"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">SKU</label>
                  <div className="flex gap-1">
                    <input
                      type="text"
                      value={variant.sku}
                      onChange={(e) => updateVariant(index, "sku", e.target.value)}
                      placeholder="HD-BLK-M"
                      className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                    />
                    <button
                      type="button"
                      onClick={() => generateSku(index)}
                      title="Generate SKU"
                      className="px-2 text-gray-400 hover:text-accent"
                    >
                      <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                        />
                      </svg>
                    </button>
                  </div>
                </div>
                <div>
                  <label className="block text-xs text-gray-500 mb-1">Stock</label>
                  <input
                    type="number"
                    value={variant.stock}
                    onChange={(e) => updateVariant(index, "stock", parseInt(e.target.value) || 0)}
                    min="0"
                    className="w-full px-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-accent"
                  />
                </div>
                <div className="flex items-end">
                  {variants.length > 1 && (
                    <button
                      type="button"
                      onClick={() => removeVariant(index)}
                      className="px-3 py-2 text-error hover:bg-error/10 rounded-lg transition-colors"
                    >
                      <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth={2}
                          d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                        />
                      </svg>
                    </button>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Submit */}
        <div className="flex justify-end gap-4">
          <Link href="/admin/products">
            <Button type="button" variant="outline" size="lg">
              Cancel
            </Button>
          </Link>
          <Button type="submit" variant="accent" size="lg" disabled={isLoading}>
            {isLoading ? (
              <>
                <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  />
                </svg>
                Creating...
              </>
            ) : (
              "Create Product"
            )}
          </Button>
        </div>
      </form>
    </div>
  );
}
