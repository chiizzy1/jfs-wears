import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class PaystackProvider {
  private baseUrl = "https://api.paystack.co";
  private secretKey: string;

  constructor(private configService: ConfigService) {
    this.secretKey = this.configService.get<string>("PAYSTACK_SECRET_KEY") || "";
  }

  async initialize(data: { amount: number; email: string; orderId: string; callbackUrl: string }) {
    try {
      const payload = {
        amount: Math.round(data.amount * 100), // Convert to kobo
        email: data.email,
        reference: `JFS-${data.orderId}-${Date.now()}`,
        callback_url: data.callbackUrl,
        metadata: {
          orderId: data.orderId,
          custom_fields: [
            {
              display_name: "Order ID",
              variable_name: "order_id",
              value: data.orderId,
            },
          ],
        },
      };

      const response = await fetch(`${this.baseUrl}/transaction/initialize`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.secretKey}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      return {
        success: result.status,
        paymentUrl: result.data?.authorization_url,
        reference: result.data?.reference || payload.reference,
        provider: "PAYSTACK",
      };
    } catch (error) {
      console.error("Paystack initialization error:", error);
      throw error;
    }
  }

  async verify(reference: string) {
    try {
      const response = await fetch(`${this.baseUrl}/transaction/verify/${reference}`, {
        headers: {
          Authorization: `Bearer ${this.secretKey}`,
        },
      });

      const result = await response.json();

      return {
        success: result.status && result.data?.status === "success",
        status: result.data?.status,
        reference,
        provider: "PAYSTACK",
      };
    } catch (error) {
      console.error("Paystack verification error:", error);
      throw error;
    }
  }
}
