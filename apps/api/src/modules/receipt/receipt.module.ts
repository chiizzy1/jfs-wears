import { Module, forwardRef } from "@nestjs/common";
import { ReceiptService } from "./receipt.service";
import { ReceiptController } from "./receipt.controller";
import { PrismaService } from "../../prisma/prisma.service";
import { SettingsModule } from "../settings/settings.module";
import { EmailModule } from "../email/email.module";
import { AuthModule } from "../auth/auth.module";

@Module({
  imports: [SettingsModule, EmailModule, forwardRef(() => AuthModule)],
  controllers: [ReceiptController],
  providers: [ReceiptService, PrismaService],
  exports: [ReceiptService],
})
export class ReceiptModule {}
