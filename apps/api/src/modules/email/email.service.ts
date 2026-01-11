import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private from: string;
  private frontendUrl: string;

  constructor(private config: ConfigService) {
    this.from = config.get("EMAIL_FROM") || "JFS Wears <noreply@jfswears.com>";
    this.frontendUrl = config.get("FRONTEND_URL") || "http://localhost:3000";
  }

  async sendOrderConfirmation(to: string, orderNumber: string, items: any[], total: number) {
    const itemsHtml = items
      .map((item) => `<li>${item.productName} × ${item.quantity} - ₦${item.unitPrice.toLocaleString()}</li>`)
      .join("");

    await this.sendEmail(
      to,
      `Order Confirmed - ${orderNumber}`,
      `
      <h1>Thank you for your order!</h1>
      <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
      <h3>Order Items:</h3>
      <ul>${itemsHtml}</ul>
      <p><strong>Total:</strong> ₦${total.toLocaleString()}</p>
      <p>We'll notify you when your order ships.</p>
      <p><a href="${this.frontendUrl}/track?order=${orderNumber}">Track Your Order</a></p>
      <br>
      <p>— The JFS Wears Team</p>
    `
    );
  }

  async sendPasswordReset(to: string, resetToken: string) {
    const resetLink = `${this.frontendUrl}/reset-password?token=${resetToken}`;

    await this.sendEmail(
      to,
      "Reset Your Password - JFS Wears",
      `
      <h1>Password Reset Request</h1>
      <p>Click the button below to reset your password:</p>
      <p><a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#E63946;color:white;text-decoration:none;border-radius:8px;">
        Reset Password
      </a></p>
      <p>This link expires in 1 hour.</p>
      <p>If you didn't request this, ignore this email.</p>
    `
    );
  }

  async sendVerificationEmail(to: string, code: string, verifyLink: string) {
    await this.sendEmail(
      to,
      "Verify Your Email - JFS Wears",
      `
      <h1>Welcome to JFS Wears!</h1>
      <p>Thank you for creating an account. Please verify your email address to complete registration.</p>
      <p style="font-size: 32px; font-weight: bold; letter-spacing: 8px; text-align: center; padding: 20px; background: #f5f5f5; border-radius: 8px;">
        ${code}
      </p>
      <p>Or click the button below:</p>
      <p><a href="${verifyLink}" style="display:inline-block;padding:12px 24px;background:#000;color:white;text-decoration:none;border-radius:8px;">
        Verify Email
      </a></p>
      <p>This code expires in 24 hours.</p>
      <p>If you didn't create an account, ignore this email.</p>
      <br>
      <p>— The JFS Wears Team</p>
    `
    );
  }

  async sendShippingNotification(to: string, orderNumber: string, trackingNumber?: string) {
    await this.sendEmail(
      to,
      `Your Order Has Shipped - ${orderNumber}`,
      `
      <h1>Your order is on the way!</h1>
      <p>Order <strong>${orderNumber}</strong> has been shipped.</p>
      ${trackingNumber ? `<p><strong>Tracking Number:</strong> ${trackingNumber}</p>` : ""}
      <p><a href="${this.frontendUrl}/track?order=${orderNumber}">Track Your Order</a></p>
    `
    );
  }

  private async sendEmail(to: string, subject: string, html: string) {
    // Check if email provider is configured
    const resendKey = this.config.get("RESEND_API_KEY");
    const smtpHost = this.config.get("SMTP_HOST");

    if (resendKey) {
      // Use Resend
      try {
        const { Resend } = await import("resend");
        const resend = new Resend(resendKey);
        await resend.emails.send({ from: this.from, to, subject, html });
        console.log(`Email sent to ${to}: ${subject}`);
      } catch (error) {
        console.error("Failed to send email via Resend:", error);
      }
    } else if (smtpHost) {
      // Use Nodemailer
      try {
        const nodemailer = await import("nodemailer");
        const transporter = nodemailer.createTransport({
          host: smtpHost,
          port: parseInt(this.config.get("SMTP_PORT") || "587"),
          auth: {
            user: this.config.get("SMTP_USER"),
            pass: this.config.get("SMTP_PASS"),
          },
        });
        await transporter.sendMail({ from: this.from, to, subject, html });
        console.log(`Email sent to ${to}: ${subject}`);
      } catch (error) {
        console.error("Failed to send email via SMTP:", error);
      }
    } else {
      // Fallback: Log to console
      console.log(`[EMAIL] To: ${to}`);
      console.log(`[EMAIL] Subject: ${subject}`);
      console.log(`[EMAIL] Content preview: ${html.substring(0, 200)}...`);
    }
  }
}
