"use client";

import { useMemo } from "react";
import Link from "next/link";
import { useStore } from "@/components/providers/StoreProvider";
import { ProductCard } from "@/components/product/ProductCard";
import type { ProductCardItem } from "@/types/catalog";

export function WishlistViewClient({
  allProducts,
}: {
  allProducts: ProductCardItem[];
}) {
  const { wishlistIds } = useStore();

  const savedProducts = useMemo(
    () => allProducts.filter((p) => wishlistIds.includes(p.id)),
    [allProducts, wishlistIds]
  );

  if (savedProducts.length === 0) {
    return (
      <div className="border border-charcoal/12 bg-white p-12 text-center">
        <p className="font-editorial text-3xl text-charcoal">
          Your wishlist is empty
        </p>
        <p className="mt-2 text-xs text-charcoal/65">
          Tap the heart icon on any archive garment to keep track of pieces
          before they are claimed.
        </p>
        <Link
          href="/new-arrivals"
          className="mt-6 inline-block bg-charcoal px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase text-ivory"
        >
          Explore Archive
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3">
      {savedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

