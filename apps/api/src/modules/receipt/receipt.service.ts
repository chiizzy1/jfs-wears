import { Injectable, NotFoundException, ForbiddenException } from "@nestjs/common";
import { PrismaService } from "../../prisma/prisma.service";
import { SettingsService } from "../settings/settings.service";
import * as PDFDocument from "pdfkit";
import * as crypto from "crypto";

// Types for order data
interface OrderItem {
  productName: string;
  quantity: number;
  unitPrice: { toString: () => string } | number;
  variantSize?: string | null;
  variantColor?: string | null;
}

interface ShippingAddress {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  state?: string;
}

interface OrderWithDetails {
  id: string;
  orderNumber: string;
  createdAt: Date;
  subtotal: { toString: () => string } | number;
  shippingFee: { toString: () => string } | number;
  discount: { toString: () => string } | number;
  total: { toString: () => string } | number;
  paymentMethod: string;
  paymentStatus: string;
  shippingAddress: ShippingAddress | unknown;
  userId?: string | null;
  items: OrderItem[];
  shippingZone?: { name: string } | null;
}

interface StoreSettings {
  storeName: string;
  storeEmail: string;
  storePhone?: string | null;
  storeAddress?: string | null;
  storeCity?: string | null;
  storeState?: string | null;
  storePostalCode?: string | null;
  storeCountry?: string | null;
  currency: string;
  logoUrl?: string | null;
  receiptAccentColor?: string | null;
  receiptFooterText?: string | null;
  returnPolicyUrl?: string | null;
  termsUrl?: string | null;
}

// Token cache for secure receipt downloads
const tokenCache = new Map<string, { orderId: string; expiresAt: number }>();

@Injectable()
export class ReceiptService {
  constructor(
    private prisma: PrismaService,
    private settingsService: SettingsService,
  ) {}

  /**
   * Generate a PDF receipt buffer for an order
   */
  async generateReceiptPdf(orderId: string): Promise<Buffer> {
    // Fetch order with items
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, shippingZone: true },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    // Fetch store settings
    const settings = (await this.settingsService.getSettings()) as StoreSettings;

    return this.createPdfBuffer(order as OrderWithDetails, settings);
  }

  /**
   * Generate secure download token for guest/customer access
   */
  generateReceiptToken(orderId: string): string {
    const token = crypto.randomBytes(32).toString("hex");
    const expiresAt = Date.now() + 24 * 60 * 60 * 1000; // 24 hours

    tokenCache.set(token, { orderId, expiresAt });

    return token;
  }

  /**
   * Validate token and return orderId if valid
   */
  validateReceiptToken(token: string): string | null {
    const cached = tokenCache.get(token);

    if (!cached) {
      return null;
    }

    if (Date.now() > cached.expiresAt) {
      tokenCache.delete(token);
      return null;
    }

    return cached.orderId;
  }

  /**
   * Check if user can access this order's receipt
   */
  async canAccessReceipt(orderId: string, userId?: string): Promise<boolean> {
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { userId: true },
    });

    if (!order) {
      return false;
    }

    // Order belongs to user
    if (userId && order.userId === userId) {
      return true;
    }

    return false;
  }

  /**
   * Create the PDF document buffer
   */
  private createPdfBuffer(order: OrderWithDetails, settings: StoreSettings): Promise<Buffer> {
    return new Promise((resolve, reject) => {
      const doc = new PDFDocument({ margin: 50, size: "A4" });
      const chunks: Buffer[] = [];

      doc.on("data", (chunk: Buffer) => chunks.push(chunk));
      doc.on("end", () => resolve(Buffer.concat(chunks)));
      doc.on("error", reject);

      // Header
      this.drawHeader(doc, settings);

      // Order Info
      this.drawOrderInfo(doc, order);

      // Customer Info
      this.drawCustomerInfo(doc, order);

      // Items Table
      this.drawItemsTable(doc, order, settings);

      // Totals
      this.drawTotals(doc, order, settings);

      // Payment Info
      this.drawPaymentInfo(doc, order);

      // Footer
      this.drawFooter(doc, settings);

      doc.end();
    });
  }

  private drawHeader(doc: PDFKit.PDFDocument, settings: StoreSettings): void {
    const accentColor = settings.receiptAccentColor || "#000000";

    // Store Name
    doc.fontSize(24).fillColor(accentColor).text(settings.storeName, { align: "center" });

    doc.moveDown(0.3);

    // Store Address
    doc.fontSize(10).fillColor("#666666");
    if (settings.storeAddress) {
      doc.text(settings.storeAddress, { align: "center" });
    }
    if (settings.storeCity || settings.storeState) {
      doc.text([settings.storeCity, settings.storeState, settings.storePostalCode].filter(Boolean).join(", "), {
        align: "center",
      });
    }
    doc.text(settings.storeCountry || "Nigeria", { align: "center" });

    doc.moveDown(0.3);

    // Contact
    if (settings.storeEmail) {
      doc.text(settings.storeEmail, { align: "center" });
    }
    if (settings.storePhone) {
      doc.text(settings.storePhone, { align: "center" });
    }

    doc.moveDown(1);

    // Divider
    doc.strokeColor("#cccccc").lineWidth(1).moveTo(50, doc.y).lineTo(545, doc.y).stroke();

    doc.moveDown(1);
  }

  private drawOrderInfo(doc: PDFKit.PDFDocument, order: OrderWithDetails): void {
    doc.fontSize(16).fillColor("#000000").text("ORDER RECEIPT", { align: "center" });
    doc.moveDown(0.5);

    doc.fontSize(10).fillColor("#666666");
    doc.text(`Order #: ${order.orderNumber}`, { align: "center" });
    doc.text(
      `Date: ${order.createdAt.toLocaleDateString("en-NG", {
        year: "numeric",
        month: "long",
        day: "numeric",
      })}`,
      { align: "center" },
    );

    doc.moveDown(1);
  }

  private drawCustomerInfo(doc: PDFKit.PDFDocument, order: OrderWithDetails): void {
    const shipping = order.shippingAddress as ShippingAddress;

    doc.fontSize(12).fillColor("#000000").text("BILL TO:");
    doc.moveDown(0.3);

    doc.fontSize(10).fillColor("#333333");
    if (shipping.firstName || shipping.lastName) {
      doc.text(`${shipping.firstName || ""} ${shipping.lastName || ""}`.trim());
    }
    if (shipping.address) {
      doc.text(shipping.address);
    }
    if (shipping.city || shipping.state) {
      doc.text([shipping.city, shipping.state].filter(Boolean).join(", "));
    }
    if (shipping.email) {
      doc.text(shipping.email);
    }
    if (shipping.phone) {
      doc.text(shipping.phone);
    }

    doc.moveDown(1);
  }

  private drawItemsTable(doc: PDFKit.PDFDocument, order: OrderWithDetails, settings: StoreSettings): void {
    const accentColor = settings.receiptAccentColor || "#000000";
    const currencySymbol = settings.currency === "NGN" ? "₦" : settings.currency;

    // Table Header
    doc.fontSize(12).fillColor(accentColor).text("ITEMS");
    doc.moveDown(0.3);

    // Divider
    doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();

    doc.moveDown(0.5);

    // Items
    doc.fontSize(10).fillColor("#333333");
    for (const item of order.items) {
      const variant = [item.variantSize, item.variantColor].filter(Boolean).join("/");
      const itemName = variant ? `${item.productName} (${variant})` : item.productName;
      const price = Number(item.unitPrice.toString());
      const lineTotal = price * item.quantity;

      doc.text(`${item.quantity}x ${itemName}`, 50, doc.y, { width: 350, continued: false });
      doc.text(`${currencySymbol}${lineTotal.toLocaleString()}`, 400, doc.y - 12, { width: 145, align: "right" });

      doc.moveDown(0.3);
    }

    // Divider
    doc.moveDown(0.3);
    doc.strokeColor("#cccccc").lineWidth(0.5).moveTo(50, doc.y).lineTo(545, doc.y).stroke();

    doc.moveDown(0.5);
  }

  private drawTotals(doc: PDFKit.PDFDocument, order: OrderWithDetails, settings: StoreSettings): void {
    const currencySymbol = settings.currency === "NGN" ? "₦" : settings.currency;

    const subtotal = Number(order.subtotal.toString());
    const shipping = Number(order.shippingFee.toString());
    const discount = Number(order.discount.toString());
    const total = Number(order.total.toString());

    doc.fontSize(10).fillColor("#666666");

    // Subtotal
    doc.text("Subtotal:", 350, doc.y, { width: 100, continued: false });
    doc.text(`${currencySymbol}${subtotal.toLocaleString()}`, 450, doc.y - 12, { width: 95, align: "right" });

    // Shipping
    doc.text("Shipping:", 350, doc.y, { width: 100, continued: false });
    doc.text(`${currencySymbol}${shipping.toLocaleString()}`, 450, doc.y - 12, { width: 95, align: "right" });

    // Discount (if any)
    if (discount > 0) {
      doc.text("Discount:", 350, doc.y, { width: 100, continued: false });
      doc.text(`-${currencySymbol}${discount.toLocaleString()}`, 450, doc.y - 12, { width: 95, align: "right" });
    }

    doc.moveDown(0.3);

    // Total divider
    doc.strokeColor("#000000").lineWidth(1).moveTo(350, doc.y).lineTo(545, doc.y).stroke();

    doc.moveDown(0.3);

    // Total
    doc.fontSize(12).fillColor("#000000");
    doc.text("TOTAL:", 350, doc.y, { width: 100, continued: false });
    doc.text(`${currencySymbol}${total.toLocaleString()}`, 450, doc.y - 14, { width: 95, align: "right" });

    doc.moveDown(1);
  }

  private drawPaymentInfo(doc: PDFKit.PDFDocument, order: OrderWithDetails): void {
    const paymentMethodLabels: Record<string, string> = {
      CARD: "Card Payment",
      BANK_TRANSFER: "Bank Transfer",
      OPAY_WALLET: "OPay Wallet",
      CASH_ON_DELIVERY: "Cash on Delivery",
    };

    const paymentStatusLabels: Record<string, string> = {
      PENDING: "Pending",
      PAID: "Paid",
      FAILED: "Failed",
      REFUNDED: "Refunded",
    };

    const method = paymentMethodLabels[order.paymentMethod] || order.paymentMethod;
    const status = paymentStatusLabels[order.paymentStatus] || order.paymentStatus;

    doc.fontSize(10).fillColor("#666666");
    doc.text(`Payment: ${method} (${status})`, { align: "center" });

    doc.moveDown(2);
  }

  private drawFooter(doc: PDFKit.PDFDocument, settings: StoreSettings): void {
    // Custom footer text
    if (settings.receiptFooterText) {
      doc.fontSize(10).fillColor("#666666").text(settings.receiptFooterText, { align: "center" });
      doc.moveDown(0.5);
    } else {
      doc.fontSize(10).fillColor("#666666").text(`Thank you for shopping with ${settings.storeName}!`, { align: "center" });
      doc.moveDown(0.5);
    }

    // Policy links
    doc.fontSize(8).fillColor("#999999");
    const links: string[] = [];
    if (settings.returnPolicyUrl) {
      links.push(`Returns: ${settings.returnPolicyUrl}`);
    }
    if (settings.termsUrl) {
      links.push(`Terms: ${settings.termsUrl}`);
    }
    if (links.length > 0) {
      doc.text(links.join("  |  "), { align: "center" });
    }
  }
}
