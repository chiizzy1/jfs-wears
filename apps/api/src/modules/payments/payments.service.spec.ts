import { Test, TestingModule } from "@nestjs/testing";
import { ConfigService } from "@nestjs/config";
import { PaymentsService } from "./payments.service";
import { OpayProvider } from "./providers/opay.provider";
import { MonnifyProvider } from "./providers/monnify.provider";
import { PaystackProvider } from "./providers/paystack.provider";
import { OrdersService } from "../orders/orders.service";

describe("PaymentsService", () => {
  let service: PaymentsService;
  let opayProvider: jest.Mocked<OpayProvider>;
  let monnifyProvider: jest.Mocked<MonnifyProvider>;
  let paystackProvider: jest.Mocked<PaystackProvider>;
  let ordersService: jest.Mocked<OrdersService>;

  const mockPaymentData = {
    amount: 10000,
    email: "customer@example.com",
    orderId: "order-123",
    callbackUrl: "http://localhost:3000/payment/callback",
  };

  const mockPaymentResponse = {
    success: true,
    paymentUrl: "https://payment.provider.com/pay/123",
    reference: "PAY-REF-123",
  };

  beforeEach(async () => {
    const mockOpayProvider = {
      initialize: jest.fn(),
      verify: jest.fn(),
    };

    const mockMonnifyProvider = {
      initialize: jest.fn(),
      verify: jest.fn(),
    };

    const mockPaystackProvider = {
      initialize: jest.fn(),
      verify: jest.fn(),
    };

    const mockOrdersService = {
      updatePaymentStatus: jest.fn(),
    };

    const mockConfigService = {
      get: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        PaymentsService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: OpayProvider, useValue: mockOpayProvider },
        { provide: MonnifyProvider, useValue: mockMonnifyProvider },
        { provide: PaystackProvider, useValue: mockPaystackProvider },
        { provide: OrdersService, useValue: mockOrdersService },
      ],
    }).compile();

    service = module.get<PaymentsService>(PaymentsService);
    opayProvider = module.get(OpayProvider);
    monnifyProvider = module.get(MonnifyProvider);
    paystackProvider = module.get(PaystackProvider);
    ordersService = module.get(OrdersService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  describe("initializePayment", () => {
    it("should route to OPay provider when provider is OPAY", async () => {
      // Arrange
      (opayProvider.initialize as jest.Mock).mockResolvedValue(mockPaymentResponse);

      // Act
      const result = await service.initializePayment({
        ...mockPaymentData,
        provider: "OPAY",
      });

      // Assert
      expect(opayProvider.initialize).toHaveBeenCalledWith(mockPaymentData);
      expect(monnifyProvider.initialize).not.toHaveBeenCalled();
      expect(paystackProvider.initialize).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaymentResponse);
    });

    it("should route to Monnify provider when provider is MONNIFY", async () => {
      // Arrange
      (monnifyProvider.initialize as jest.Mock).mockResolvedValue(mockPaymentResponse);

      // Act
      const result = await service.initializePayment({
        ...mockPaymentData,
        provider: "MONNIFY",
      });

      // Assert
      expect(monnifyProvider.initialize).toHaveBeenCalledWith(mockPaymentData);
      expect(opayProvider.initialize).not.toHaveBeenCalled();
      expect(paystackProvider.initialize).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaymentResponse);
    });

    it("should route to Paystack provider when provider is PAYSTACK", async () => {
      // Arrange
      (paystackProvider.initialize as jest.Mock).mockResolvedValue(mockPaymentResponse);

      // Act
      const result = await service.initializePayment({
        ...mockPaymentData,
        provider: "PAYSTACK",
      });

      // Assert
      expect(paystackProvider.initialize).toHaveBeenCalledWith(mockPaymentData);
      expect(opayProvider.initialize).not.toHaveBeenCalled();
      expect(monnifyProvider.initialize).not.toHaveBeenCalled();
      expect(result).toEqual(mockPaymentResponse);
    });

    it("should throw error for invalid provider", async () => {
      // Act & Assert
      await expect(
        service.initializePayment({
          ...mockPaymentData,
          provider: "INVALID" as any,
        })
      ).rejects.toThrow("Invalid payment provider");
    });
  });

  describe("verifyPayment", () => {
    it("should verify payment with OPay provider", async () => {
      // Arrange
      const verifyResponse = { success: true, status: "SUCCESS" };
      (opayProvider.verify as jest.Mock).mockResolvedValue(verifyResponse);

      // Act
      const result = await service.verifyPayment("OPAY", "PAY-REF-123");

      // Assert
      expect(opayProvider.verify).toHaveBeenCalledWith("PAY-REF-123");
      expect(result).toEqual(verifyResponse);
    });

    it("should verify payment with Monnify provider", async () => {
      // Arrange
      const verifyResponse = { success: true, status: "PAID" };
      (monnifyProvider.verify as jest.Mock).mockResolvedValue(verifyResponse);

      // Act
      const result = await service.verifyPayment("MONNIFY", "PAY-REF-456");

      // Assert
      expect(monnifyProvider.verify).toHaveBeenCalledWith("PAY-REF-456");
      expect(result).toEqual(verifyResponse);
    });

    it("should verify payment with Paystack provider", async () => {
      // Arrange
      const verifyResponse = { success: true, status: "success" };
      (paystackProvider.verify as jest.Mock).mockResolvedValue(verifyResponse);

      // Act
      const result = await service.verifyPayment("PAYSTACK", "PAY-REF-789");

      // Assert
      expect(paystackProvider.verify).toHaveBeenCalledWith("PAY-REF-789");
      expect(result).toEqual(verifyResponse);
    });
  });

  describe("handlePaymentSuccess", () => {
    it("should update order status to PAID", async () => {
      // Arrange
      const updatedOrder = { id: "order-123", paymentStatus: "PAID" };
      (ordersService.updatePaymentStatus as jest.Mock).mockResolvedValue(updatedOrder);

      // Act
      const result = await service.handlePaymentSuccess("order-123", "PAY-REF-123");

      // Assert
      expect(ordersService.updatePaymentStatus).toHaveBeenCalledWith("order-123", "PAID", "PAY-REF-123");
      expect(result).toEqual(updatedOrder);
    });
  });

  describe("handlePaymentFailed", () => {
    it("should update order status to FAILED", async () => {
      // Arrange
      const updatedOrder = { id: "order-123", paymentStatus: "FAILED" };
      (ordersService.updatePaymentStatus as jest.Mock).mockResolvedValue(updatedOrder);

      // Act
      const result = await service.handlePaymentFailed("order-123", "PAY-REF-123");

      // Assert
      expect(ordersService.updatePaymentStatus).toHaveBeenCalledWith("order-123", "FAILED", "PAY-REF-123");
      expect(result).toEqual(updatedOrder);
    });

    it("should update order status to FAILED without reference", async () => {
      // Arrange
      const updatedOrder = { id: "order-123", paymentStatus: "FAILED" };
      (ordersService.updatePaymentStatus as jest.Mock).mockResolvedValue(updatedOrder);

      // Act
      const result = await service.handlePaymentFailed("order-123");

      // Assert
      expect(ordersService.updatePaymentStatus).toHaveBeenCalledWith("order-123", "FAILED", undefined);
      expect(result).toEqual(updatedOrder);
    });
  });
});
