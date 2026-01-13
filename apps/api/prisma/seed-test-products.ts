import { PrismaClient, PaymentMethod, PaymentStatus, OrderStatus, PaymentProvider } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🧹 Cleaning up existing data...");

  // Delete in order respecting foreign keys
  await prisma.orderItem.deleteMany({});
  await prisma.order.deleteMany({});
  await prisma.cartItem.deleteMany({});
  await prisma.wishlistItem.deleteMany({});
  await prisma.review.deleteMany({});
  await prisma.variantImage.deleteMany({});
  await prisma.colorGroup.deleteMany({});
  await prisma.productImage.deleteMany({});
  await prisma.productVariant.deleteMany({});
  await prisma.bulkPricingTier.deleteMany({});
  await prisma.product.deleteMany({});
  await prisma.address.deleteMany({});
  await prisma.user.deleteMany({});

  console.log("✅ Cleaned up!");

  // ========== SHIPPING ZONE ==========
  console.log("\n🚚 Creating shipping zone...");
  let shippingZone = await prisma.shippingZone.findFirst({ where: { name: "Lagos" } });
  if (!shippingZone) {
    shippingZone = await prisma.shippingZone.create({
      data: {
        name: "Lagos",
        states: ["Lagos"],
        fee: 2500,
        isActive: true,
      },
    });
  }
  console.log(`  ✅ Shipping Zone: ${shippingZone.name} (₦${shippingZone.fee})`);

  // ========== CATEGORIES ==========
  console.log("\n📁 Creating categories...");
  let hoodiesCategory = await prisma.category.findFirst({ where: { slug: "hoodies" } });
  if (!hoodiesCategory) {
    hoodiesCategory = await prisma.category.create({
      data: { name: "Hoodies", slug: "hoodies", description: "Premium hoodies and sweatshirts" },
    });
  }

  let tshirtsCategory = await prisma.category.findFirst({ where: { slug: "t-shirts" } });
  if (!tshirtsCategory) {
    tshirtsCategory = await prisma.category.create({
      data: { name: "T-Shirts", slug: "t-shirts", description: "Casual and stylish t-shirts" },
    });
  }

  // ========== USERS ==========
  console.log("\n👤 Creating test users...");
  const hashedPassword = await bcrypt.hash("Password123!", 10);

  const customer1 = await prisma.user.create({
    data: {
      email: "john.doe@example.com",
      name: "John Doe",
      phone: "+2348012345678",
      passwordHash: hashedPassword,
      isVerified: true,
      addresses: {
        create: {
          firstName: "John",
          lastName: "Doe",
          phone: "+2348012345678",
          address: "123 Victoria Island",
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria",
          isDefault: true,
        },
      },
    },
  });
  console.log(`  ✅ Created: ${customer1.name} (${customer1.email})`);

  const customer2 = await prisma.user.create({
    data: {
      email: "jane.smith@example.com",
      name: "Jane Smith",
      phone: "+2348098765432",
      passwordHash: hashedPassword,
      isVerified: true,
      addresses: {
        create: {
          firstName: "Jane",
          lastName: "Smith",
          phone: "+2348098765432",
          address: "456 Lekki Phase 1",
          city: "Lagos",
          state: "Lagos",
          country: "Nigeria",
          isDefault: true,
        },
      },
    },
  });
  console.log(`  ✅ Created: ${customer2.name} (${customer2.email})`);

  // ========== PRODUCTS ==========
  console.log("\n📦 Creating products with bulk pricing...");

  // Product 1: Premium Hoodie with Bulk Pricing
  const hoodie = await prisma.product.create({
    data: {
      name: "Premium Streetwear Hoodie",
      slug: "premium-streetwear-hoodie",
      description: "Ultra-soft cotton blend hoodie with minimalist JFS Wears branding.",
      basePrice: 15000,
      categoryId: hoodiesCategory.id,
      gender: "UNISEX",
      isFeatured: true,
      isActive: true,
      bulkEnabled: true,
      bulkPricingTiers: {
        create: [
          { minQuantity: 5, discountPercent: 10 },
          { minQuantity: 10, discountPercent: 15 },
          { minQuantity: 20, discountPercent: 20 },
        ],
      },
      colorGroups: {
        create: [
          { colorName: "Black", colorHex: "#000000", position: 0 },
          { colorName: "Grey", colorHex: "#808080", position: 1 },
        ],
      },
      variants: {
        create: [
          { size: "S", color: "Black", sku: "HD-BLK-S", stock: 50, priceAdjustment: 0, isActive: true },
          { size: "M", color: "Black", sku: "HD-BLK-M", stock: 50, priceAdjustment: 0, isActive: true },
          { size: "L", color: "Black", sku: "HD-BLK-L", stock: 50, priceAdjustment: 0, isActive: true },
          { size: "XL", color: "Black", sku: "HD-BLK-XL", stock: 30, priceAdjustment: 500, isActive: true },
          { size: "S", color: "Grey", sku: "HD-GRY-S", stock: 30, priceAdjustment: 0, isActive: true },
          { size: "M", color: "Grey", sku: "HD-GRY-M", stock: 30, priceAdjustment: 0, isActive: true },
          { size: "L", color: "Grey", sku: "HD-GRY-L", stock: 30, priceAdjustment: 0, isActive: true },
        ],
      },
    },
    include: { variants: true },
  });
  console.log(`  ✅ Created: ${hoodie.name} (3 bulk tiers, 2 colors, 7 variants)`);

  // Product 2: Classic T-Shirt with Bulk Pricing
  const tshirt = await prisma.product.create({
    data: {
      name: "Classic Logo T-Shirt",
      slug: "classic-logo-tshirt",
      description: "Comfortable everyday t-shirt with signature JFS Wears logo.",
      basePrice: 8000,
      categoryId: tshirtsCategory.id,
      gender: "UNISEX",
      isFeatured: true,
      isActive: true,
      bulkEnabled: true,
      bulkPricingTiers: {
        create: [
          { minQuantity: 10, discountPercent: 15 },
          { minQuantity: 25, discountPercent: 25 },
        ],
      },
      colorGroups: {
        create: [
          { colorName: "White", colorHex: "#FFFFFF", position: 0 },
          { colorName: "Navy", colorHex: "#000080", position: 1 },
          { colorName: "Black", colorHex: "#000000", position: 2 },
        ],
      },
      variants: {
        create: [
          { size: "S", color: "White", sku: "TS-WHT-S", stock: 100, priceAdjustment: 0, isActive: true },
          { size: "M", color: "White", sku: "TS-WHT-M", stock: 100, priceAdjustment: 0, isActive: true },
          { size: "L", color: "White", sku: "TS-WHT-L", stock: 80, priceAdjustment: 0, isActive: true },
          { size: "S", color: "Navy", sku: "TS-NVY-S", stock: 60, priceAdjustment: 0, isActive: true },
          { size: "M", color: "Navy", sku: "TS-NVY-M", stock: 60, priceAdjustment: 0, isActive: true },
          { size: "L", color: "Navy", sku: "TS-NVY-L", stock: 60, priceAdjustment: 0, isActive: true },
          { size: "S", color: "Black", sku: "TS-BLK-S", stock: 80, priceAdjustment: 0, isActive: true },
          { size: "M", color: "Black", sku: "TS-BLK-M", stock: 80, priceAdjustment: 0, isActive: true },
          { size: "L", color: "Black", sku: "TS-BLK-L", stock: 80, priceAdjustment: 0, isActive: true },
        ],
      },
    },
    include: { variants: true },
  });
  console.log(`  ✅ Created: ${tshirt.name} (2 bulk tiers, 3 colors, 9 variants)`);

  // Product 3: Joggers WITHOUT bulk pricing
  const joggers = await prisma.product.create({
    data: {
      name: "Urban Joggers",
      slug: "urban-joggers",
      description: "Sleek urban joggers with tapered fit.",
      basePrice: 12000,
      categoryId: hoodiesCategory.id,
      gender: "UNISEX",
      isFeatured: false,
      isActive: true,
      bulkEnabled: false,
      colorGroups: {
        create: [{ colorName: "Charcoal", colorHex: "#36454F", position: 0 }],
      },
      variants: {
        create: [
          { size: "S", color: "Charcoal", sku: "JG-CHR-S", stock: 40, priceAdjustment: 0, isActive: true },
          { size: "M", color: "Charcoal", sku: "JG-CHR-M", stock: 40, priceAdjustment: 0, isActive: true },
          { size: "L", color: "Charcoal", sku: "JG-CHR-L", stock: 40, priceAdjustment: 0, isActive: true },
          { size: "XL", color: "Charcoal", sku: "JG-CHR-XL", stock: 25, priceAdjustment: 1000, isActive: true },
        ],
      },
    },
    include: { variants: true },
  });
  console.log(`  ✅ Created: ${joggers.name} (no bulk pricing)`);

  // ========== ORDERS ==========
  console.log("\n🛒 Creating test orders...");

  const shippingAddressJson = {
    firstName: "John",
    lastName: "Doe",
    phone: "+2348012345678",
    address: "123 Victoria Island",
    city: "Lagos",
    state: "Lagos",
  };

  // Order 1: Pending order
  const order1 = await prisma.order.create({
    data: {
      orderNumber: `JFS-${Date.now()}-001`,
      userId: customer1.id,
      shippingAddress: shippingAddressJson,
      shippingZoneId: shippingZone.id,
      subtotal: 30000,
      shippingFee: 2500,
      discount: 0,
      total: 32500,
      status: OrderStatus.PENDING,
      paymentStatus: PaymentStatus.PENDING,
      paymentMethod: PaymentMethod.CARD,
      paymentProvider: PaymentProvider.PAYSTACK,
      items: {
        create: [
          {
            productId: hoodie.id,
            variantId: hoodie.variants[0].id,
            productName: hoodie.name,
            variantSize: "S",
            variantColor: "Black",
            quantity: 2,
            unitPrice: 15000,
            total: 30000,
          },
        ],
      },
    },
  });
  console.log(`  ✅ Created Order: ${order1.orderNumber} (PENDING)`);

  // Order 2: Completed order with bulk discount
  const order2 = await prisma.order.create({
    data: {
      orderNumber: `JFS-${Date.now()}-002`,
      userId: customer2.id,
      shippingAddress: shippingAddressJson,
      shippingZoneId: shippingZone.id,
      subtotal: 68000,
      shippingFee: 0,
      discount: 10200,
      total: 57800,
      status: OrderStatus.DELIVERED,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.CARD,
      paymentProvider: PaymentProvider.PAYSTACK,
      paymentReference: "PAY-TEST-002",
      items: {
        create: [
          {
            productId: tshirt.id,
            variantId: tshirt.variants[0].id,
            productName: tshirt.name,
            variantSize: "S",
            variantColor: "White",
            quantity: 5,
            unitPrice: 6800,
            total: 34000,
          },
          {
            productId: tshirt.id,
            variantId: tshirt.variants[1].id,
            productName: tshirt.name,
            variantSize: "M",
            variantColor: "White",
            quantity: 5,
            unitPrice: 6800,
            total: 34000,
          },
        ],
      },
    },
  });
  console.log(`  ✅ Created Order: ${order2.orderNumber} (DELIVERED with bulk discount)`);

  // Order 3: Processing order
  const order3 = await prisma.order.create({
    data: {
      orderNumber: `JFS-${Date.now()}-003`,
      userId: customer1.id,
      shippingAddress: shippingAddressJson,
      shippingZoneId: shippingZone.id,
      subtotal: 24000,
      shippingFee: 2500,
      discount: 0,
      total: 26500,
      status: OrderStatus.PROCESSING,
      paymentStatus: PaymentStatus.PAID,
      paymentMethod: PaymentMethod.BANK_TRANSFER,
      paymentProvider: PaymentProvider.MONNIFY,
      paymentReference: "PAY-TEST-003",
      items: {
        create: [
          {
            productId: joggers.id,
            variantId: joggers.variants[0].id,
            productName: joggers.name,
            variantSize: "S",
            variantColor: "Charcoal",
            quantity: 2,
            unitPrice: 12000,
            total: 24000,
          },
        ],
      },
    },
  });
  console.log(`  ✅ Created Order: ${order3.orderNumber} (PROCESSING)`);

  // ========== REVIEWS ==========
  console.log("\n⭐ Creating reviews...");

  await prisma.review.create({
    data: {
      productId: hoodie.id,
      userId: customer2.id,
      rating: 5,
      title: "Amazing quality!",
      comment: "Best hoodie I've ever owned. The fabric is super soft and the fit is perfect.",
      isVerified: true,
    },
  });
  console.log("  ✅ Created review for Premium Hoodie");

  await prisma.review.create({
    data: {
      productId: tshirt.id,
      userId: customer1.id,
      rating: 4,
      title: "Great value",
      comment: "Good quality t-shirt, especially with the bulk discount. Will order more!",
      isVerified: true,
    },
  });
  console.log("  ✅ Created review for Classic T-Shirt");

  console.log("\n🎉 Database seeded successfully!");
  console.log("════════════════════════════════════════");
  console.log("  📦 Products: 3 (2 with bulk pricing)");
  console.log("  👤 Users: 2 test customers");
  console.log("  🛒 Orders: 3 (various statuses)");
  console.log("  ⭐ Reviews: 2");
  console.log("════════════════════════════════════════");
  console.log("\nTest Credentials:");
  console.log("  Customer 1: john.doe@example.com / Password123!");
  console.log("  Customer 2: jane.smith@example.com / Password123!");
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
