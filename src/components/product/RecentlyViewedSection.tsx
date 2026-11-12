"use client";

import { useEffect, useState } from "react";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardItem } from "@/types/catalog";

const RECENTLY_VIEWED_KEY = "tn_recently_viewed_v1";
const MAX_RECENT = 8;

export function RecentlyViewedSection({
  currentProduct,
}: {
  currentProduct: ProductCardItem;
}) {
  const [recentItems, setRecentItems] = useState<ProductCardItem[]>([]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (!active) return;
      try {
        const raw = localStorage.getItem(RECENTLY_VIEWED_KEY);
        const parsed: ProductCardItem[] = raw ? JSON.parse(raw) : [];
        const existing = Array.isArray(parsed) ? parsed : [];

        // Display previously viewed items excluding current
        const toShow = existing
          .filter((item) => item.id !== currentProduct.id)
          .slice(0, 4);
        setRecentItems(toShow);

        // Save current product at the front
        const updated = [
          currentProduct,
          ...existing.filter((item) => item.id !== currentProduct.id),
        ].slice(0, MAX_RECENT);
        localStorage.setItem(RECENTLY_VIEWED_KEY, JSON.stringify(updated));
      } catch {
        // Ignore storage errors
      }
    });
    return () => {
      active = false;
    };
  }, [currentProduct]);

  if (recentItems.length === 0) return null;

  return (
    <section className="border-t border-charcoal/12 bg-ivory">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12">
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
          Your Archive Trail
        </p>
        <h2 className="mt-2 font-editorial text-3xl text-charcoal">
          Recently Viewed
        </h2>
        <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
          {recentItems.map((item) => (
            <ProductCard key={item.id} product={item} />
          ))}
        </div>
      </div>
    </section>
  );
}

