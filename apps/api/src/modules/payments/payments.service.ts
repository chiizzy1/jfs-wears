import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpayProvider } from "./providers/opay.provider";
import { MonnifyProvider } from "./providers/monnify.provider";
import { PaystackProvider } from "./providers/paystack.provider";
import { OrdersService } from "../orders/orders.service";

@Injectable()
export class PaymentsService {
  constructor(
    private configService: ConfigService,
    private opayProvider: OpayProvider,
    private monnifyProvider: MonnifyProvider,
    private paystackProvider: PaystackProvider,
    private ordersService: OrdersService
  ) {}

  async initializePayment(data: {
    amount: number;
    email: string;
    orderId: string;
    provider: "OPAY" | "MONNIFY" | "PAYSTACK";
    callbackUrl: string;
  }) {
    const { provider, ...paymentData } = data;

    switch (provider) {
      case "OPAY":
        return this.opayProvider.initialize(paymentData);
      case "MONNIFY":
        return this.monnifyProvider.initialize(paymentData);
      case "PAYSTACK":
        return this.paystackProvider.initialize(paymentData);
      default:
        throw new Error("Invalid payment provider");
    }
  }

  async verifyPayment(provider: "OPAY" | "MONNIFY" | "PAYSTACK", reference: string) {
    switch (provider) {
      case "OPAY":
        return this.opayProvider.verify(reference);
      case "MONNIFY":
        return this.monnifyProvider.verify(reference);
      case "PAYSTACK":
        return this.paystackProvider.verify(reference);
      default:
        throw new Error("Invalid payment provider");
    }
  }

  async handlePaymentSuccess(orderId: string, paymentReference: string) {
    // Update order payment status to PAID
    return this.ordersService.updatePaymentStatus(orderId, "PAID", paymentReference);
  }

  async handlePaymentFailed(orderId: string, paymentReference?: string) {
    // Update order payment status to FAILED
    return this.ordersService.updatePaymentStatus(orderId, "FAILED", paymentReference);
  }
}
