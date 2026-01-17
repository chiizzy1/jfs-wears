import {
  Controller,
  Get,
  Post,
  Put,
  Delete,
  Body,
  Param,
  Query,
  Request,
  UseGuards,
  UseInterceptors,
  UploadedFiles,
} from "@nestjs/common";
import { FilesInterceptor } from "@nestjs/platform-express";
import { ProductsService } from "./products.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { CreateProductDto, UpdateProductDto, ProductQueryDto, CreateVariantDto } from "./dto/products.dto";
import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { CacheInterceptor, CacheTTL } from "@nestjs/cache-manager";
import { CloudinaryService } from "../upload/cloudinary.service";
import { AuditLogService } from "../audit-log/audit-log.service";
import { AuditAction } from "@prisma/client";

@ApiTags("Products")
@Controller("products")
@UseInterceptors(CacheInterceptor)
export class ProductsController {
  constructor(
    private productsService: ProductsService,
    private cloudinaryService: CloudinaryService,
    private auditLogService: AuditLogService,
  ) {}

  @Get()
  @CacheTTL(300) // 5 minutes
  async findAll(@Query() query: ProductQueryDto) {
    return this.productsService.findAll(query);
  }

  @Get("featured")
  @CacheTTL(600) // 10 minutes
  async getFeatured(@Query("limit") limit?: string) {
    return this.productsService.getFeatured(limit ? parseInt(limit) : 8);
  }

  // Related products (public, for cross-sell)
  @Get(":id/related")
  @CacheTTL(600) // 10 minutes cache
  async getRelated(@Param("id") id: string, @Query("limit") limit?: string) {
    return this.productsService.findRelated(id, limit ? parseInt(limit) : 4);
  }

  // Admin: Get product by ID (must be before :slug route)
  @Get("id/:id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async findById(@Param("id") id: string) {
    return this.productsService.findById(id);
  }

  // Storefront: Get product by slug
  @Get(":slug")
  @CacheTTL(300)
  async findBySlug(@Param("slug") slug: string) {
    return this.productsService.findBySlug(slug);
  }

  // Admin routes
  @Post()
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async create(@Request() req: any, @Body() createProductDto: CreateProductDto) {
    const result = await this.productsService.create(createProductDto);
    await this.auditLogService.logFromRequest(req, AuditAction.CREATE, "Product", result.id, `Created product "${result.name}"`, {
      productName: result.name,
      slug: result.slug,
    });
    return result;
  }

  @Put(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async update(@Request() req: any, @Param("id") id: string, @Body() updateProductDto: UpdateProductDto) {
    const result = await this.productsService.update(id, updateProductDto);
    await this.auditLogService.logFromRequest(req, AuditAction.UPDATE, "Product", id, `Updated product "${result.name}"`, {
      productName: result.name,
      changes: Object.keys(updateProductDto),
    });
    return result;
  }

  @Delete(":id")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async delete(@Request() req: any, @Param("id") id: string, @Query("hard") hard?: string) {
    const product = await this.productsService.findById(id);
    let result;
    if (hard === "true") {
      result = await this.productsService.delete(id); // Hard delete
    } else {
      result = await this.productsService.softDelete(id); // Soft delete (archive)
    }
    await this.auditLogService.logFromRequest(
      req,
      AuditAction.DELETE,
      "Product",
      id,
      `Deleted product "${product?.name}" (${hard === "true" ? "permanent" : "archived"})`,
      { productName: product?.name, hardDelete: hard === "true" },
    );
    return result;
  }

  @Post(":id/restore")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER")
  async restore(@Request() req: any, @Param("id") id: string) {
    const result = await this.productsService.restore(id);
    await this.auditLogService.logFromRequest(req, AuditAction.RESTORE, "Product", id, `Restored product "${result.name}"`, {
      productName: result.name,
    });
    return result;
  }

  // Variant management
  @Post(":id/variants")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async createVariant(@Param("id") productId: string, @Body() createVariantDto: CreateVariantDto) {
    return this.productsService.createVariant(productId, createVariantDto);
  }

  // Image management - URL based (for external URLs)
  @Post(":id/images")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  async addImage(
    @Param("id") productId: string,
    @Body()
    data: {
      url: string;
      isMain?: boolean;
    },
  ) {
    return this.productsService.addImage(productId, data.url, data.isMain);
  }

  // Image management - File upload (uploads to Cloudinary)
  @Post(":id/upload-images")
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
  async uploadProductImages(@Param("id") productId: string, @UploadedFiles() files: Express.Multer.File[]) {
    // Upload files to Cloudinary
    const uploadResults = await this.cloudinaryService.uploadImages(files);

    // Save each image URL to the product
    const savedImages = [];
    for (let i = 0; i < uploadResults.length; i++) {
      const result = uploadResults[i];
      // First image is main if product has no existing images
      const isMain = i === 0;
      const image = await this.productsService.addImage(productId, result.secureUrl, isMain);
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
}
