-- DropIndex
DROP INDEX "product_variants_productId_size_colorGroupId_key";

-- AlterTable
ALTER TABLE "products" ADD COLUMN     "saleEndDate" TIMESTAMP(3),
ADD COLUMN     "salePrice" DECIMAL(10,2),
ADD COLUMN     "saleStartDate" TIMESTAMP(3);

-- AlterTable
ALTER TABLE "users" ADD COLUMN     "isSubscribed" BOOLEAN NOT NULL DEFAULT false;

-- CreateTable
CREATE TABLE "newsletter_subscribers" (
    "id" TEXT NOT NULL,
    "email" TEXT NOT NULL,
    "name" TEXT,
    "source" TEXT,
    "isActive" BOOLEAN NOT NULL DEFAULT true,
    "subscribedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "unsubscribedAt" TIMESTAMP(3),

    CONSTRAINT "newsletter_subscribers_pkey" PRIMARY KEY ("id")
);

-- CreateIndex
CREATE UNIQUE INDEX "newsletter_subscribers_email_key" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_email_idx" ON "newsletter_subscribers"("email");

-- CreateIndex
CREATE INDEX "newsletter_subscribers_isActive_idx" ON "newsletter_subscribers"("isActive");
