"use client";

import Image from "next/image";
import Link from "next/link";
import { Eye, Heart } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { CONDITION_LABELS, formatINR, cn } from "@/lib/utils";
import type { ProductCardItem } from "@/types/catalog";

interface ProductCardProps {
  product: ProductCardItem;
}

export function ProductCard({ product }: ProductCardProps) {
  const { isInWishlist, toggleWishlist, openQuickView } = useStore();
  const wishlisted = isInWishlist(product.id);
  const primaryImg = product.images[0]?.url || "/images/prod-trench.jpg";
  const secondaryImg = product.images[1]?.url;
  const isSoldOut = product.stockQuantity <= 0;

  return (
    <article className="group flex flex-col">
      {/* Image Container */}
      <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand/40 border border-charcoal/8">
        <Link
          href={`/product/${product.slug}`}
          className="block h-full w-full"
          aria-label={product.name}
        >
          <Image
            src={primaryImg}
            alt={product.images[0]?.alt || product.name}
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className={cn(
              "object-cover transition-all duration-700 ease-out group-hover:scale-[1.03]",
              secondaryImg && "group-hover:opacity-0",
              isSoldOut && "opacity-65 grayscale-[30%]"
            )}
          />
          {secondaryImg && (
            <Image
              src={secondaryImg}
              alt={product.images[1]?.alt || `${product.name} alternate view`}
              fill
              sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
              className="object-cover opacity-0 transition-all duration-700 ease-out group-hover:scale-[1.03] group-hover:opacity-100"
            />
          )}
        </Link>

        {/* Top Left: Condition & Availability */}
        <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1">
          <span className="bg-ivory/92 backdrop-blur-xs px-2 py-0.5 text-[10px] font-medium tracking-[0.14em] uppercase text-charcoal border border-charcoal/10">
            {CONDITION_LABELS[product.condition]}
          </span>
          {isSoldOut ? (
            <span className="bg-charcoal px-2 py-0.5 text-[10px] font-medium tracking-[0.14em] uppercase text-ivory">
              Sold Out
            </span>
          ) : product.stockQuantity === 1 ? (
            <span className="bg-olive/90 px-2 py-0.5 text-[10px] font-medium tracking-[0.14em] uppercase text-white">
              1 of 1
            </span>
          ) : null}
        </div>

        {/* Top Right: Wishlist */}
        <button
          type="button"
          onClick={() => toggleWishlist(product.id, product.name)}
          aria-label={
            wishlisted ? "Remove from wishlist" : "Add to wishlist"
          }
          className="absolute right-2.5 top-2.5 flex h-8 w-8 items-center justify-center bg-ivory/90 backdrop-blur-xs border border-charcoal/10 text-charcoal transition-colors hover:bg-charcoal hover:text-ivory"
        >
          <Heart
            className={cn(
              "h-3.5 w-3.5 stroke-[1.6]",
              wishlisted && "fill-current text-olive group-hover:text-current"
            )}
          />
        </button>

        {/* Bottom Quick View Bar */}
        <div className="absolute inset-x-0 bottom-0 translate-y-full opacity-0 transition-all duration-300 group-hover:translate-y-0 group-hover:opacity-100 hidden sm:block">
          <button
            type="button"
            onClick={() => openQuickView(product)}
            className="flex w-full items-center justify-center gap-2 bg-charcoal/95 py-2.5 text-[10px] font-medium tracking-[0.18em] uppercase text-ivory hover:bg-charcoal transition-colors"
          >
            <Eye className="h-3.5 w-3.5" />
            Quick View
          </button>
        </div>
      </div>

      {/* Product Metadata */}
      <div className="mt-3.5 flex flex-1 flex-col justify-between gap-2">
        <div>
          <div className="flex items-center justify-between gap-2 text-[10px] tracking-[0.14em] uppercase text-charcoal/55">
            <span className="truncate">{product.brand}</span>
            <span>Size {product.size}</span>
          </div>
          <Link
            href={`/product/${product.slug}`}
            className="mt-1 block text-sm font-normal leading-snug text-charcoal hover:text-olive transition-colors line-clamp-2"
          >
            {product.name}
          </Link>
        </div>

        <div className="flex items-center justify-between pt-0.5">
          <div className="flex items-baseline gap-2 tabular-nums">
            <span className="text-sm font-medium text-charcoal">
              {formatINR(product.price)}
            </span>
            {product.originalPriceVerified && product.originalPrice && (
              <span className="text-xs text-charcoal/45 line-through">
                {formatINR(product.originalPrice)}
              </span>
            )}
          </div>

          <button
            type="button"
            onClick={() => openQuickView(product)}
            className="text-[10px] tracking-[0.14em] uppercase text-charcoal/60 underline underline-offset-4 hover:text-charcoal sm:hidden"
          >
            Quick View
          </button>
        </div>
      </div>
    </article>
  );
}

