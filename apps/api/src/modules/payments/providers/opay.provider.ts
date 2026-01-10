import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class OpayProvider {
  private baseUrl: string;
  private merchantId: string;
  private publicKey: string;
  private secretKey: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>("OPAY_BASE_URL") || "https://sandboxapi.opaycheckout.com";
    this.merchantId = this.configService.get<string>("OPAY_MERCHANT_ID") || "";
    this.publicKey = this.configService.get<string>("OPAY_PUBLIC_KEY") || "";
    this.secretKey = this.configService.get<string>("OPAY_SECRET_KEY") || "";
  }

  async initialize(data: { amount: number; email: string; orderId: string; callbackUrl: string }) {
    // OPay Cashier checkout
    // Reference: https://doc.opaycheckout.com/checkout-overview

    const payload = {
      amount: {
        total: Math.round(data.amount * 100), // Convert to kobo
        currency: "NGN",
      },
      product: {
        name: `JFS Wears Order #${data.orderId}`,
        description: "Fashion purchase from JFS Wears",
      },
      reference: `JFS-${data.orderId}-${Date.now()}`,
      callbackUrl: data.callbackUrl,
      cancelUrl: data.callbackUrl + "?cancelled=true",
      userInfo: {
        userEmail: data.email,
      },
      payMethod: "BankCard", // Can be: BankCard, BankAccount, USSD, QRCode
    };

    try {
      const response = await fetch(`${this.baseUrl}/api/v1/international/cashier/create`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.publicKey}`,
          MerchantId: this.merchantId,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      return {
        success: result.code === "00000",
        paymentUrl: result.data?.cashierUrl,
        reference: payload.reference,
        provider: "OPAY",
      };
    } catch (error) {
      console.error("OPay initialization error:", error);
      throw error;
    }
  }

  async verify(reference: string) {
    try {
      const response = await fetch(`${this.baseUrl}/api/v1/international/cashier/status`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${this.publicKey}`,
          MerchantId: this.merchantId,
        },
        body: JSON.stringify({ reference }),
      });

      const result = await response.json();

      return {
        success: result.code === "00000" && result.data?.status === "SUCCESS",
        status: result.data?.status,
        reference,
        provider: "OPAY",
      };
    } catch (error) {
      console.error("OPay verification error:", error);
      throw error;
    }
  }
}
