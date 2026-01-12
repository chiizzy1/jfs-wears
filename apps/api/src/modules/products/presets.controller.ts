import { Controller, Get, Post, Put, Delete, Body, Param, UseGuards, UseInterceptors, UploadedFiles } from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { CloudinaryService } from "../upload/cloudinary.service";
import {
  PresetsService,
  CreateSizePresetDto,
  CreateColorPresetDto,
  CreateColorGroupDto,
  CreateVariantImageDto,
} from "./presets.service";

@ApiTags("Product Presets")
@Controller("products/presets")
export class PresetsController {
  constructor(private presetsService: PresetsService, private cloudinaryService: CloudinaryService) {}

  // ============================================
  // SIZE PRESETS (Global, reusable)
  // ============================================

  @Get("sizes")
  async getAllSizePresets() {
    return this.presetsService.findAllSizePresets();
  }

  @Post("sizes")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async createSizePreset(@Body() data: CreateSizePresetDto) {
    return this.presetsService.createSizePreset(data);
  }

  @Put("sizes/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async updateSizePreset(@Param("id") id: string, @Body() data: Partial<CreateSizePresetDto>) {
    return this.presetsService.updateSizePreset(id, data);
  }

  @Delete("sizes/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async deleteSizePreset(@Param("id") id: string) {
    return this.presetsService.deleteSizePreset(id);
  }

  // ============================================
  // COLOR PRESETS (Global, reusable)
  // ============================================

  @Get("colors")
  async getAllColorPresets() {
    return this.presetsService.findAllColorPresets();
  }

  @Post("colors")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async createColorPreset(@Body() data: CreateColorPresetDto) {
    return this.presetsService.createColorPreset(data);
  }

  @Put("colors/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async updateColorPreset(@Param("id") id: string, @Body() data: Partial<CreateColorPresetDto>) {
    return this.presetsService.updateColorPreset(id, data);
  }

  @Delete("colors/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async deleteColorPreset(@Param("id") id: string) {
    return this.presetsService.deleteColorPreset(id);
  }
}

// Controller for product-specific color groups
@ApiTags("Product Color Groups")
@Controller("products/:productId/color-groups")
export class ColorGroupsController {
  constructor(private presetsService: PresetsService, private cloudinaryService: CloudinaryService) {}

  @Get()
  async getColorGroups(@Param("productId") productId: string) {
    return this.presetsService.findColorGroupsByProduct(productId);
  }

  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async createColorGroup(@Param("productId") productId: string, @Body() data: CreateColorGroupDto) {
    return this.presetsService.createColorGroup(productId, data);
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async updateColorGroup(@Param("id") id: string, @Body() data: Partial<CreateColorGroupDto>) {
    return this.presetsService.updateColorGroup(id, data);
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async deleteColorGroup(@Param("id") id: string) {
    return this.presetsService.deleteColorGroup(id);
  }

  // ============================================
  // VARIANT IMAGES (Per color group)
  // ============================================

  @Post(":colorGroupId/images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async addVariantImage(@Param("colorGroupId") colorGroupId: string, @Body() data: CreateVariantImageDto) {
    return this.presetsService.addVariantImage(colorGroupId, data);
  }

  @Post(":colorGroupId/upload-images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  @UseInterceptors(FilesInterceptor("files", 10))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: { type: "string", format: "binary" },
        },
      },
    },
  })
  async uploadVariantImages(@Param("colorGroupId") colorGroupId: string, @UploadedFiles() files: Express.Multer.File[]) {
    // Upload files to Cloudinary
    const uploadResults = await this.cloudinaryService.uploadImages(files);

    // Save each image to the color group
    const savedImages = [];
    for (let i = 0; i < uploadResults.length; i++) {
      const result = uploadResults[i];
      const isMain = i === 0; // First image is main
      const image = await this.presetsService.addVariantImage(colorGroupId, {
        url: result.secureUrl,
        isMain,
      });
      savedImages.push({
        ...image,
        cloudinaryPublicId: result.publicId,
      });
    }

    return {
      message: `Successfully uploaded ${savedImages.length} image(s)`,
      images: savedImages,
    };
  }

  @Put(":colorGroupId/images/:imageId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async updateVariantImage(@Param("imageId") imageId: string, @Body() data: Partial<CreateVariantImageDto>) {
    return this.presetsService.updateVariantImage(imageId, data);
  }

  @Delete(":colorGroupId/images/:imageId")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async deleteVariantImage(@Param("imageId") imageId: string) {
    return this.presetsService.deleteVariantImage(imageId);
  }

  @Post(":colorGroupId/images/:imageId/set-main")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async setMainImage(@Param("colorGroupId") colorGroupId: string, @Param("imageId") imageId: string) {
    return this.presetsService.setMainVariantImage(colorGroupId, imageId);
  }
}
