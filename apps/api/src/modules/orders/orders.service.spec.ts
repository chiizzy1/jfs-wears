import { Test, TestingModule } from "@nestjs/testing";
import { BadRequestException, NotFoundException } from "@nestjs/common";
import { OrdersService } from "./orders.service";
import { PrismaService } from "../../prisma/prisma.service";
import { EmailService } from "../email/email.service";
import { SettingsService } from "../settings/settings.service";
import { Decimal } from "@prisma/client/runtime/library";
import { OrderStatus } from "./dto/orders.dto";

describe("OrdersService", () => {
  let service: OrdersService;
  let prismaService: jest.Mocked<PrismaService>;
  let emailService: jest.Mocked<EmailService>;
  let settingsService: jest.Mocked<SettingsService>;

  const mockProduct = {
    id: "product-123",
    name: "Test T-Shirt",
    basePrice: new Decimal(5000),
  };

  const mockVariant = {
    id: "variant-123",
    productId: "product-123",
    size: "M",
    color: "Black",
    stock: 10,
    priceAdjustment: new Decimal(0),
    product: mockProduct,
  };

  const mockOrder = {
    id: "order-123",
    orderNumber: "JFS-20260109-001",
    userId: "user-123",
    status: "PENDING",
    totalAmount: new Decimal(5000),
    items: [],
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    const mockPrismaService = {
      user: {
        findUnique: jest.fn(),
      },
      productVariant: {
        findUnique: jest.fn(),
        update: jest.fn(),
      },
      order: {
        findUnique: jest.fn(),
        findMany: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        count: jest.fn(),
      },
      $transaction: jest.fn(),
    };

    const mockEmailService = {
      sendOrderConfirmation: jest.fn().mockResolvedValue(undefined),
    };

    const mockSettingsService = {
      getSettings: jest.fn().mockResolvedValue({ currency: "NGN" }),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        OrdersService,
        { provide: PrismaService, useValue: mockPrismaService },
        { provide: EmailService, useValue: mockEmailService },
        { provide: SettingsService, useValue: mockSettingsService },
      ],
    }).compile();

    service = module.get<OrdersService>(OrdersService);
    prismaService = module.get(PrismaService);
    emailService = module.get(EmailService);
    settingsService = module.get(SettingsService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("findById", () => {
    it("should return order by id", async () => {
      // Arrange
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      // Act
      const result = await service.findById("order-123");

      // Assert
      expect(result).toEqual(mockOrder);
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { id: "order-123" },
        include: { items: true, shippingZone: true, user: true },
      });
    });

    it("should return null for non-existent order", async () => {
      // Arrange
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(null);

      // Act
      const result = await service.findById("non-existent");

      // Assert
      expect(result).toBeNull();
    });
  });

  describe("findByOrderNumber", () => {
    it("should return order by order number", async () => {
      // Arrange
      (prismaService.order.findUnique as jest.Mock).mockResolvedValue(mockOrder);

      // Act
      const result = await service.findByOrderNumber("JFS-20260109-001");

      // Assert
      expect(result).toEqual(mockOrder);
      expect(prismaService.order.findUnique).toHaveBeenCalledWith({
        where: { orderNumber: "JFS-20260109-001" },
        include: { items: true, shippingZone: true },
      });
    });
  });

  describe("findByUserId", () => {
    it("should return all orders for a user", async () => {
      // Arrange
      const userOrders = [mockOrder, { ...mockOrder, id: "order-456" }];
      (prismaService.order.findMany as jest.Mock).mockResolvedValue(userOrders);

      // Act
      const result = await service.findByUserId("user-123");

      // Assert
      expect(result).toHaveLength(2);
      expect(prismaService.order.findMany).toHaveBeenCalledWith({
        where: { userId: "user-123" },
        include: { items: true, shippingZone: true },
        orderBy: { createdAt: "desc" },
      });
    });
  });

  describe("findAll", () => {
    it("should return paginated orders", async () => {
      // Arrange
      const orders = [mockOrder];
      (prismaService.order.findMany as jest.Mock).mockResolvedValue(orders);
      (prismaService.order.count as jest.Mock).mockResolvedValue(1);

      // Act
      const result = await service.findAll({ page: 1, limit: 20 });

      // Assert
      expect(result).toEqual({
        items: orders,
        total: 1,
        page: 1,
        limit: 20,
        totalPages: 1,
      });
    });

    it("should filter orders by status", async () => {
      // Arrange
      (prismaService.order.findMany as jest.Mock).mockResolvedValue([]);
      (prismaService.order.count as jest.Mock).mockResolvedValue(0);

      // Act
      await service.findAll({ status: OrderStatus.PENDING, page: 1, limit: 20 });

      // Assert
      expect(prismaService.order.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: { status: "PENDING" },
        })
      );
    });
  });

  describe("updateStatus", () => {
    it("should update order status", async () => {
      // Arrange
      const updatedOrder = { ...mockOrder, status: "SHIPPED" };
      (prismaService.order.update as jest.Mock).mockResolvedValue(updatedOrder);

      // Act
      const result = await service.updateStatus("order-123", OrderStatus.SHIPPED);

      // Assert
      expect(result.status).toBe("SHIPPED");
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: { status: "SHIPPED" },
      });
    });
  });

  describe("updatePaymentStatus", () => {
    it("should update payment status with reference", async () => {
      // Arrange
      const updatedOrder = { ...mockOrder, paymentStatus: "PAID", paymentReference: "PAY-123" };
      (prismaService.order.update as jest.Mock).mockResolvedValue(updatedOrder);

      // Act
      const result = await service.updatePaymentStatus("order-123", "PAID", "PAY-123");

      // Assert
      expect(result.paymentStatus).toBe("PAID");
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: { paymentStatus: "PAID", paymentReference: "PAY-123" },
      });
    });

    it("should update payment status without reference", async () => {
      // Arrange
      const updatedOrder = { ...mockOrder, paymentStatus: "FAILED" };
      (prismaService.order.update as jest.Mock).mockResolvedValue(updatedOrder);

      // Act
      const result = await service.updatePaymentStatus("order-123", "FAILED");

      // Assert
      expect(result.paymentStatus).toBe("FAILED");
      expect(prismaService.order.update).toHaveBeenCalledWith({
        where: { id: "order-123" },
        data: { paymentStatus: "FAILED", paymentReference: undefined },
      });
    });
  });
});
