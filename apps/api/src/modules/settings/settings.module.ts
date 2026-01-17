import { Module } from "@nestjs/common";
import { SettingsController } from "./settings.controller";
import { SettingsService } from "./settings.service";
import { PrismaModule } from "../../prisma/prisma.module";
import { UploadModule } from "../upload/upload.module";

@Module({
  imports: [PrismaModule, UploadModule],
  controllers: [SettingsController],
  providers: [SettingsService],
  exports: [SettingsService],
})
export class SettingsModule {}
