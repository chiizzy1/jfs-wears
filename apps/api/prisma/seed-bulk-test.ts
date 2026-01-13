import { PrismaClient, Gender } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("🌱 Creating Bulk Test Product...");

  // 1. Find or Create Category
  let category = await prisma.category.findUnique({ where: { slug: "t-shirts" } });
  if (!category) {
    category = await prisma.category.create({
      data: {
        name: "T-Shirts",
        slug: "t-shirts",
        description: "Test Category",
      },
    });
  }

  // 2. Create Product with Bulk Tiers
  const product = await prisma.product.create({
    data: {
      name: "Bulk Verification Tee",
      slug: "bulk-verification-tee",
      description:
        "A product specifically created to test bulk pricing tiers. \n\nBuy 5+ for 10% off\nBuy 10+ for 20% off\nBuy 20+ for 30% off",
      basePrice: 5000,
      gender: Gender.UNISEX,
      categoryId: category.id,
      isActive: true,
      isFeatured: true,
      bulkEnabled: true,
      // Create Tiers
      bulkPricingTiers: {
        create: [
          { minQuantity: 5, discountPercent: 10 },
          { minQuantity: 10, discountPercent: 20 },
          { minQuantity: 20, discountPercent: 30 },
        ],
      },
      // Create Variants
      variants: {
        create: [
          { sku: "BULK-TEST-S", size: "S", color: "White", stock: 100 },
          { sku: "BULK-TEST-M", size: "M", color: "White", stock: 100 },
          { sku: "BULK-TEST-L", size: "L", color: "White", stock: 100 },
          { sku: "BULK-TEST-XL", size: "XL", color: "Blue", stock: 100 },
        ],
      },
      // Create Images (using placeholders)
      images: {
        create: [
          {
            url: "https://placehold.co/600x600/2563eb/white?text=Bulk+Test",
            isMain: true,
            altText: "Bulk Verification Tee Front",
            position: 0,
          },
        ],
      },
    },
  });

  console.log(`✅ Created Product: ${product.name} (${product.slug})`);
  console.log(`   Price: ₦${product.basePrice}`);
  console.log(`   Bulk Tiers: 5+ (10%), 10+ (20%), 20+ (30%)`);
}

main()
  .catch((e) => {
    console.error("❌ Failed to create test product:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
