import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { v2 as cloudinary } from "cloudinary";
import { UploadApiResponse, UploadApiErrorResponse } from "cloudinary";
import * as streamifier from "streamifier";

export interface CloudinaryUploadResult {
  url: string;
  secureUrl: string;
  publicId: string;
  format: string;
  width: number;
  height: number;
  bytes: number;
}

@Injectable()
export class CloudinaryService {
  private readonly logger = new Logger(CloudinaryService.name);

  /**
   * Upload a single image to Cloudinary
   * @param file - Express multer file object
   * @param folder - Cloudinary folder to store the image (default: "jfswears/products")
   */
  async uploadImage(file: Express.Multer.File, folder: string = "jfswears/products"): Promise<CloudinaryUploadResult> {
    if (!file) {
      throw new BadRequestException("No file provided");
    }

    // Validate file type
    const allowedMimeTypes = ["image/jpeg", "image/png", "image/webp", "image/gif", "image/avif"];
    if (!allowedMimeTypes.includes(file.mimetype)) {
      throw new BadRequestException(`Invalid file type. Allowed types: ${allowedMimeTypes.join(", ")}`);
    }

    // Max file size: 10MB
    const maxSize = 10 * 1024 * 1024;
    if (file.size > maxSize) {
      throw new BadRequestException("File size exceeds 10MB limit");
    }

    return new Promise<CloudinaryUploadResult>((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          folder,
          resource_type: "image",
          // Auto-format: delivers AVIF/WebP if browser supports it
          transformation: [
            {
              quality: "auto",
              fetch_format: "auto",
            },
          ],
        },
        (error: UploadApiErrorResponse | undefined, result: UploadApiResponse | undefined) => {
          if (error) {
            this.logger.error(`Cloudinary upload failed: ${error.message}`);
            reject(new BadRequestException(`Upload failed: ${error.message}`));
          } else if (result) {
            this.logger.log(`Image uploaded successfully: ${result.public_id}`);
            resolve({
              url: result.url,
              secureUrl: result.secure_url,
              publicId: result.public_id,
              format: result.format,
              width: result.width,
              height: result.height,
              bytes: result.bytes,
            });
          }
        }
      );

      streamifier.createReadStream(file.buffer).pipe(uploadStream);
    });
  }

  /**
   * Upload multiple images to Cloudinary
   * @param files - Array of Express multer file objects
   * @param folder - Cloudinary folder to store the images
   */
  async uploadImages(files: Express.Multer.File[], folder: string = "jfswears/products"): Promise<CloudinaryUploadResult[]> {
    if (!files || files.length === 0) {
      throw new BadRequestException("No files provided");
    }

    // Max 10 images per upload
    if (files.length > 10) {
      throw new BadRequestException("Maximum 10 images per upload");
    }

    const uploadPromises = files.map((file) => this.uploadImage(file, folder));
    return Promise.all(uploadPromises);
  }

  /**
   * Delete an image from Cloudinary
   * @param publicId - The public ID of the image to delete
   */
  async deleteImage(publicId: string): Promise<{ result: string }> {
    if (!publicId) {
      throw new BadRequestException("No public ID provided");
    }

    try {
      const result = await cloudinary.uploader.destroy(publicId);
      this.logger.log(`Image deleted: ${publicId}, result: ${result.result}`);
      return result;
    } catch (error) {
      this.logger.error(`Failed to delete image: ${publicId}`, error);
      throw new BadRequestException(`Failed to delete image: ${error.message}`);
    }
  }

  /**
   * Get an optimized URL for an existing image
   * @param publicId - The public ID of the image
   * @param options - Transformation options (width, height, crop, etc.)
   */
  getOptimizedUrl(
    publicId: string,
    options?: {
      width?: number;
      height?: number;
      crop?: string;
    }
  ): string {
    return cloudinary.url(publicId, {
      fetch_format: "auto",
      quality: "auto",
      ...options,
    });
  }
}
