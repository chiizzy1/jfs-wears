"use client";

import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Category, SizePreset, ColorPreset } from "@/lib/admin-api";
import { X, Plus, Image as ImageIcon, Palette, Check } from "lucide-react";
import Image from "next/image";
import { useState, useEffect } from "react";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import toast from "react-hot-toast";

// Schema for color group with images (1-4 images per color)
const colorGroupSchema = z.object({
  colorName: z.string().min(1, "Color name is required"),
  colorHex: z.string().optional(),
  images: z
    .array(
      z.object({
        file: z.instanceof(File).optional(),
        preview: z.string(),
        isMain: z.boolean().default(false),
      })
    )
    .min(1, "At least one image per color is required")
    .max(4, "Maximum 4 images per color (main + 3 views)"),
});

// Schema for bulk pricing tier
const bulkPricingTierSchema = z.object({
  minQuantity: z.coerce.number().int().min(2, "Min quantity must be at least 2"),
  discountPercent: z.coerce.number().min(0).max(100, "Discount must be 0-100%"),
});

// Schema for product form
const productFormSchema = z
  .object({
    name: z.string().min(1, "Name is required"),
    description: z.string().min(1, "Description is required"),
    basePrice: z.coerce.number().min(0, "Price must be positive"),
    categoryId: z.string().min(1, "Category is required"),
    gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
    isFeatured: z.boolean().optional().default(false),
    bulkEnabled: z.boolean().optional().default(false),
    bulkPricingTiers: z.array(bulkPricingTierSchema).optional(),
    selectedSizes: z.array(z.string()).min(1, "Select at least one size"),
    colorGroups: z.array(colorGroupSchema).min(1, "Add at least one color"),
    variantStocks: z.record(z.string(), z.coerce.number().int().min(0)).optional().default({}),
    salePrice: z.coerce.number().min(0, "Sale price must be positive").optional(),
    saleStartDate: z.string().optional(),
    saleEndDate: z.string().optional(),
  })
  .refine(
    (data) => {
      if (data.salePrice && data.basePrice && data.salePrice >= data.basePrice) {
        return false;
      }
      return true;
    },
    {
      message: "Sale price must be less than base price",
      path: ["salePrice"],
    }
  )
  .refine(
    (data) => {
      if (data.saleStartDate && data.saleEndDate) {
        return new Date(data.saleEndDate) > new Date(data.saleStartDate);
      }
      return true;
    },
    {
      message: "End date must be after start date",
      path: ["saleEndDate"],
    }
  );

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  categories: Category[];
  sizePresets: SizePreset[];
  colorPresets: ColorPreset[];
  onSubmit: (data: ProductFormValues) => void;
  isSubmitting: boolean;
  initialData?: Partial<ProductFormValues>;
  isEditing?: boolean;
}

export function ProductFormV2({
  categories,
  sizePresets,
  colorPresets,
  onSubmit,
  isSubmitting,
  initialData,
  isEditing = false,
}: ProductFormProps) {
  const [selectedPreset, setSelectedPreset] = useState<string>("");
  const [availableSizes, setAvailableSizes] = useState<string[]>([]);
  const [customColor, setCustomColor] = useState({ name: "", hex: "#000000" });

  const form = useForm<ProductFormValues>({
    resolver: zodResolver(productFormSchema) as any,
    defaultValues: initialData || {
      name: "",
      description: "",
      basePrice: 0,
      categoryId: "",
      gender: "UNISEX",
      isFeatured: false,
      bulkEnabled: false,
      bulkPricingTiers: [],
      selectedSizes: [],
      colorGroups: [],
      variantStocks: {},
      salePrice: 0,
      saleStartDate: "",
      saleEndDate: "",
    },
  });

  const {
    fields: colorGroups,
    append: addColorGroup,
    remove: removeColorGroup,
  } = useFieldArray({
    control: form.control,
    name: "colorGroups",
  });

  const {
    fields: bulkTiers,
    append: appendBulkTier,
    remove: removeBulkTier,
  } = useFieldArray({
    control: form.control,
    name: "bulkPricingTiers",
  });

  const isBulkEnabled = form.watch("bulkEnabled");

  // Update available sizes when preset changes
  useEffect(() => {
    if (selectedPreset) {
      const preset = sizePresets.find((p) => p.id === selectedPreset);
      if (preset) {
        setAvailableSizes(preset.sizes);
      }
    }
  }, [selectedPreset, sizePresets]);

  // Set default preset on load
  useEffect(() => {
    const defaultPreset = sizePresets.find((p) => p.isDefault);
    if (defaultPreset && !selectedPreset) {
      setSelectedPreset(defaultPreset.id);
      setAvailableSizes(defaultPreset.sizes);
    }
  }, [sizePresets, selectedPreset]);

  const handleImageChange = (colorIndex: number, e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      const currentImages = form.getValues(`colorGroups.${colorIndex}.images`) || [];
      const newImages = Array.from(e.target.files).map((file, idx) => ({
        file,
        preview: URL.createObjectURL(file),
        isMain: currentImages.length === 0 && idx === 0,
      }));
      form.setValue(`colorGroups.${colorIndex}.images`, [...currentImages, ...newImages]);
    }
  };

  const removeImage = (colorIndex: number, imageIndex: number) => {
    const currentImages = form.getValues(`colorGroups.${colorIndex}.images`) || [];
    const image = currentImages[imageIndex];
    if (image?.preview) {
      URL.revokeObjectURL(image.preview);
    }
    const newImages = currentImages.filter((_, i) => i !== imageIndex);
    form.setValue(`colorGroups.${colorIndex}.images`, newImages);
  };

  const addColorFromPreset = (preset: ColorPreset) => {
    // Check if color already exists
    const existingColors = form.getValues("colorGroups").map((c) => c.colorName.toLowerCase());
    if (existingColors.includes(preset.name.toLowerCase())) {
      return; // Already added
    }
    addColorGroup({
      colorName: preset.name,
      colorHex: preset.hexCode,
      images: [],
    });
  };

  const addCustomColor = () => {
    if (!customColor.name.trim()) return;
    const existingColors = form.getValues("colorGroups").map((c) => c.colorName.toLowerCase());
    if (existingColors.includes(customColor.name.toLowerCase())) {
      return;
    }
    addColorGroup({
      colorName: customColor.name,
      colorHex: customColor.hex,
      images: [],
    });
    setCustomColor({ name: "", hex: "#000000" });
  };

  const toggleSize = (size: string) => {
    const currentSizes = form.getValues("selectedSizes");
    if (currentSizes.includes(size)) {
      form.setValue(
        "selectedSizes",
        currentSizes.filter((s) => s !== size)
      );
    } else {
      form.setValue("selectedSizes", [...currentSizes, size]);
    }
  };

  const generateSkuPrefix = () => {
    const name = form.getValues("name");
    return name.slice(0, 3).toUpperCase() || "PRD";
  };

  const handleFormSubmit = (data: ProductFormValues) => {
    // Generate variants from size × color combinations
    console.log("Form data:", data);
    onSubmit(data);
  };

  const selectedSizes = form.watch("selectedSizes");
  const selectedColors = form.watch("colorGroups");

  return (
    <Form {...form}>
      <form
        onSubmit={form.handleSubmit(handleFormSubmit, (errors) => {
          console.error("Form validation errors:", errors);

          // Helper to get error messages recursively
          const getErrorMessages = (obj: any): string[] => {
            let messages: string[] = [];
            for (const key in obj) {
              if (obj[key]?.message) {
                messages.push(obj[key].message);
              } else if (typeof obj[key] === "object") {
                messages = [...messages, ...getErrorMessages(obj[key])];
              }
            }
            return messages;
          };

          const errorMessages = getErrorMessages(errors);

          if (errorMessages.length > 0) {
            // Show the first few errors to avoid spamming
            const uniqueErrors = Array.from(new Set(errorMessages));
            toast.error(
              <div className="flex flex-col gap-1">
                <span className="font-semibold">Please fix the following errors:</span>
                <ul className="list-disc pl-4 text-sm">
                  {uniqueErrors.slice(0, 3).map((msg, i) => (
                    <li key={i}>{msg}</li>
                  ))}
                  {uniqueErrors.length > 3 && <li>...and {uniqueErrors.length - 3} more</li>}
                </ul>
              </div>,
              { duration: 5000 }
            );
          } else {
            toast.error("Please fix the errors in the form before submitting.");
          }
        })}
        className="space-y-8"
      >
        {/* Basic Info */}
        <div className="bg-white p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Product Information</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Product Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Men's Casual Dress Pants" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem className="md:col-span-2">
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Product description..." rows={4} {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="basePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Base Price (₦)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="25000"
                      value={field.value || ""}
                      onChange={(e) => {
                        // Parse as number immediately to strip leading zeros
                        const rawValue = e.target.value;
                        if (rawValue === "") {
                          field.onChange(0);
                        } else {
                          // parseInt will automatically strip leading zeros
                          const parsed = parseInt(rawValue, 10);
                          field.onChange(isNaN(parsed) ? 0 : parsed);
                        }
                      }}
                      onBlur={field.onBlur}
                      name={field.name}
                      ref={field.ref}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="categoryId"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Category</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select category" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {categories.map((cat) => (
                        <SelectItem key={cat.id} value={cat.id}>
                          {cat.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="gender"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Gender</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select gender" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="MEN">Men</SelectItem>
                      <SelectItem value="WOMEN">Women</SelectItem>
                      <SelectItem value="UNISEX">Unisex</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="isFeatured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0 p-4">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>Featured Product</FormLabel>
                    <FormDescription>Show on homepage</FormDescription>
                  </div>
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Sale Information */}
        <div className="bg-white p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Sale Information (Optional)</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <FormField
              control={form.control}
              name="salePrice"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Price (₦)</FormLabel>
                  <FormControl>
                    <Input
                      type="number"
                      min={0}
                      placeholder="Optional"
                      value={field.value || ""}
                      onChange={(e) => {
                        const rawValue = e.target.value;
                        if (rawValue === "") {
                          field.onChange(undefined);
                        } else {
                          const parsed = parseInt(rawValue, 10);
                          field.onChange(isNaN(parsed) ? 0 : parsed);
                        }
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saleStartDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale Start Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            <FormField
              control={form.control}
              name="saleEndDate"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Sale End Date</FormLabel>
                  <FormControl>
                    <Input type="datetime-local" {...field} value={field.value || ""} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
          </div>
        </div>

        {/* Bulk Pricing */}
        <div className="bg-white p-6 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Bulk Pricing</h2>
            <FormField
              control={form.control}
              name="bulkEnabled"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2 space-y-0">
                  <FormControl>
                    <Checkbox checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                  <FormLabel className="font-normal text-gray-600">Enable Bulk Discounts</FormLabel>
                </FormItem>
              )}
            />
          </div>

          {isBulkEnabled && (
            <div className="space-y-4 border-t pt-4">
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm text-muted-foreground">Define discount tiers based on quantity.</span>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => appendBulkTier({ minQuantity: 10, discountPercent: 5 })}
                >
                  <Plus className="w-4 h-4 mr-2" />
                  Add Tier
                </Button>
              </div>

              {bulkTiers.length === 0 ? (
                <div className="text-center py-6 bg-gray-50 border border-dashed text-sm text-gray-500">
                  No pricing tiers added. Click "Add Tier" to start.
                </div>
              ) : (
                <div className="border overflow-hidden">
                  <table className="w-full text-sm">
                    <thead className="bg-gray-100 border-b">
                      <tr>
                        <th className="text-left p-3 font-medium">Min Quantity</th>
                        <th className="text-left p-3 font-medium">Discount (%)</th>
                        <th className="text-right p-3 font-medium">Action</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y">
                      {bulkTiers.map((tier, index) => (
                        <tr key={tier.id} className="bg-white">
                          <td className="p-3">
                            <FormField
                              control={form.control}
                              name={`bulkPricingTiers.${index}.minQuantity`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <Input type="number" {...field} min={2} className="w-24 h-8" placeholder="Qty" />
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </td>
                          <td className="p-3">
                            <FormField
                              control={form.control}
                              name={`bulkPricingTiers.${index}.discountPercent`}
                              render={({ field }) => (
                                <FormItem>
                                  <FormControl>
                                    <div className="relative w-24">
                                      <Input
                                        type="number"
                                        {...field}
                                        min={0}
                                        max={100}
                                        step={0.1}
                                        className="h-8 pr-6"
                                        placeholder="%"
                                      />
                                      <span className="absolute right-2 top-1.5 text-xs text-gray-500">%</span>
                                    </div>
                                  </FormControl>
                                  <FormMessage />
                                </FormItem>
                              )}
                            />
                          </td>
                          <td className="p-3 text-right">
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                              onClick={() => removeBulkTier(index)}
                            >
                              <X className="w-4 h-4" />
                            </Button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Size Selection */}
        <div className="bg-white p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Sizes</h2>
          <div className="space-y-4">
            <div className="flex items-center gap-4">
              <label className="text-sm font-medium">Size Preset:</label>
              <Select value={selectedPreset} onValueChange={setSelectedPreset}>
                <SelectTrigger className="w-[200px]">
                  <SelectValue placeholder="Select a preset" />
                </SelectTrigger>
                <SelectContent>
                  {sizePresets.map((preset) => (
                    <SelectItem key={preset.id} value={preset.id}>
                      {preset.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {availableSizes.length > 0 && (
              <div>
                <p className="text-sm text-gray-500 mb-2">Click to select sizes:</p>
                <div className="flex flex-wrap gap-2">
                  {availableSizes.map((size) => (
                    <button
                      key={size}
                      type="button"
                      onClick={() => toggleSize(size)}
                      className={cn(
                        "px-4 py-2 text-sm font-medium transition-all",
                        selectedSizes.includes(size) ? "bg-black text-white" : "bg-white text-gray-700 hover:bg-gray-50"
                      )}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {selectedSizes.length > 0 && (
              <p className="text-sm text-green-600">
                ✓ {selectedSizes.length} size(s) selected: {selectedSizes.join(", ")}
              </p>
            )}
          </div>
        </div>

        {/* Color Selection with Images */}
        <div className="bg-white p-6 space-y-4">
          <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Colors & Images</h2>

          {/* Color Preset Swatches */}
          <div className="space-y-2">
            <p className="text-sm font-medium">Quick add from presets:</p>
            <div className="flex flex-wrap gap-2">
              {colorPresets.slice(0, 12).map((preset) => {
                const isSelected = selectedColors.some((c) => c.colorName.toLowerCase() === preset.name.toLowerCase());
                return (
                  <button
                    key={preset.id}
                    type="button"
                    onClick={() => addColorFromPreset(preset)}
                    disabled={isSelected}
                    className={cn(
                      "relative flex items-center gap-2 px-3 py-1.5 text-xs font-medium transition-all",
                      isSelected ? "bg-gray-100 text-gray-400 cursor-not-allowed" : "bg-white hover:bg-gray-50"
                    )}
                  >
                    <span className="w-4 h-4" style={{ backgroundColor: preset.hexCode }} />
                    {preset.name}
                    {isSelected && <Check className="w-3 h-3" />}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Custom Color Input */}
          <div className="flex items-end gap-3 pt-2 border-t">
            <div className="flex-1">
              <label className="text-sm font-medium">Custom Color Name</label>
              <Input
                placeholder="e.g., Sunset Orange"
                value={customColor.name}
                onChange={(e) => setCustomColor((prev) => ({ ...prev, name: e.target.value }))}
              />
            </div>
            <div>
              <label className="text-sm font-medium">Hex</label>
              <div className="flex items-center gap-2">
                <input
                  type="color"
                  value={customColor.hex}
                  onChange={(e) => setCustomColor((prev) => ({ ...prev, hex: e.target.value }))}
                  className="w-10 h-10 rounded cursor-pointer"
                />
                <Input
                  value={customColor.hex}
                  onChange={(e) => setCustomColor((prev) => ({ ...prev, hex: e.target.value }))}
                  className="w-24"
                />
              </div>
            </div>
            <Button type="button" variant="outline" onClick={addCustomColor}>
              <Plus className="w-4 h-4 mr-1" /> Add
            </Button>
          </div>

          {/* Color Groups with Image Upload */}
          <div className="space-y-6 pt-4">
            {colorGroups.map((colorGroup, colorIndex) => (
              <div
                key={colorGroup.id}
                className="p-4"
                style={{ borderLeft: `3px solid ${form.getValues(`colorGroups.${colorIndex}.colorHex`) || "#e5e7eb"}` }}
              >
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <span
                      className="w-6 h-6"
                      style={{ backgroundColor: form.getValues(`colorGroups.${colorIndex}.colorHex`) || "#ccc" }}
                    />
                    <span className="font-medium">{form.getValues(`colorGroups.${colorIndex}.colorName`)}</span>
                  </div>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="text-red-500 hover:text-red-600 hover:bg-red-50"
                    onClick={() => removeColorGroup(colorIndex)}
                  >
                    <X className="w-4 h-4" /> Remove Color
                  </Button>
                </div>

                {/* Images for this color */}
                <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                  {(form.getValues(`colorGroups.${colorIndex}.images`) || []).map((img, imgIndex) => (
                    <div key={imgIndex} className="relative aspect-square bg-gray-100 overflow-hidden group">
                      <Image src={img.preview} alt={`${colorGroup.colorName} ${imgIndex}`} fill className="object-cover" />
                      <button
                        type="button"
                        onClick={() => removeImage(colorIndex, imgIndex)}
                        className="absolute top-2 right-2 p-1 bg-red-500 text-white opacity-0 group-hover:opacity-100 transition-opacity"
                      >
                        <X className="w-4 h-4" />
                      </button>
                      {img.isMain && (
                        <span className="absolute bottom-2 left-2 px-2 py-0.5 bg-black text-white text-xs">Main</span>
                      )}
                    </div>
                  ))}
                  <label className="flex flex-col items-center justify-center aspect-square border-2 border-dashed cursor-pointer hover:bg-gray-50 transition-colors">
                    <ImageIcon className="w-6 h-6 text-gray-400 mb-1" />
                    <span className="text-xs text-gray-500">Add Images</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => handleImageChange(colorIndex, e)}
                    />
                  </label>
                </div>
              </div>
            ))}

            {colorGroups.length === 0 && (
              <div className="text-center py-8 text-gray-500">
                <Palette className="w-12 h-12 mx-auto mb-2 opacity-50" />
                <p>No colors added yet. Click a color swatch above or add a custom color.</p>
              </div>
            )}
          </div>
        </div>

        {/* Variant Stock Management */}
        {selectedSizes.length > 0 && selectedColors.length > 0 && (
          <div className="bg-gray-50 p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Inventory & Variants</h2>
              <p className="text-sm text-gray-600">
                {selectedSizes.length} sizes × {selectedColors.length} colors = {selectedSizes.length * selectedColors.length}{" "}
                variants
              </p>
            </div>

            {/* Stock input table */}
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Color</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Size</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-600">SKU</th>
                    <th className="text-left py-2 px-2 font-medium text-gray-600">Stock</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedColors.map((color) =>
                    selectedSizes.map((size) => {
                      const variantKey = `${color.colorName}-${size}`;
                      const sku = `${generateSkuPrefix()}-${size.slice(0, 2).toUpperCase()}-${color.colorName
                        .slice(0, 3)
                        .toUpperCase()}`;
                      return (
                        <tr key={variantKey} className="border-b border-gray-100 hover:bg-gray-100/50">
                          <td className="py-2 px-2">
                            <div className="flex items-center gap-2">
                              <span
                                className="w-3 h-3 rounded-sm border border-gray-300"
                                style={{ backgroundColor: color.colorHex || "#ccc" }}
                              />
                              <span>{color.colorName}</span>
                            </div>
                          </td>
                          <td className="py-2 px-2 font-medium">{size}</td>
                          <td className="py-2 px-2 text-gray-500 text-xs font-mono">{sku}</td>
                          <td className="py-2 px-2">
                            <Input
                              type="number"
                              min={0}
                              className="w-20 h-8 text-center"
                              placeholder="0"
                              {...form.register(`variantStocks.${variantKey}` as const)}
                            />
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>

            {/* Quick fill action */}
            <div className="flex items-center gap-2 pt-2 border-t border-gray-200">
              <span className="text-xs text-gray-500">Quick fill all:</span>
              <Input
                type="number"
                min={0}
                className="w-20 h-7 text-center text-xs"
                placeholder="Stock"
                onChange={(e) => {
                  const value = parseInt(e.target.value) || 0;
                  const newStocks: Record<string, number> = {};
                  selectedColors.forEach((color) => {
                    selectedSizes.forEach((size) => {
                      newStocks[`${color.colorName}-${size}`] = value;
                    });
                  });
                  form.setValue("variantStocks", newStocks);
                }}
              />
              <span className="text-xs text-gray-400">units each</span>
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? (isEditing ? "Updating..." : "Creating...") : isEditing ? "Update Product" : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
