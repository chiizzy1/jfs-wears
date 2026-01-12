import { Injectable } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";

// DTOs
export class CreateSizePresetDto {
  name: string;
  category: string;
  sizes: string[];
  isDefault?: boolean;
}

export class CreateColorPresetDto {
  name: string;
  hexCode: string;
}

export class CreateColorGroupDto {
  colorName: string;
  colorHex?: string;
  position?: number;
}

export class CreateVariantImageDto {
  url: string;
  altText?: string;
  position?: number;
  isMain?: boolean;
}

@Injectable()
export class PresetsService {
  constructor(private prisma: PrismaService) {}

  // ============================================
  // SIZE PRESETS
  // ============================================

  async findAllSizePresets() {
    return this.prisma.sizePreset.findMany({
      orderBy: [{ isDefault: "desc" }, { name: "asc" }],
    });
  }

  async createSizePreset(data: CreateSizePresetDto) {
    return this.prisma.sizePreset.create({ data });
  }

  async updateSizePreset(id: string, data: Partial<CreateSizePresetDto>) {
    return this.prisma.sizePreset.update({
      where: { id },
      data,
    });
  }

  async deleteSizePreset(id: string) {
    return this.prisma.sizePreset.delete({ where: { id } });
  }

  // ============================================
  // COLOR PRESETS
  // ============================================

  async findAllColorPresets() {
    return this.prisma.colorPreset.findMany({
      orderBy: { name: "asc" },
    });
  }

  async createColorPreset(data: CreateColorPresetDto) {
    return this.prisma.colorPreset.create({ data });
  }

  async updateColorPreset(id: string, data: Partial<CreateColorPresetDto>) {
    return this.prisma.colorPreset.update({
      where: { id },
      data,
    });
  }

  async deleteColorPreset(id: string) {
    return this.prisma.colorPreset.delete({ where: { id } });
  }

  // ============================================
  // COLOR GROUPS (Product-specific colors with images)
  // ============================================

  async findColorGroupsByProduct(productId: string) {
    return this.prisma.colorGroup.findMany({
      where: { productId },
      include: {
        images: { orderBy: { position: "asc" } },
        variants: true,
      },
      orderBy: { position: "asc" },
    });
  }

  async createColorGroup(productId: string, data: CreateColorGroupDto) {
    const position = await this.prisma.colorGroup.count({ where: { productId } });
    return this.prisma.colorGroup.create({
      data: {
        productId,
        colorName: data.colorName,
        colorHex: data.colorHex,
        position: data.position ?? position,
      },
      include: { images: true },
    });
  }

  async updateColorGroup(id: string, data: Partial<CreateColorGroupDto>) {
    return this.prisma.colorGroup.update({
      where: { id },
      data,
      include: { images: true },
    });
  }

  async deleteColorGroup(id: string) {
    return this.prisma.colorGroup.delete({ where: { id } });
  }

  // ============================================
  // VARIANT IMAGES (Images for specific color groups)
  // ============================================

  async addVariantImage(colorGroupId: string, data: CreateVariantImageDto) {
    const position = await this.prisma.variantImage.count({ where: { colorGroupId } });
    return this.prisma.variantImage.create({
      data: {
        colorGroupId,
        url: data.url,
        altText: data.altText,
        position: data.position ?? position,
        isMain: data.isMain ?? false,
      },
    });
  }

  async updateVariantImage(id: string, data: Partial<CreateVariantImageDto>) {
    return this.prisma.variantImage.update({
      where: { id },
      data,
    });
  }

  async deleteVariantImage(id: string) {
    return this.prisma.variantImage.delete({ where: { id } });
  }

  async setMainVariantImage(colorGroupId: string, imageId: string) {
    // First, unset all main images in this color group
    await this.prisma.variantImage.updateMany({
      where: { colorGroupId },
      data: { isMain: false },
    });

    // Then set the specified image as main
    return this.prisma.variantImage.update({
      where: { id: imageId },
      data: { isMain: true },
    });
  }
}
