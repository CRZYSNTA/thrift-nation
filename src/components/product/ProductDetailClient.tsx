"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import type { SealedLiveQuery } from "@neon/realtime/client";
import { Check, Heart, Ruler, ShieldCheck, ShoppingBag } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { LiveStockObserver } from "@/components/product/LiveStockObserver";
import type { LiveProductStockRow } from "@/lib/realtime";
import {
  CONDITION_DESCRIPTIONS,
  CONDITION_LABELS,
  GENDER_LABELS,
  formatINR,
  cn,
} from "@/lib/utils";
import type { ProductDetailItem } from "@/types/catalog";

interface ProductDetailClientProps {
  product: ProductDetailItem;
  sealedStockQuery?: SealedLiveQuery<LiveProductStockRow> | null;
}

export function ProductDetailClient({
  product,
  sealedStockQuery = null,
}: ProductDetailClientProps) {
  const { addToCart, isInWishlist, toggleWishlist } = useStore();
  const [selectedIdx, setSelectedIdx] = useState(0);
  const [liveStock, setLiveStock] = useState(product.stockQuantity);
  const [liveStatus, setLiveStatus] = useState<string>("");

  const images =
    product.images.length > 0
      ? product.images
      : [{ id: "default", url: "/images/prod-trench.jpg", alt: product.name, sortOrder: 0 }];
  const activeImage = images[selectedIdx] ?? images[0];
  const wishlisted = isInWishlist(product.id);
  const isSoldOut = liveStock <= 0;
  const liveProduct = { ...product, stockQuantity: liveStock };

  const measurementEntries = [
    { label: "Chest", value: product.measurements.chest },
    { label: "Waist", value: product.measurements.waist },
    { label: "Hip", value: product.measurements.hip },
    { label: "Shoulder", value: product.measurements.shoulder },
    { label: "Sleeve", value: product.measurements.sleeve },
    { label: "Length", value: product.measurements.length },
    { label: "Inseam", value: product.measurements.inseam },
  ].filter((m) => Boolean(m.value));

  return (
    <>
      <LiveStockObserver
        productId={product.id}
        initialStock={product.stockQuantity}
        sealedQuery={sealedStockQuery}
        onStockChange={setLiveStock}
        onStatusChange={setLiveStatus}
      />
      <div className="mx-auto max-w-[1440px] px-4 py-8 sm:px-8 lg:px-12 lg:py-14">
        {/* Breadcrumb */}
        <nav
          aria-label="Breadcrumb"
          className="mb-8 flex flex-wrap items-center gap-2 text-[11px] tracking-[0.14em] uppercase text-charcoal/55"
        >
          <Link href="/" className="hover:text-charcoal">
            Home
          </Link>
          <span>/</span>
          <Link
            href={
              product.gender === "MEN"
                ? "/men"
                : product.gender === "WOMEN"
                  ? "/women"
                  : "/new-arrivals"
            }
            className="hover:text-charcoal"
          >
            {GENDER_LABELS[product.gender]}
          </Link>
          <span>/</span>
          <span className="text-charcoal truncate max-w-[260px]">
            {product.name}
          </span>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-12 lg:gap-16">
          {/* Left: Multi-Image Gallery */}
          <div className="lg:col-span-7">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-12">
              {images.length > 1 && (
                <div className="order-2 flex gap-3 sm:order-1 sm:col-span-2 sm:flex-col">
                  {images.map((img, i) => (
                    <button
                      key={img.id}
                      type="button"
                      onClick={() => setSelectedIdx(i)}
                      className={cn(
                        "relative aspect-[3/4] w-20 sm:w-full overflow-hidden border transition-all",
                        selectedIdx === i
                          ? "border-charcoal opacity-100"
                          : "border-charcoal/15 opacity-60 hover:opacity-100"
                      )}
                    >
                      <Image
                        src={img.url}
                        alt={img.alt || product.name}
                        fill
                        sizes="120px"
                        className="object-cover"
                      />
                    </button>
                  ))}
                </div>
              )}

              <div
                className={cn(
                  "order-1 sm:order-2",
                  images.length > 1 ? "sm:col-span-10" : "sm:col-span-12"
                )}
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden border border-charcoal/12 bg-sand/30">
                  <Image
                    src={activeImage.url}
                    alt={activeImage.alt || product.name}
                    fill
                    priority
                    sizes="(max-width: 1024px) 100vw, 55vw"
                    className={cn(
                      "object-cover",
                      isSoldOut && "grayscale-[30%] opacity-75"
                    )}
                  />
                  {isSoldOut && (
                    <div className="absolute left-4 top-4 bg-charcoal px-3 py-1.5 text-[11px] font-medium tracking-[0.18em] uppercase text-ivory">
                      Sold Out — Archive Claimed
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Right: Editorial Details */}
          <div className="lg:col-span-5 space-y-7">
            <div>
              <div className="flex items-center justify-between gap-2">
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
                  {product.brand}
                  {product.era ? ` · ${product.era}` : ""}
                </p>
                <span className="text-[10px] tracking-[0.14em] uppercase text-charcoal/45">
                  SKU: {product.sku}
                </span>
              </div>

              <h1 className="mt-2 font-editorial text-3xl sm:text-4xl lg:text-[42px] leading-[1.08] text-charcoal">
                {product.name}
              </h1>

              <div className="mt-4 flex flex-wrap items-baseline gap-3 tabular-nums">
                <span className="text-2xl font-medium text-charcoal">
                  {formatINR(product.price)}
                </span>
                {product.originalPriceVerified && product.originalPrice && (
                  <>
                    <span className="text-sm text-charcoal/45 line-through">
                      Est. Retail {formatINR(product.originalPrice)}
                    </span>
                    <span className="bg-sand px-2 py-0.5 text-[10px] font-medium tracking-[0.14em] uppercase text-charcoal">
                      Verified Original Price
                    </span>
                  </>
                )}
              </div>
              <p className="mt-1 text-[11px] text-charcoal/55">
                Inclusive of all taxes. Complimentary shipping above ₹2,999.
              </p>
            </div>

            {/* Key Specs */}
            <div className="grid grid-cols-2 gap-4 border-y border-charcoal/12 py-5 text-xs">
              <div>
                <span className="block text-[10px] tracking-[0.16em] uppercase text-charcoal/55">
                  Size
                </span>
                <span className="mt-1 block font-medium text-charcoal">
                  {product.size}
                </span>
              </div>
              <div>
                <span className="block text-[10px] tracking-[0.16em] uppercase text-charcoal/55">
                  Availability {liveStatus === "live" ? "· Live" : ""}
                </span>
                <span className="mt-1 block font-medium text-olive">
                  {isSoldOut
                    ? "Sold Out"
                    : liveStock === 1
                      ? "1 of 1 Available"
                      : `${liveStock} Available`}
                </span>
              </div>
              <div>
                <span className="block text-[10px] tracking-[0.16em] uppercase text-charcoal/55">
                  Condition Grade
                </span>
                <span className="mt-1 block font-medium text-charcoal">
                  {CONDITION_LABELS[product.condition]}
                </span>
              </div>
              <div>
                <span className="block text-[10px] tracking-[0.16em] uppercase text-charcoal/55">
                  Material
                </span>
                <span className="mt-1 block text-charcoal/85">
                  {product.material}
                </span>
              </div>
            </div>

            {/* Actions */}
            <div className="flex gap-3">
              <button
                type="button"
                disabled={isSoldOut}
                onClick={() => addToCart(liveProduct, 1)}
                className="flex flex-1 items-center justify-center gap-2.5 bg-charcoal px-6 py-4 text-xs font-medium tracking-[0.18em] uppercase text-ivory transition-colors hover:bg-charcoal/90 disabled:cursor-not-allowed disabled:bg-charcoal/35"
              >
                <ShoppingBag className="h-4 w-4" />
                {isSoldOut ? "Sold Out" : "Add to Bag"}
              </button>
              <button
                type="button"
                onClick={() => toggleWishlist(product.id, product.name)}
                aria-label={wishlisted ? "Remove from wishlist" : "Save to wishlist"}
                className="flex items-center justify-center border border-charcoal/25 px-5 text-charcoal hover:border-charcoal transition-colors"
              >
                <Heart
                  className={cn(
                    "h-4 w-4",
                    wishlisted && "fill-olive text-olive"
                  )}
                />
              </button>
            </div>

            {/* Description */}
            <div className="space-y-3">
              <h2 className="text-[11px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
                Curator’s Note
              </h2>
              <p className="text-sm leading-relaxed text-charcoal/80">
                {product.description}
              </p>
            </div>

            {/* Condition Transparency */}
            <div className="border border-charcoal/12 bg-white p-5 space-y-2.5">
              <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal">
                <ShieldCheck className="h-4 w-4 text-olive" />
                Condition Report — {CONDITION_LABELS[product.condition]}
              </div>
              <p className="text-xs leading-relaxed text-charcoal/70">
                {CONDITION_DESCRIPTIONS[product.condition]}
              </p>
              {product.conditionNotes && (
                <p className="flex items-start gap-2 pt-1 text-xs text-charcoal/85">
                  <Check className="mt-0.5 h-3.5 w-3.5 shrink-0 text-olive" />
                  <span>{product.conditionNotes}</span>
                </p>
              )}
            </div>

            {/* Garment Measurements */}
            <div className="border border-charcoal/12 bg-sand/25 p-5 space-y-3">
              <div className="flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal">
                <Ruler className="h-4 w-4 text-olive" />
                Actual Garment Measurements (Flat-Lay)
              </div>
              {measurementEntries.length > 0 && (
                <dl className="grid grid-cols-2 gap-x-6 gap-y-2.5 text-xs pt-1">
                  {measurementEntries.map((m) => (
                    <div
                      key={m.label}
                      className="flex justify-between border-b border-charcoal/10 pb-1.5"
                    >
                      <dt className="text-charcoal/60">{m.label}</dt>
                      <dd className="font-medium tabular-nums text-charcoal">
                        {m.value}
                      </dd>
                    </div>
                  ))}
                </dl>
              )}
              {product.measurements.notes && (
                <p className="text-[11px] leading-relaxed text-charcoal/65 pt-1">
                  {product.measurements.notes}
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Sticky Add-to-Cart Area */}
      <div className="fixed inset-x-0 bottom-0 z-30 border-t border-charcoal/15 bg-ivory/95 px-4 py-3 backdrop-blur-md lg:hidden">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="truncate text-xs font-medium text-charcoal">
              {product.name}
            </p>
            <p className="text-xs tabular-nums text-charcoal/70">
              {formatINR(product.price)} · Size {product.size}
            </p>
          </div>
          <button
            type="button"
            disabled={isSoldOut}
            onClick={() => addToCart(liveProduct, 1)}
            className="shrink-0 bg-charcoal px-5 py-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-ivory disabled:bg-charcoal/40"
          >
            {isSoldOut ? "Sold Out" : "Add to Bag"}
          </button>
        </div>
      </div>
    </>
  );
}

