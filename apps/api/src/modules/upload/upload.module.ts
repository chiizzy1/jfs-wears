import { Module } from "@nestjs/common";
import { ConfigModule } from "@nestjs/config";
import { CloudinaryProvider } from "./cloudinary.provider";
import { CloudinaryService } from "./cloudinary.service";
import { UploadController } from "./upload.controller";
import { PrismaModule } from "../../prisma/prisma.module";

@Module({
  imports: [ConfigModule, PrismaModule],
  controllers: [UploadController],
  providers: [CloudinaryProvider, CloudinaryService],
  exports: [CloudinaryService],
})
export class UploadModule {}
