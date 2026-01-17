import { Controller, Get, Post, Param, Res, Req, UseGuards, ForbiddenException, NotFoundException, Body } from "@nestjs/common";
import { Response, Request } from "express";
import { ApiTags, ApiOperation, ApiBearerAuth } from "@nestjs/swagger";
import { ReceiptService } from "./receipt.service";
import { JwtAuthGuard } from "../auth/guards/jwt-auth.guard";
import { RolesGuard, Roles } from "../auth/guards/roles.guard";
import { EmailService } from "../email/email.service";
import { PrismaService } from "../../prisma/prisma.service";
import { ResendReceiptDto } from "./dto/receipt.dto";

interface JwtUser {
  sub: string;
  email: string;
  role?: string;
  type?: string;
}

interface AuthenticatedRequest extends Request {
  user: JwtUser;
}

@ApiTags("receipts")
@Controller("receipts")
export class ReceiptController {
  constructor(
    private receiptService: ReceiptService,
    private emailService: EmailService,
    private prisma: PrismaService,
  ) {}

  /**
   * Download receipt for a specific order (authenticated users)
   */
  @Get(":orderId")
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: "Download receipt PDF for an order" })
  async downloadReceipt(@Param("orderId") orderId: string, @Req() req: AuthenticatedRequest, @Res() res: Response) {
    const user = req.user;
    // Check access - staff can access any, users only their own
    const isStaff = user.type === "staff";

    if (!isStaff) {
      const canAccess = await this.receiptService.canAccessReceipt(orderId, user.sub);
      if (!canAccess) {
        throw new ForbiddenException("You do not have access to this receipt");
      }
    }

    // Generate PDF
    const pdfBuffer = await this.receiptService.generateReceiptPdf(orderId);

    // Get order number for filename
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true },
    });

    const filename = order ? `receipt-${order.orderNumber}.pdf` : `receipt-${orderId}.pdf`;

    // Send PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  }

  /**
   * Download receipt via secure token (for guests/email links)
   */
  @Get("download/:token")
  @ApiOperation({ summary: "Download receipt via secure token" })
  async downloadByToken(@Param("token") token: string, @Res() res: Response) {
    // Validate token
    const orderId = this.receiptService.validateReceiptToken(token);

    if (!orderId) {
      throw new ForbiddenException("Invalid or expired download link");
    }

    // Generate PDF
    const pdfBuffer = await this.receiptService.generateReceiptPdf(orderId);

    // Get order number for filename
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { orderNumber: true },
    });

    const filename = order ? `receipt-${order.orderNumber}.pdf` : `receipt-${orderId}.pdf`;

    // Send PDF response
    res.setHeader("Content-Type", "application/pdf");
    res.setHeader("Content-Disposition", `attachment; filename="${filename}"`);
    res.setHeader("Content-Length", pdfBuffer.length);
    res.send(pdfBuffer);
  }

  /**
   * Generate a secure download token for an order (for email links)
   */
  @Get(":orderId/token")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Generate secure download token for receipt" })
  async generateToken(@Param("orderId") orderId: string) {
    // Verify order exists
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      select: { id: true },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    const token = this.receiptService.generateReceiptToken(orderId);

    return { token, expiresIn: "24h" };
  }

  /**
   * Resend receipt email to customer (admin only)
   */
  @Post(":orderId/resend")
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles("ADMIN", "MANAGER", "STAFF")
  @ApiBearerAuth()
  @ApiOperation({ summary: "Resend receipt email to customer" })
  async resendReceipt(@Param("orderId") orderId: string, @Body() dto: ResendReceiptDto) {
    // Fetch order with items
    const order = await this.prisma.order.findUnique({
      where: { id: orderId },
      include: { items: true, user: true },
    });

    if (!order) {
      throw new NotFoundException(`Order not found: ${orderId}`);
    }

    // Determine email recipient
    const shippingAddress = order.shippingAddress as { email?: string } | null;
    const recipientEmail = dto.email || shippingAddress?.email || order.user?.email;

    if (!recipientEmail) {
      throw new NotFoundException("No email address found for this order");
    }

    // Generate PDF
    const pdfBuffer = await this.receiptService.generateReceiptPdf(orderId);

    // Send email with attachment
    await this.emailService.sendOrderConfirmation(
      recipientEmail,
      order.orderNumber,
      order.items.map((item) => ({
        productName: item.productName,
        quantity: item.quantity,
        unitPrice: Number(item.unitPrice),
      })),
      Number(order.total),
      pdfBuffer,
    );

    return {
      success: true,
      message: `Receipt sent to ${recipientEmail}`,
    };
  }
}
