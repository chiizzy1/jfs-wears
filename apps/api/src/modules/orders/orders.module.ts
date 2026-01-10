import { Module } from "@nestjs/common";
import { OrdersController } from "./orders.controller";
import { OrdersService } from "./orders.service";
import { AuthModule } from "../auth/auth.module";
import { PrismaModule } from "../../prisma/prisma.module";
import { SettingsModule } from "../settings/settings.module";

@Module({
  imports: [AuthModule, PrismaModule, SettingsModule],
  controllers: [OrdersController],
  providers: [OrdersService],
  exports: [OrdersService],
})
export class OrdersModule {}
