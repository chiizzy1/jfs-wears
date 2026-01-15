import {
  Controller,
  Post,
  Delete,
  Param,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  UploadedFiles,
  BadRequestException,
} from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiConsumes, ApiBody, ApiOperation } from "@nestjs/swagger";
import { CloudinaryService, CloudinaryUploadResult } from "./cloudinary.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { PrismaService } from "../../prisma/prisma.service";

@ApiTags("Upload")
@Controller("upload")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "MANAGER", "STAFF")
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService, private readonly prisma: PrismaService) {}

  /**
   * Upload a single image
   * POST /upload/image
   */
  @Post("image")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
        },
      },
    },
  })
  async uploadImage(@UploadedFile() file: Express.Multer.File): Promise<CloudinaryUploadResult> {
    return this.cloudinaryService.uploadImage(file);
  }

  /**
   * Upload multiple images (max 10)
   * POST /upload/images
   */
  @Post("images")
  @UseInterceptors(FilesInterceptor("files", 10))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        files: {
          type: "array",
          items: {
            type: "string",
            format: "binary",
          },
        },
      },
    },
  })
  async uploadImages(@UploadedFiles() files: Express.Multer.File[]): Promise<CloudinaryUploadResult[]> {
    return this.cloudinaryService.uploadImages(files);
  }

  /**
   * Upload storefront media (image or video) for CMS
   * POST /upload/storefront
   * Supports: JPEG, PNG, WebP, GIF, MP4, WebM
   */
  @Post("storefront")
  @UseInterceptors(FileInterceptor("file"))
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Image (JPEG, PNG, WebP, GIF) or Video (MP4, WebM) file",
        },
      },
    },
  })
  async uploadStorefrontMedia(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadStorefrontMedia(file);
  }

  /**
   * Upload category image and update database
   * POST /upload/category/:categoryId
   */
  @Post("category/:categoryId")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload category image and update category" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Category image (JPEG, PNG, WebP)",
        },
      },
    },
  })
  async uploadCategoryImage(@Param("categoryId") categoryId: string, @UploadedFile() file: Express.Multer.File) {
    // Verify category exists
    const category = await this.prisma.category.findUnique({
      where: { id: categoryId },
    });

    if (!category) {
      throw new BadRequestException(`Category with ID ${categoryId} not found`);
    }

    // Upload to Cloudinary
    const result = await this.cloudinaryService.uploadImage(file, "jfs-wears/categories");

    // Update category with new image URL
    const updated = await this.prisma.category.update({
      where: { id: categoryId },
      data: { imageUrl: result.secureUrl },
    });

    return {
      message: "Category image uploaded successfully",
      imageUrl: result.secureUrl,
      category: {
        id: updated.id,
        name: updated.name,
        imageUrl: updated.imageUrl,
      },
    };
  }

  /**
   * Upload blog post cover image
   * POST /upload/blog
   */
  @Post("blog")
  @UseInterceptors(FileInterceptor("file"))
  @ApiOperation({ summary: "Upload blog post cover image" })
  @ApiConsumes("multipart/form-data")
  @ApiBody({
    schema: {
      type: "object",
      properties: {
        file: {
          type: "string",
          format: "binary",
          description: "Cover image (JPEG, PNG, WebP)",
        },
      },
    },
  })
  async uploadBlogImage(@UploadedFile() file: Express.Multer.File) {
    return this.cloudinaryService.uploadImage(file, "jfs-wears/blog");
  }

  /**
   * Delete an image by its public ID
   * DELETE /upload/:publicId
   */
  @Delete(":publicId")
  async deleteImage(@Param("publicId") publicId: string): Promise<{ result: string }> {
    return this.cloudinaryService.deleteImage(publicId);
  }
}
