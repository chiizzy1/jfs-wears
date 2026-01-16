/**
 * Script to delete products without images
 * Run with: npx ts-node scripts/cleanup-products.ts
 */

import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Finding products without images...");

  // Find products that have no images in either legacy images OR colorGroups
  const productsWithoutImages = await prisma.product.findMany({
    where: {
      AND: [
        {
          OR: [{ images: { none: {} } }, { images: undefined }],
        },
        {
          OR: [
            { colorGroups: { none: {} } },
            {
              colorGroups: {
                every: {
                  images: { none: {} },
                },
              },
            },
          ],
        },
      ],
    },
    include: {
      images: true,
      colorGroups: {
        include: {
          images: true,
        },
      },
    },
  });

  console.log(`Found ${productsWithoutImages.length} products without images:`);
  productsWithoutImages.forEach((p) => {
    console.log(`  - ${p.name} (${p.id})`);
  });

  if (productsWithoutImages.length === 0) {
    console.log("No products to delete!");
    return;
  }

  // Confirm deletion
  console.log("\nDeleting products without images...");

  for (const product of productsWithoutImages) {
    // Delete related records first (variants, colorGroups, etc.)
    await prisma.productVariant.deleteMany({ where: { productId: product.id } });
    await prisma.variantImage.deleteMany({
      where: { colorGroup: { productId: product.id } },
    });
    await prisma.colorGroup.deleteMany({ where: { productId: product.id } });
    await prisma.productImage.deleteMany({ where: { productId: product.id } });
    await prisma.bulkPricingTier.deleteMany({ where: { productId: product.id } });

    // Delete the product
    await prisma.product.delete({ where: { id: product.id } });
    console.log(`  ✓ Deleted: ${product.name}`);
  }

  console.log("\n✅ Cleanup complete!");
}

main()
  .catch((e) => {
    console.error("Error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
