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

// Schema for product form
const productFormSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().min(1, "Description is required"),
  basePrice: z.coerce.number().min(0, "Price must be positive"),
  categoryId: z.string().min(1, "Category is required"),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  isFeatured: z.boolean().optional().default(false),
  selectedSizes: z.array(z.string()).min(1, "Select at least one size"),
  colorGroups: z.array(colorGroupSchema).min(1, "Add at least one color"),
});

type ProductFormValues = z.infer<typeof productFormSchema>;

interface ProductFormProps {
  categories: Category[];
  sizePresets: SizePreset[];
  colorPresets: ColorPreset[];
  onSubmit: (data: ProductFormValues) => void;
  isSubmitting: boolean;
  initialData?: Partial<ProductFormValues>;
}

export function ProductFormV2({ categories, sizePresets, colorPresets, onSubmit, isSubmitting, initialData }: ProductFormProps) {
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
      selectedSizes: [],
      colorGroups: [],
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
      <form onSubmit={form.handleSubmit(handleFormSubmit)} className="space-y-8">
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

        {/* Variant Preview */}
        {selectedSizes.length > 0 && selectedColors.length > 0 && (
          <div className="bg-gray-50 p-6 space-y-4">
            <h2 className="text-xs uppercase tracking-[0.15em] text-muted-foreground font-medium">Variant Preview</h2>
            <p className="text-sm text-gray-600">
              {selectedSizes.length} sizes × {selectedColors.length} colors = {selectedSizes.length * selectedColors.length}{" "}
              variants will be created
            </p>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2">
              {selectedColors.slice(0, 4).map((color) =>
                selectedSizes.slice(0, 3).map((size) => (
                  <div key={`${color.colorName}-${size}`} className="flex items-center gap-2 px-3 py-2 bg-white text-sm">
                    <span className="w-3 h-3" style={{ backgroundColor: color.colorHex || "#ccc" }} />
                    <span>{color.colorName}</span>
                    <span className="text-gray-400">·</span>
                    <span>{size}</span>
                    <span className="text-gray-400 text-xs ml-auto">
                      {generateSkuPrefix()}-{size.slice(0, 1)}-{color.colorName.slice(0, 3).toUpperCase()}
                    </span>
                  </div>
                ))
              )}
              {selectedSizes.length * selectedColors.length > 12 && (
                <div className="flex items-center justify-center px-3 py-2 bg-gray-100 text-sm text-gray-500">
                  +{selectedSizes.length * selectedColors.length - 12} more...
                </div>
              )}
            </div>
          </div>
        )}

        <div className="flex justify-end gap-4">
          <Button type="submit" disabled={isSubmitting} className="w-full md:w-auto">
            {isSubmitting ? "Creating..." : "Create Product"}
          </Button>
        </div>
      </form>
    </Form>
  );
}
