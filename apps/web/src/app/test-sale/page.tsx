"use client";

import { CountdownTimer } from "@/components/storefront/CountdownTimer";
import { ProductPrice } from "@/components/storefront/ProductPrice";
import { SaleBadge } from "@/components/storefront/SaleBadge";

export default function TestSaleComponentsPage() {
  const tomorrow = new Date();
  tomorrow.setDate(tomorrow.getDate() + 1);

  const expired = new Date();
  expired.setDate(expired.getDate() - 1);

  return (
    <div className="p-20 space-y-12 bg-white min-h-screen">
      <h1 className="text-3xl font-bold">Component Verification: Limited Time Sale</h1>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">1. Countdown Timer</h2>

        <div className="grid grid-cols-1 gap-6">
          <div className="space-y-2">
            <p className="text-sm text-gray-500">Default (Medium)</p>
            <CountdownTimer endDate={tomorrow} />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Small (for Cards)</p>
            <CountdownTimer endDate={tomorrow} size="sm" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Large (for Hero/Details)</p>
            <CountdownTimer endDate={tomorrow} size="lg" />
          </div>

          <div className="space-y-2">
            <p className="text-sm text-gray-500">Expired (Should be hidden)</p>
            <div className="border p-2 border-dashed inline-block">
              Empty: <CountdownTimer endDate={expired} />
            </div>
          </div>
        </div>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">2. Sale Badge</h2>
        <div className="flex gap-4 items-center">
          <SaleBadge price={5000} compareAtPrice={10000} size="sm" />
          <SaleBadge price={5000} compareAtPrice={10000} size="md" />
          <SaleBadge price={5000} compareAtPrice={10000} size="lg" />
        </div>
        <p className="text-sm text-gray-500">
          No Sale (Hidden): <SaleBadge price={5000} compareAtPrice={5000} />
        </p>
      </section>

      <section className="space-y-4">
        <h2 className="text-xl font-semibold border-b pb-2">3. Product Price</h2>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Standard Price</p>
          <ProductPrice price={5000} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Sale Price</p>
          <ProductPrice price={5000} compareAtPrice={10000} />
        </div>
        <div className="space-y-2">
          <p className="text-sm text-gray-500">Large (Details)</p>
          <ProductPrice price={5000} compareAtPrice={10000} size="xl" />
        </div>
      </section>
    </div>
  );
}
