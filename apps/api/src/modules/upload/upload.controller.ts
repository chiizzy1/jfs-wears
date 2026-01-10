import { Controller, Post, Delete, Param, UseGuards, UseInterceptors, UploadedFile, UploadedFiles } from "@nestjs/common";
import { FileInterceptor, FilesInterceptor } from "@nestjs/platform-express";
import { ApiTags, ApiConsumes, ApiBody } from "@nestjs/swagger";
import { CloudinaryService, CloudinaryUploadResult } from "./cloudinary.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";

@ApiTags("Upload")
@Controller("upload")
@UseGuards(JwtAuthGuard, RolesGuard)
@Roles("ADMIN", "MANAGER", "STAFF")
export class UploadController {
  constructor(private readonly cloudinaryService: CloudinaryService) {}

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
   * Delete an image by its public ID
   * DELETE /upload/:publicId
   */
  @Delete(":publicId")
  async deleteImage(@Param("publicId") publicId: string): Promise<{ result: string }> {
    return this.cloudinaryService.deleteImage(publicId);
  }
}
