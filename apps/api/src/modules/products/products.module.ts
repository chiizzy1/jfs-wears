import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { PresetsService } from "./presets.service";
import { PresetsController, ColorGroupsController } from "./presets.controller";
import { UploadModule } from "../upload/upload.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [UploadModule, AuthModule],
  controllers: [ProductsController, PresetsController, ColorGroupsController],
  providers: [ProductsService, PresetsService],
  exports: [ProductsService, PresetsService],
})
export class ProductsModule {}
