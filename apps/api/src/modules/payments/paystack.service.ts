import { PrismaService } from "@/prisma/prisma.service";
import { Injectable, BadRequestException, Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import * as crypto from "crypto";

interface PaystackInitializeResponse {
  status: boolean;
  message: string;
  data: {
    authorization_url: string;
    access_code: string;
    reference: string;
  };
}

interface PaystackVerifyResponse {
  status: boolean;
  message: string;
  data: {
    status: string;
    reference: string;
    amount: number;
    currency: string;
    channel: string;
    customer: {
      email: string;
    };
    metadata?: {
      orderId?: string;
    };
  };
}

@Injectable()
export class PaystackService {
  private readonly logger = new Logger(PaystackService.name);
  private readonly baseUrl = "https://api.paystack.co";
  private readonly secretKey: string;

  constructor(private configService: ConfigService, private prisma: PrismaService) {
    this.secretKey = this.configService.get<string>("PAYSTACK_SECRET_KEY") || "";
  }

  /**
   * Initialize a payment transaction
   * @param orderId - The order ID to pay for
   * @param email - Customer email
   * @param amount - Amount in kobo (NGN smallest unit)
   * @param callbackUrl - URL to redirect after payment
   */
  async initializeTransaction(
    orderId: string,
    email: string,
    amount: number,
    callbackUrl: string
  ): Promise<{ authorizationUrl: string; reference: string }> {
    if (!this.secretKey) {
      throw new BadRequestException("Paystack is not configured. Please add PAYSTACK_SECRET_KEY to environment.");
    }

    const reference = `JFS-${orderId}-${Date.now()}`;

    const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        email,
        amount: Math.round(amount * 100), // Convert to kobo
        reference,
        callback_url: callbackUrl,
        metadata: {
          orderId,
          custom_fields: [
            {
              display_name: "Order Number",
              variable_name: "order_number",
              value: orderId,
            },
          ],
        },
      }),
    });

    const data: PaystackInitializeResponse = await response.json();

    if (!data.status) {
      this.logger.error("Paystack initialization failed", data.message);
      throw new BadRequestException(data.message || "Payment initialization failed");
    }

    // Update order with payment reference
    await this.prisma.order.update({
      where: { id: orderId },
      data: {
        paymentReference: reference,
        paymentProvider: "PAYSTACK",
      },
    });

    return {
      authorizationUrl: data.data.authorization_url,
      reference: data.data.reference,
    };
  }

  /**
   * Verify a payment transaction
   * @param reference - Payment reference to verify
   */
  async verifyTransaction(reference: string): Promise<{
    success: boolean;
    orderId?: string;
    status: string;
  }> {
    if (!this.secretKey) {
      throw new BadRequestException("Paystack is not configured");
    }

    const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${this.secretKey}`,
      },
    });

    const data: PaystackVerifyResponse = await response.json();

    if (!data.status) {
      return { success: false, status: "failed" };
    }

    const paymentStatus = data.data.status;
    const orderId = data.data.metadata?.orderId;

    // Update order payment status if orderId exists
    if (orderId && paymentStatus === "success") {
      await this.prisma.order.update({
        where: { id: orderId },
        data: {
          paymentStatus: "PAID",
          status: "CONFIRMED",
        },
      });
    }

    return {
      success: paymentStatus === "success",
      orderId,
      status: paymentStatus,
    };
  }

  /**
   * Verify webhook signature from Paystack
   * @param signature - X-Paystack-Signature header
   * @param body - Raw request body
   */
  verifyWebhookSignature(signature: string, body: string): boolean {
    if (!this.secretKey) return false;

    const hash = crypto.createHmac("sha512", this.secretKey).update(body).digest("hex");

    return hash === signature;
  }

  /**
   * Handle webhook event from Paystack
   * @param event - Webhook event type
   * @param data - Event data
   */
  async handleWebhookEvent(event: string, data: Record<string, unknown>): Promise<void> {
    this.logger.log(`Received Paystack webhook: ${event}`);

    switch (event) {
      case "charge.success": {
        const reference = data.reference as string;
        const metadata = data.metadata as { orderId?: string };
        const orderId = metadata?.orderId;

        if (orderId) {
          await this.prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "PAID",
              status: "CONFIRMED",
            },
          });
          this.logger.log(`Order ${orderId} marked as PAID via webhook`);
        }
        break;
      }

      case "charge.failed": {
        const metadata = data.metadata as { orderId?: string };
        const orderId = metadata?.orderId;

        if (orderId) {
          await this.prisma.order.update({
            where: { id: orderId },
            data: {
              paymentStatus: "FAILED",
            },
          });
          this.logger.warn(`Order ${orderId} payment FAILED via webhook`);
        }
        break;
      }

      default:
        this.logger.log(`Unhandled webhook event: ${event}`);
    }
  }
}
