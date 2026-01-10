import { Injectable, NotFoundException, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { OpayProvider } from "./providers/opay.provider";
import { MonnifyProvider } from "./providers/monnify.provider";
import { PaystackProvider } from "./providers/paystack.provider";
import { OrdersService } from "../orders/orders.service";

@Injectable()
export class PaymentsService {
  private readonly logger = new Logger(PaymentsService.name);

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

    // Log payment initialization for audit
    this.logger.log(`Initializing payment: orderId=${data.orderId}, provider=${provider}, amount=${data.amount}`);

    switch (provider) {
      case "OPAY":
        return this.opayProvider.initialize(paymentData);
      case "MONNIFY":
        return this.monnifyProvider.initialize(paymentData);
      case "PAYSTACK":
        return this.paystackProvider.initialize(paymentData);
      default:
        throw new BadRequestException("Invalid payment provider");
    }
  }

  async verifyPayment(provider: "OPAY" | "MONNIFY" | "PAYSTACK", reference: string) {
    this.logger.log(`Verifying payment: provider=${provider}, reference=${reference}`);

    switch (provider) {
      case "OPAY":
        return this.opayProvider.verify(reference);
      case "MONNIFY":
        return this.monnifyProvider.verify(reference);
      case "PAYSTACK":
        return this.paystackProvider.verify(reference);
      default:
        throw new BadRequestException("Invalid payment provider");
    }
  }

  /**
   * Handle successful payment with validation
   * Validates that orderId exists and updates payment status
   */
  async handlePaymentSuccess(orderId: string, paymentReference: string) {
    this.logger.log(`Payment success: orderId=${orderId}, reference=${paymentReference}`);

    // Validate order exists before updating
    const order = await this.ordersService.findById(orderId);
    if (!order) {
      this.logger.error(`Payment success received for non-existent order: ${orderId}`);
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    // Validate order is in a valid state for payment
    if (order.paymentStatus === "PAID") {
      this.logger.warn(`Duplicate payment success for already paid order: ${orderId}`);
      return order; // Already paid, return existing order
    }

    // Update order payment status to PAID
    return this.ordersService.updatePaymentStatus(orderId, "PAID", paymentReference);
  }

  /**
   * Handle failed payment with validation
   */
  async handlePaymentFailed(orderId: string, paymentReference?: string) {
    this.logger.log(`Payment failed: orderId=${orderId}, reference=${paymentReference}`);

    // Validate order exists before updating
    const order = await this.ordersService.findById(orderId);
    if (!order) {
      this.logger.error(`Payment failure received for non-existent order: ${orderId}`);
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    // Update order payment status to FAILED
    return this.ordersService.updatePaymentStatus(orderId, "FAILED", paymentReference);
  }
}
