"use client";

import { useEffect } from "react";
import { useRecentlyViewedStore } from "@/stores/recently-viewed-store";

interface RecentlyViewedTrackerProps {
  productId: string;
  name: string;
  price: number;
  image: string;
  slug: string;
}

export default function RecentlyViewedTracker({ productId, name, price, image, slug }: RecentlyViewedTrackerProps) {
  const addItem = useRecentlyViewedStore((state) => state.addItem);

  useEffect(() => {
    addItem({ productId, name, price, image, slug });
  }, [productId, name, price, image, slug, addItem]);

  return null; // This is a tracking-only component
}
