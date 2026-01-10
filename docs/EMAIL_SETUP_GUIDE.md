# Email Notifications Setup Guide

This guide walks you through setting up email notifications for JFS Wears using **Resend** (recommended) or traditional SMTP.

---

## Option A: Using Resend (Recommended)

Resend is a modern email API that's easy to set up and has a generous free tier.

### Step 1: Create a Resend Account

1. Go to [resend.com](https://resend.com)
2. Sign up for a free account
3. Verify your email

### Step 2: Get Your API Key

1. In Resend dashboard, go to **API Keys**
2. Click **Create API Key**
3. Give it a name (e.g., "JFS Wears Production")
4. Copy the API key (starts with `re_`)

### Step 3: Verify Your Domain (Optional but Recommended)

1. Go to **Domains** in Resend dashboard
2. Add your domain (e.g., `jfswears.com`)
3. Add the DNS records they provide
4. Wait for verification (usually 5-10 minutes)

### Step 4: Install Resend Package

```bash
cd apps/api
npm install resend
```

### Step 5: Add Environment Variables

Add to your `.env` file:

```env
# Email Configuration
RESEND_API_KEY=re_your_api_key_here
EMAIL_FROM=JFS Wears <orders@jfswears.com>
```

### Step 6: Create Email Service

Create `apps/api/src/modules/email/email.service.ts`:

```typescript
import { Injectable } from "@nestjs/common";
import { Resend } from "resend";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private resend: Resend;
  private from: string;

  constructor(private config: ConfigService) {
    this.resend = new Resend(config.get("RESEND_API_KEY"));
    this.from = config.get("EMAIL_FROM") || "JFS Wears <noreply@jfswears.com>";
  }

  async sendOrderConfirmation(to: string, orderNumber: string, items: any[], total: number) {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Order Confirmed - ${orderNumber}`,
      html: `
        <h1>Thank you for your order!</h1>
        <p>Your order <strong>${orderNumber}</strong> has been confirmed.</p>
        <p><strong>Order Total:</strong> ₦${total.toLocaleString()}</p>
        <p>We'll notify you when your order ships.</p>
        <br>
        <p>— The JFS Wears Team</p>
      `,
    });
  }

  async sendPasswordReset(to: string, resetLink: string) {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: "Reset Your Password - JFS Wears",
      html: `
        <h1>Password Reset Request</h1>
        <p>Click the button below to reset your password:</p>
        <a href="${resetLink}" style="display:inline-block;padding:12px 24px;background:#E63946;color:white;text-decoration:none;border-radius:8px;">
          Reset Password
        </a>
        <p>This link expires in 1 hour.</p>
        <p>If you didn't request this, ignore this email.</p>
      `,
    });
  }

  async sendShippingNotification(to: string, orderNumber: string, trackingNumber: string) {
    await this.resend.emails.send({
      from: this.from,
      to,
      subject: `Your Order Has Shipped - ${orderNumber}`,
      html: `
        <h1>Your order is on the way!</h1>
        <p>Order <strong>${orderNumber}</strong> has been shipped.</p>
        <p><strong>Tracking Number:</strong> ${trackingNumber}</p>
        <p>Track your package on our website.</p>
      `,
    });
  }
}
```

### Step 7: Create Email Module

Create `apps/api/src/modules/email/email.module.ts`:

```typescript
import { Module, Global } from "@nestjs/common";
import { EmailService } from "./email.service";

@Global()
@Module({
  providers: [EmailService],
  exports: [EmailService],
})
export class EmailModule {}
```

### Step 8: Register in App Module

Add to `apps/api/src/app.module.ts`:

```typescript
import { EmailModule } from "./modules/email/email.module";

@Module({
  imports: [
    // ... other imports
    EmailModule,
  ],
})
```

### Step 9: Use in Orders Service

Update `apps/api/src/modules/orders/orders.service.ts`:

```typescript
import { EmailService } from "../email/email.service";

@Injectable()
export class OrdersService {
  constructor(
    private prisma: PrismaService,
    private emailService: EmailService // Add this
  ) {}

  async create(userId: string | null, data: CreateOrderDto) {
    // ... existing order creation code ...

    // Send confirmation email
    if (data.shippingAddress?.email) {
      await this.emailService.sendOrderConfirmation(data.shippingAddress.email, order.orderNumber, order.items, order.total);
    }

    return order;
  }
}
```

---

## Option B: Using Traditional SMTP (Gmail, Mailgun, etc.)

### Step 1: Install Nodemailer

```bash
cd apps/api
npm install nodemailer
npm install -D @types/nodemailer
```

### Step 2: Add SMTP Environment Variables

```env
# SMTP Configuration
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password
EMAIL_FROM=JFS Wears <orders@jfswears.com>
```

> **Note for Gmail:** Enable 2FA and create an App Password at https://myaccount.google.com/apppasswords

### Step 3: Create Email Service with Nodemailer

```typescript
import { Injectable } from "@nestjs/common";
import * as nodemailer from "nodemailer";
import { ConfigService } from "@nestjs/config";

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;

  constructor(private config: ConfigService) {
    this.transporter = nodemailer.createTransport({
      host: config.get("SMTP_HOST"),
      port: parseInt(config.get("SMTP_PORT") || "587"),
      auth: {
        user: config.get("SMTP_USER"),
        pass: config.get("SMTP_PASS"),
      },
    });
  }

  async sendOrderConfirmation(to: string, orderNumber: string, total: number) {
    await this.transporter.sendMail({
      from: this.config.get("EMAIL_FROM"),
      to,
      subject: `Order Confirmed - ${orderNumber}`,
      html: `<h1>Thank you for your order!</h1><p>Order: ${orderNumber}</p>`,
    });
  }
}
```

---

## Testing Your Setup

1. Start your API server
2. Place a test order with a valid email
3. Check inbox (and spam folder)

## Troubleshooting

| Issue                | Solution                                   |
| -------------------- | ------------------------------------------ |
| Emails going to spam | Verify your domain in Resend               |
| "Invalid API key"    | Check your `.env` file has the correct key |
| Emails not sending   | Check API logs for error messages          |
| Gmail blocking       | Use App Password, not regular password     |

---

## Next Steps

- [ ] Set up Resend account
- [ ] Add environment variables
- [ ] Create email service files
- [ ] Test with a real order
- [ ] Customize email templates with your branding
