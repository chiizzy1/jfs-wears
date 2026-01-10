import { Module } from "@nestjs/common";
import { ProductsController } from "./products.controller";
import { ProductsService } from "./products.service";
import { UploadModule } from "../upload/upload.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [UploadModule, AuthModule],
  controllers: [ProductsController],
  providers: [ProductsService],
  exports: [ProductsService],
})
export class ProductsModule {}
