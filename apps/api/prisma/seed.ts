import { PrismaClient, StaffRole, PromotionType, Gender } from "@prisma/client";
import * as bcrypt from "bcrypt";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Starting database seed...\n");

  // Clear existing data (in order due to foreign keys)
  console.log("🗑️  Clearing existing data...");
  try {
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.cartItem.deleteMany();
    await prisma.productImage.deleteMany();
    await prisma.productVariant.deleteMany();
    await prisma.product.deleteMany();
    await prisma.category.deleteMany();
    await prisma.promotion.deleteMany();
    await prisma.shippingZone.deleteMany();
    await prisma.staff.deleteMany();
    await prisma.user.deleteMany();
  } catch (error) {
    console.warn("⚠️ Warning: Could not clear some tables (might not exist yet).");
  }

  // Create Admin Staff
  console.log("👤 Creating admin staff...");
  const adminPassword = await bcrypt.hash("Admin123!", 10);
  const admin = await prisma.staff.create({
    data: {
      email: "admin@jfswears.com",
      name: "Admin User",
      passwordHash: adminPassword,
      role: StaffRole.ADMIN,
      isActive: true,
    },
  });
  console.log(`   ✅ Admin created: ${admin.email}`);

  // Create Manager Staff
  const managerPassword = await bcrypt.hash("Manager123!", 10);
  const manager = await prisma.staff.create({
    data: {
      email: "manager@jfswears.com",
      name: "Store Manager",
      passwordHash: managerPassword,
      role: StaffRole.MANAGER,
      isActive: true,
    },
  });
  console.log(`   ✅ Manager created: ${manager.email}`);

  // Create Categories
  console.log("\n📁 Creating categories...");
  const categories = await Promise.all([
    prisma.category.create({
      data: {
        name: "Hoodies",
        slug: "hoodies",
        description: "Premium streetwear hoodies for all seasons",
        imageUrl: "/categories/hoodies.jpg",
      },
    }),
    prisma.category.create({
      data: {
        name: "T-Shirts",
        slug: "t-shirts",
        description: "Classic and modern t-shirt designs",
        imageUrl: "/categories/tshirts.jpg",
      },
    }),
    prisma.category.create({
      data: {
        name: "Pants",
        slug: "pants",
        description: "Comfortable joggers and stylish pants",
        imageUrl: "/categories/pants.jpg",
      },
    }),
    prisma.category.create({
      data: {
        name: "Accessories",
        slug: "accessories",
        description: "Caps, bags, and more",
        imageUrl: "/categories/accessories.jpg",
      },
    }),
  ]);
  console.log(`   ✅ Created ${categories.length} categories`);

  // Create Products
  console.log("\n👕 Creating products...");
  const products = [
    {
      name: "Premium Streetwear Hoodie",
      slug: "premium-streetwear-hoodie",
      description:
        "Ultra-soft cotton blend hoodie with minimalist JFS Wears branding. Features a relaxed fit, kangaroo pocket, and premium drawstring hood.",
      basePrice: 15000,
      gender: Gender.UNISEX,
      categorySlug: "hoodies",
      isFeatured: true,
      images: [
        { url: "/products/hoodie-1.jpg", isMain: true, alt: "Black Hoodie Front" },
        { url: "/products/hoodie-2.jpg", isMain: false, alt: "Black Hoodie Back" },
      ],
      variants: [
        { sku: "HD-BLK-S", size: "S", color: "Black", stock: 50 },
        { sku: "HD-BLK-M", size: "M", color: "Black", stock: 50 },
        { sku: "HD-BLK-L", size: "L", color: "Black", stock: 50 },
        { sku: "HD-GRY-S", size: "S", color: "Grey", stock: 30 },
        { sku: "HD-GRY-M", size: "M", color: "Grey", stock: 30 },
        { sku: "HD-GRY-L", size: "L", color: "Grey", stock: 30 },
      ],
    },
    {
      name: "Classic Cotton T-Shirt",
      slug: "classic-cotton-tshirt",
      description: "Breathable 100% cotton t-shirt perfect for everyday wear. Durable stitching and fade-resistant fabric.",
      basePrice: 8500,
      gender: Gender.UNISEX,
      categorySlug: "t-shirts",
      isFeatured: true,
      images: [{ url: "/products/tshirt-1.jpg", isMain: true, alt: "White T-Shirt Front" }],
      variants: [
        { sku: "TS-WHT-S", size: "S", color: "White", stock: 100 },
        { sku: "TS-WHT-M", size: "M", color: "White", stock: 100 },
        { sku: "TS-WHT-L", size: "L", color: "White", stock: 100 },
        { sku: "TS-BLK-S", size: "S", color: "Black", stock: 100 },
        { sku: "TS-BLK-M", size: "M", color: "Black", stock: 100 },
        { sku: "TS-BLK-L", size: "L", color: "Black", stock: 100 },
      ],
    },
    {
      name: "Comfort Jogger Pants",
      slug: "comfort-jogger-pants",
      description: "Stylish joggers tailored for maximum comfort and flexibility. Elastic waistband with drawstring.",
      basePrice: 16000,
      gender: Gender.MEN,
      categorySlug: "pants",
      isFeatured: true,
      images: [{ url: "/products/joggers-1.jpg", isMain: true, alt: "Black Joggers" }],
      variants: [
        { sku: "JG-BLK-S", size: "S", color: "Black", stock: 40 },
        { sku: "JG-BLK-M", size: "M", color: "Black", stock: 40 },
        { sku: "JG-BLK-L", size: "L", color: "Black", stock: 40 },
        { sku: "JG-GRY-M", size: "M", color: "Grey", stock: 20 },
      ],
    },
    {
      name: "Oversized Graphic Tee",
      slug: "oversized-graphic-tee",
      description: "Trendy oversized fit with unique graphic print. Made from heavyweight cotton.",
      basePrice: 10500,
      gender: Gender.WOMEN,
      categorySlug: "t-shirts",
      isFeatured: true,
      images: [{ url: "/products/graphic-tee-1.jpg", isMain: true, alt: "Graphic Tee" }],
      variants: [
        { sku: "GT-OVR-S", size: "S", color: "Cream", stock: 30 },
        { sku: "GT-OVR-M", size: "M", color: "Cream", stock: 30 },
        { sku: "GT-OVR-L", size: "L", color: "Cream", stock: 30 },
      ],
    },
    {
      name: "Essential Cap",
      slug: "essential-cap",
      description: "Adjustable baseball cap with embroidered logo. One size fits all.",
      basePrice: 5000,
      gender: Gender.UNISEX,
      categorySlug: "accessories",
      isFeatured: false,
      images: [{ url: "/products/cap-1.jpg", isMain: true, alt: "Black Cap" }],
      variants: [
        { sku: "CP-BLK-OS", size: "One Size", color: "Black", stock: 100 },
        { sku: "CP-NVY-OS", size: "One Size", color: "Navy", stock: 50 },
      ],
    },
    {
      name: "Tech Fleece Track Jacket",
      slug: "tech-fleece-track-jacket",
      description: "Modern track jacket with moisture-wicking technology. Perfect for workouts or casual outings.",
      basePrice: 22000,
      gender: Gender.MEN,
      categorySlug: "hoodies",
      isFeatured: false,
      images: [{ url: "/products/track-jacket-1.jpg", isMain: true, alt: "Track Jacket" }],
      variants: [
        { sku: "TJ-BLK-M", size: "M", color: "Black", stock: 15 },
        { sku: "TJ-BLK-L", size: "L", color: "Black", stock: 12 },
        { sku: "TJ-RED-M", size: "M", color: "Red", stock: 8 },
      ],
    },
  ];

  for (const product of products) {
    const { variants, images, categorySlug, ...productData } = product;
    const category = categories.find((c) => c.slug === categorySlug);
    if (!category) {
      console.warn(`   ⚠️ Category not found for ${product.name}, skipping...`);
      continue;
    }
    const createdProduct = await prisma.product.create({
      data: {
        ...productData,
        categoryId: category.id,
        variants: {
          create: variants,
        },
        images: {
          create: images.map((img, idx) => ({
            url: img.url,
            isMain: img.isMain,
            altText: img.alt,
            position: idx,
          })),
        },
      },
    });
    console.log(`   ✅ ${createdProduct.name}`);
  }

  // Create Shipping Zones
  console.log("\n🚚 Creating shipping zones...");
  await prisma.shippingZone.createMany({
    data: [
      { name: "Lagos", states: ["Lagos"], fee: 1500, isActive: true },
      { name: "South West", states: ["Ogun", "Oyo", "Osun", "Ondo", "Ekiti"], fee: 2500, isActive: true },
      { name: "FCT", states: ["FCT", "Abuja"], fee: 3000, isActive: true },
      { name: "South East", states: ["Anambra", "Enugu", "Imo", "Abia", "Ebonyi"], fee: 3500, isActive: true },
      {
        name: "South South",
        states: ["Rivers", "Delta", "Edo", "Cross River", "Akwa Ibom", "Bayelsa"],
        fee: 3500,
        isActive: true,
      },
      {
        name: "North",
        states: [
          "Kaduna",
          "Kano",
          "Plateau",
          "Borno",
          "Sokoto",
          "Katsina",
          "Jigawa",
          "Bauchi",
          "Gombe",
          "Adamawa",
          "Taraba",
          "Yobe",
          "Zamfara",
          "Kebbi",
          "Niger",
          "Kwara",
          "Nassarawa",
          "Benue",
          "Kogi",
        ],
        fee: 4500,
        isActive: true,
      },
    ],
  });
  console.log("   ✅ Created 6 shipping zones");

  // Create Promotions
  console.log("\n🏷️  Creating promotions...");
  await prisma.promotion.createMany({
    data: [
      {
        code: "WELCOME10",
        name: "Welcome Discount",
        description: "10% off for first-time customers",
        type: PromotionType.PERCENTAGE,
        value: 10,
        minOrderAmount: 10000,
        maxDiscount: 5000,
        usageLimit: 1000,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        isActive: true,
      },
      {
        code: "FREESHIP",
        name: "Free Shipping",
        description: "Free shipping on orders over ₦30,000",
        type: PromotionType.FIXED_AMOUNT,
        value: 3000,
        minOrderAmount: 30000,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days
        isActive: true,
      },
      {
        code: "FLASH25",
        name: "Flash Sale 25% Off",
        description: "Limited time 25% discount",
        type: PromotionType.PERCENTAGE,
        value: 25,
        maxDiscount: 15000,
        usageLimit: 50,
        usageCount: 0,
        validFrom: new Date(),
        validTo: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000), // 7 days
        isActive: true,
      },
    ],
  });
  console.log("   ✅ Created 3 promotions");

  // Create a Demo Customer
  console.log("\n👥 Creating demo customer...");
  const customerPassword = await bcrypt.hash("Customer123!", 10);
  const customer = await prisma.user.create({
    data: {
      email: "customer@example.com",
      name: "John Doe",
      passwordHash: customerPassword,
      phone: "+2348012345678",
      addresses: {
        create: {
          firstName: "John", // Added firstName
          lastName: "Doe", // Added lastName
          phone: "+2348012345678", // Added phone
          address: "123 Victoria Island", // Changed street to address to match schema
          city: "Lagos",
          state: "Lagos",
          isDefault: true,
        },
      },
    },
  });
  console.log(`   ✅ Customer created: ${customer.email}`);

  // Create a test order for tracking page testing
  console.log("\n📦 Creating test order for tracking...");
  const lagosZone = await prisma.shippingZone.findFirst({ where: { name: "Lagos" } });
  const hoodie = await prisma.product.findFirst({
    where: { slug: "premium-streetwear-hoodie" },
    include: { variants: true },
  });
  const tshirt = await prisma.product.findFirst({
    where: { slug: "classic-cotton-tshirt" },
    include: { variants: true },
  });

  if (lagosZone && hoodie && tshirt && hoodie.variants[0] && tshirt.variants[0]) {
    const testOrder = await prisma.order.create({
      data: {
        orderNumber: "JFS-TRACK-001",
        userId: customer.id,
        status: "SHIPPED",
        paymentStatus: "PAID",
        paymentMethod: "BANK_TRANSFER",
        shippingAddress: {
          firstName: "John",
          lastName: "Doe",
          address: "123 Victoria Island",
          city: "Lagos",
          state: "Lagos",
        },
        shippingZoneId: lagosZone.id,
        shippingFee: 1500,
        subtotal: 23500,
        total: 25000,
        estimatedDeliveryDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000), // 5 days from now
        trackingNumber: "GIG-1234567890",
        carrierName: "GIG Logistics",
        statusHistory: [
          { status: "PENDING", timestamp: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "CONFIRMED", timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "PROCESSING", timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString() },
          { status: "SHIPPED", timestamp: new Date().toISOString() },
        ],
        items: {
          create: [
            {
              productId: hoodie.id,
              variantId: hoodie.variants[0].id,
              productName: "Premium Streetwear Hoodie",
              variantSize: "L",
              variantColor: "Black",
              quantity: 1,
              unitPrice: 15000,
              total: 15000,
            },
            {
              productId: tshirt.id,
              variantId: tshirt.variants[0].id,
              productName: "Classic Cotton T-Shirt",
              variantSize: "M",
              variantColor: "White",
              quantity: 1,
              unitPrice: 8500,
              total: 8500,
            },
          ],
        },
      },
    });
    console.log(`   ✅ Test order created: ${testOrder.orderNumber}`);

    // Create 20 more test orders for dashboard testing
    console.log("\n📦 Creating 20 additional test orders...");
    const statuses = ["PENDING", "CONFIRMED", "PROCESSING", "SHIPPED", "DELIVERED"] as const;
    const paymentStatuses = ["PAID", "PENDING"] as const;

    for (let i = 2; i <= 21; i++) {
      const orderStatus = statuses[Math.floor(Math.random() * statuses.length)];
      const paymentStatus = orderStatus === "PENDING" ? "PENDING" : "PAID";
      const daysAgo = Math.floor(Math.random() * 30); // Random date in last 30 days
      const orderDate = new Date(Date.now() - daysAgo * 24 * 60 * 60 * 1000);

      // Higher value orders (35K - 85K range)
      const baseAmount = 35000 + Math.floor(Math.random() * 50000);
      const shippingFee = 1500 + Math.floor(Math.random() * 3000);
      const total = baseAmount + shippingFee;

      await prisma.order.create({
        data: {
          orderNumber: `JFS-TEST-${String(i).padStart(3, "0")}`,
          userId: customer.id,
          status: orderStatus,
          paymentStatus: paymentStatus,
          paymentMethod: "BANK_TRANSFER",
          shippingAddress: {
            firstName: "Test",
            lastName: `Customer ${i}`,
            address: `${i * 10} Test Street`,
            city: "Lagos",
            state: "Lagos",
          },
          shippingZoneId: lagosZone.id,
          shippingFee: shippingFee,
          subtotal: baseAmount,
          total: total,
          createdAt: orderDate,
          updatedAt: orderDate,
          items: {
            create: [
              {
                productId: hoodie.id,
                variantId: hoodie.variants[Math.floor(Math.random() * hoodie.variants.length)].id,
                productName: "Premium Streetwear Hoodie",
                variantSize: ["S", "M", "L"][Math.floor(Math.random() * 3)],
                variantColor: ["Black", "Grey"][Math.floor(Math.random() * 2)],
                quantity: 1 + Math.floor(Math.random() * 3),
                unitPrice: 15000,
                total: 15000 * (1 + Math.floor(Math.random() * 3)),
              },
              {
                productId: tshirt.id,
                variantId: tshirt.variants[Math.floor(Math.random() * tshirt.variants.length)].id,
                productName: "Classic Cotton T-Shirt",
                variantSize: ["S", "M", "L"][Math.floor(Math.random() * 3)],
                variantColor: ["White", "Black"][Math.floor(Math.random() * 2)],
                quantity: 1 + Math.floor(Math.random() * 2),
                unitPrice: 8500,
                total: 8500 * (1 + Math.floor(Math.random() * 2)),
              },
            ],
          },
        },
      });
    }
    console.log("   ✅ Created 20 additional test orders");
  } else {
    console.log("   ⚠️ Could not create test order - missing products or shipping zone");
  }

  console.log("\n✨ Database seeding completed!\n");
  console.log("=".repeat(50));
  console.log("📋 Demo Credentials:");
  console.log("=".repeat(50));
  console.log("\n🔐 Admin Login:");
  console.log("   Email: admin@jfswears.com");
  console.log("   Password: Admin123!");
  console.log("\n🔐 Manager Login:");
  console.log("   Email: manager@jfswears.com");
  console.log("   Password: Manager123!");
  console.log("\n🛒 Customer Login:");
  console.log("   Email: customer@example.com");
  console.log("   Password: Customer123!");
  console.log("\n🏷️  Promo Codes: WELCOME10, FREESHIP, FLASH25");
  console.log("=".repeat(50));
}

main()
  .catch((e) => {
    console.error("❌ Seeding failed:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
