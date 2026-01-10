import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class MonnifyProvider {
  private baseUrl: string;
  private apiKey: string;
  private secretKey: string;
  private contractCode: string;

  constructor(private configService: ConfigService) {
    this.baseUrl = this.configService.get<string>("MONNIFY_BASE_URL") || "https://sandbox.monnify.com";
    this.apiKey = this.configService.get<string>("MONNIFY_API_KEY") || "";
    this.secretKey = this.configService.get<string>("MONNIFY_SECRET_KEY") || "";
    this.contractCode = this.configService.get<string>("MONNIFY_CONTRACT_CODE") || "";
  }

  private async getAccessToken(): Promise<string> {
    const credentials = Buffer.from(`${this.apiKey}:${this.secretKey}`).toString("base64");

    const response = await fetch(`${this.baseUrl}/api/v1/auth/login`, {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
      },
    });

    const result = await response.json();
    return result.responseBody?.accessToken;
  }

  async initialize(data: { amount: number; email: string; orderId: string; callbackUrl: string }) {
    try {
      const accessToken = await this.getAccessToken();

      const payload = {
        amount: data.amount,
        customerName: "JFS Customer",
        customerEmail: data.email,
        paymentReference: `JFS-${data.orderId}-${Date.now()}`,
        paymentDescription: `JFS Wears Order #${data.orderId}`,
        currencyCode: "NGN",
        contractCode: this.contractCode,
        redirectUrl: data.callbackUrl,
        paymentMethods: ["CARD", "ACCOUNT_TRANSFER"],
      };

      const response = await fetch(`${this.baseUrl}/api/v1/merchant/transactions/init-transaction`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(payload),
      });

      const result = await response.json();

      return {
        success: result.requestSuccessful,
        paymentUrl: result.responseBody?.checkoutUrl,
        reference: payload.paymentReference,
        provider: "MONNIFY",
      };
    } catch (error) {
      console.error("Monnify initialization error:", error);
      throw error;
    }
  }

  async verify(reference: string) {
    try {
      const accessToken = await this.getAccessToken();

      const response = await fetch(`${this.baseUrl}/api/v2/transactions/${encodeURIComponent(reference)}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      return {
        success: result.requestSuccessful && result.responseBody?.paymentStatus === "PAID",
        status: result.responseBody?.paymentStatus,
        reference,
        provider: "MONNIFY",
      };
    } catch (error) {
      console.error("Monnify verification error:", error);
      throw error;
    }
  }
}
