import { Controller, Post, Body, Get, Param, Headers, UnauthorizedException } from "@nestjs/common";
import { PaymentsService } from "./payments.service";
import * as crypto from "crypto";
import { InitializePaymentDto, PaymentProvider } from "./dto/payments.dto";
import { ApiTags } from "@nestjs/swagger";

@ApiTags("Payments")
@Controller("payments")
export class PaymentsController {
  constructor(private paymentsService: PaymentsService) {}

  @Post("initialize")
  async initialize(@Body() data: InitializePaymentDto) {
    const callbackUrl = process.env.NEXT_PUBLIC_APP_URL + "/checkout/callback";
    return this.paymentsService.initializePayment({ ...data, callbackUrl });
  }

  @Get("verify/:provider/:reference")
  async verify(@Param("provider") provider: "OPAY" | "MONNIFY" | "PAYSTACK", @Param("reference") reference: string) {
    return this.paymentsService.verifyPayment(provider, reference);
  }

  // Webhook endpoints
  @Post("webhook/opay")
  async opayWebhook(@Body() body: any, @Headers() headers: any) {
    // OPay Webhook Signature Verification
    const signature = headers["authorization"]?.split(" ")[1];
    const secret = process.env.OPAY_SECRET_KEY;

    if (secret && signature) {
      const computedSignature = crypto.createHmac("sha512", secret).update(JSON.stringify(body)).digest("hex");
      if (computedSignature !== signature) {
        throw new UnauthorizedException("Invalid signature");
      }
    }

    console.log("OPay webhook received:", body);

    // Update order status based on payment result
    if (body.status === "SUCCESS" && body.orderId) {
      await this.paymentsService.handlePaymentSuccess(body.orderId, body.reference);
    } else if (body.status === "FAILED" && body.orderId) {
      await this.paymentsService.handlePaymentFailed(body.orderId, body.reference);
    }

    return { received: true };
  }

  @Post("webhook/monnify")
  async monnifyWebhook(@Body() body: any, @Headers() headers: any) {
    const signature = headers["monnify-signature"];
    const secret = process.env.MONNIFY_SECRET_KEY;

    if (!signature || !secret) {
      console.error("Monnify webhook missing signature or secret");
      throw new UnauthorizedException("Missing signature");
    }

    const computedHash = crypto.createHmac("sha512", secret).update(JSON.stringify(body)).digest("hex");

    if (computedHash !== signature) {
      console.warn("Invalid Monnify webhook signature");
      throw new UnauthorizedException("Invalid signature");
    }

    console.log("Monnify webhook authenticated:", body);

    // Update order status based on payment result
    const eventData = body.eventData || body;
    if (body.eventType === "SUCCESSFUL_TRANSACTION" && eventData.product?.reference) {
      await this.paymentsService.handlePaymentSuccess(eventData.product.reference, eventData.transactionReference);
    } else if (body.eventType === "FAILED_TRANSACTION" && eventData.product?.reference) {
      await this.paymentsService.handlePaymentFailed(eventData.product.reference, eventData.transactionReference);
    }

    return { received: true };
  }

  @Post("webhook/paystack")
  async paystackWebhook(@Body() body: any, @Headers() headers: any) {
    const signature = headers["x-paystack-signature"];
    const secret = process.env.PAYSTACK_SECRET_KEY;

    if (!signature || !secret) {
      throw new UnauthorizedException("Missing signature");
    }

    const computedHash = crypto.createHmac("sha512", secret).update(JSON.stringify(body)).digest("hex");

    if (computedHash !== signature) {
      throw new UnauthorizedException("Invalid signature");
    }

    console.log("Paystack webhook authenticated:", body);

    // Update order status based on payment result
    if (body.event === "charge.success" && body.data?.metadata?.orderId) {
      await this.paymentsService.handlePaymentSuccess(body.data.metadata.orderId, body.data.reference);
    } else if (body.event === "charge.failed" && body.data?.metadata?.orderId) {
      await this.paymentsService.handlePaymentFailed(body.data.metadata.orderId, body.data.reference);
    }

    return { received: true };
  }
}
