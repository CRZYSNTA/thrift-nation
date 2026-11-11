"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Heart, ShoppingBag, X, ArrowRight } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { CONDITION_LABELS, formatINR, cn } from "@/lib/utils";

export function QuickViewModal() {
  const {
    quickViewProduct,
    closeQuickView,
    addToCart,
    isInWishlist,
    toggleWishlist,
  } = useStore();
  const [imageSelection, setImageSelection] = useState<{
    productId: string;
    idx: number;
  }>({ productId: "", idx: 0 });
  const activeImageIdx =
    imageSelection.productId === quickViewProduct?.id ? imageSelection.idx : 0;

  useEffect(() => {
    if (!quickViewProduct) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeQuickView();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [quickViewProduct, closeQuickView]);

  if (!quickViewProduct) return null;

  const images =
    quickViewProduct.images.length > 0
      ? quickViewProduct.images
      : [{ id: "fallback", url: "/images/prod-trench.jpg", alt: quickViewProduct.name, sortOrder: 0 }];
  const currentImg = images[activeImageIdx] ?? images[0];
  const isSoldOut = quickViewProduct.stockQuantity <= 0;
  const wishlisted = isInWishlist(quickViewProduct.id);

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-charcoal/50 p-4 backdrop-blur-xs"
        onClick={closeQuickView}
      >
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 16 }}
          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
          onClick={(e) => e.stopPropagation()}
          role="dialog"
          aria-modal="true"
          aria-label={quickViewProduct.name}
          className="relative grid w-full max-w-4xl grid-cols-1 overflow-hidden border border-charcoal/15 bg-ivory md:grid-cols-2 max-h-[90vh] overflow-y-auto"
        >
          <button
            type="button"
            onClick={closeQuickView}
            aria-label="Close quick view"
            className="absolute right-4 top-4 z-10 flex h-9 w-9 items-center justify-center border border-charcoal/15 bg-ivory/90 text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
          >
            <X className="h-4 w-4" />
          </button>

          {/* Left: Gallery */}
          <div className="bg-sand/30 p-4 sm:p-6">
            <div className="relative aspect-[3/4] w-full overflow-hidden border border-charcoal/10 bg-ivory">
              <Image
                src={currentImg.url}
                alt={currentImg.alt || quickViewProduct.name}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 450px"
              />
            </div>
            {images.length > 1 && (
              <div className="mt-3 flex gap-2">
                {images.map((img, i) => (
                  <button
                    key={img.id}
                    type="button"
                    onClick={() =>
                      setImageSelection({
                        productId: quickViewProduct.id,
                        idx: i,
                      })
                    }
                    className={cn(
                      "relative h-16 w-12 overflow-hidden border transition-opacity",
                      i === activeImageIdx
                        ? "border-charcoal opacity-100"
                        : "border-charcoal/15 opacity-60 hover:opacity-100"
                    )}
                  >
                    <Image
                      src={img.url}
                      alt={img.alt || quickViewProduct.name}
                      fill
                      className="object-cover"
                      sizes="48px"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Right: Info */}
          <div className="flex flex-col justify-between p-6 sm:p-8">
            <div className="space-y-5">
              <div>
                <p className="text-[11px] font-medium tracking-[0.18em] uppercase text-olive">
                  {quickViewProduct.brand}
                  {quickViewProduct.era ? ` · ${quickViewProduct.era}` : ""}
                </p>
                <h2 className="mt-2 font-editorial text-2xl sm:text-3xl leading-tight text-charcoal">
                  {quickViewProduct.name}
                </h2>
              </div>

              <div className="flex items-baseline gap-3 tabular-nums">
                <span className="text-xl font-medium text-charcoal">
                  {formatINR(quickViewProduct.price)}
                </span>
                {quickViewProduct.originalPriceVerified &&
                  quickViewProduct.originalPrice && (
                    <span className="text-sm text-charcoal/45 line-through">
                      Est. Retail {formatINR(quickViewProduct.originalPrice)}
                    </span>
                  )}
              </div>

              <div className="grid grid-cols-2 gap-3 border-y border-charcoal/12 py-4 text-xs">
                <div>
                  <span className="block text-[10px] tracking-[0.15em] uppercase text-charcoal/55">
                    Condition
                  </span>
                  <span className="mt-1 block font-medium text-charcoal">
                    {CONDITION_LABELS[quickViewProduct.condition]}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] tracking-[0.15em] uppercase text-charcoal/55">
                    Size
                  </span>
                  <span className="mt-1 block font-medium text-charcoal">
                    {quickViewProduct.size}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] tracking-[0.15em] uppercase text-charcoal/55">
                    Material
                  </span>
                  <span className="mt-1 block text-charcoal/85">
                    {quickViewProduct.material}
                  </span>
                </div>
                <div>
                  <span className="block text-[10px] tracking-[0.15em] uppercase text-charcoal/55">
                    Availability
                  </span>
                  <span className="mt-1 block font-medium text-olive">
                    {isSoldOut
                      ? "Sold Out"
                      : quickViewProduct.stockQuantity === 1
                        ? "Unique Piece (1 available)"
                        : `${quickViewProduct.stockQuantity} in archive`}
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-8 space-y-3">
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isSoldOut}
                  onClick={() => {
                    addToCart(quickViewProduct, 1);
                    closeQuickView();
                  }}
                  className="flex flex-1 items-center justify-center gap-2 bg-charcoal px-6 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-ivory transition-colors hover:bg-charcoal/88 disabled:cursor-not-allowed disabled:bg-charcoal/40"
                >
                  <ShoppingBag className="h-4 w-4" />
                  {isSoldOut ? "Sold Out" : "Add to Bag"}
                </button>
                <button
                  type="button"
                  onClick={() =>
                    toggleWishlist(quickViewProduct.id, quickViewProduct.name)
                  }
                  aria-label="Toggle wishlist"
                  className="flex items-center justify-center border border-charcoal/25 px-4 text-charcoal hover:border-charcoal transition-colors"
                >
                  <Heart
                    className={cn(
                      "h-4 w-4",
                      wishlisted && "fill-olive text-olive"
                    )}
                  />
                </button>
              </div>

              <Link
                href={`/product/${quickViewProduct.slug}`}
                onClick={closeQuickView}
                className="flex items-center justify-center gap-2 border border-charcoal/20 py-3 text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal hover:border-charcoal transition-colors"
              >
                View Full Measurements &amp; Details
                <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
