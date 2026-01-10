import { Module } from "@nestjs/common";
import { PaymentsController } from "./payments.controller";
import { PaymentsService } from "./payments.service";
import { OpayProvider } from "./providers/opay.provider";
import { MonnifyProvider } from "./providers/monnify.provider";
import { PaystackProvider } from "./providers/paystack.provider";
import { OrdersModule } from "../orders/orders.module";

@Module({
  imports: [OrdersModule],
  controllers: [PaymentsController],
  providers: [PaymentsService, OpayProvider, MonnifyProvider, PaystackProvider],
  exports: [PaymentsService],
})
export class PaymentsModule {}
