"use client";

import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Minus, Plus, ShoppingBag, Trash2, X } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { CONDITION_LABELS, formatINR } from "@/lib/utils";
import type { ConditionGrade } from "@prisma/client";

interface CartDrawerProps {
  freeShippingThreshold: number;
}

export function CartDrawer({ freeShippingThreshold }: CartDrawerProps) {
  const {
    cart,
    cartSubtotal,
    isCartOpen,
    closeCart,
    removeFromCart,
    updateCartQuantity,
  } = useStore();

  const remainingForFreeShipping = Math.max(
    0,
    freeShippingThreshold - cartSubtotal
  );
  const progressPct = Math.min(
    100,
    Math.round((cartSubtotal / Math.max(1, freeShippingThreshold)) * 100)
  );

  return (
    <AnimatePresence>
      {isCartOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex justify-end bg-charcoal/45 backdrop-blur-xs"
          onClick={closeCart}
        >
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ duration: 0.3, ease: [0.22, 1, 0.36, 1] }}
            onClick={(e) => e.stopPropagation()}
            aria-label="Shopping bag"
            className="flex h-full w-full max-w-md flex-col bg-ivory border-l border-charcoal/12"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-charcoal/10 px-6 py-5">
              <div className="flex items-center gap-2.5">
                <ShoppingBag className="h-4 w-4 stroke-[1.5]" />
                <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-charcoal">
                  Your Bag ({cart.reduce((a, b) => a + b.quantity, 0)})
                </h2>
              </div>
              <button
                type="button"
                onClick={closeCart}
                aria-label="Close bag"
                className="p-1 text-charcoal/70 hover:text-charcoal"
              >
                <X className="h-5 w-5 stroke-[1.5]" />
              </button>
            </div>

            {/* Free shipping indicator */}
            <div className="border-b border-charcoal/10 bg-sand/35 px-6 py-3">
              <p className="text-[11px] tracking-[0.06em] text-charcoal/80">
                {remainingForFreeShipping === 0
                  ? "Complimentary express shipping unlocked."
                  : `Add ${formatINR(remainingForFreeShipping)} more for complimentary express shipping.`}
              </p>
              <div className="mt-2 h-1 w-full bg-charcoal/10">
                <div
                  className="h-full bg-olive transition-all duration-300"
                  style={{ width: `${progressPct}%` }}
                />
              </div>
            </div>

            {/* Items */}
            <div className="flex-1 overflow-y-auto px-6 py-5">
              {cart.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center text-center py-12">
                  <p className="font-editorial text-3xl text-charcoal">
                    Your bag is empty
                  </p>
                  <p className="mt-2 max-w-xs text-xs leading-relaxed text-charcoal/65">
                    Each garment in our archive is individually sourced and
                    typically one-of-a-kind.
                  </p>
                  <Link
                    href="/new-arrivals"
                    onClick={closeCart}
                    className="mt-6 border border-charcoal bg-charcoal px-6 py-3 text-[11px] font-medium tracking-[0.18em] uppercase text-ivory hover:bg-charcoal/90 transition-colors"
                  >
                    Explore New Arrivals
                  </Link>
                </div>
              ) : (
                <ul className="divide-y divide-charcoal/10">
                  {cart.map((item) => {
                    const condLabel =
                      CONDITION_LABELS[item.condition as ConditionGrade] ??
                      item.condition;
                    return (
                      <li key={item.productId} className="flex gap-4 py-5">
                        <Link
                          href={`/product/${item.slug}`}
                          onClick={closeCart}
                          className="relative h-28 w-21 shrink-0 overflow-hidden border border-charcoal/10 bg-sand/30"
                        >
                          <Image
                            src={item.image}
                            alt={item.name}
                            fill
                            className="object-cover"
                            sizes="84px"
                          />
                        </Link>

                        <div className="flex flex-1 flex-col justify-between">
                          <div>
                            <div className="flex items-start justify-between gap-2">
                              <Link
                                href={`/product/${item.slug}`}
                                onClick={closeCart}
                                className="text-sm font-normal leading-snug text-charcoal hover:text-olive"
                              >
                                {item.name}
                              </Link>
                              <button
                                type="button"
                                onClick={() => removeFromCart(item.productId)}
                                aria-label={`Remove ${item.name}`}
                                className="p-1 text-charcoal/45 hover:text-charcoal"
                              >
                                <Trash2 className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <p className="mt-1 text-[11px] tracking-[0.1em] uppercase text-charcoal/55">
                              Size {item.size} · {condLabel}
                            </p>
                          </div>

                          <div className="mt-3 flex items-center justify-between">
                            <div className="inline-flex items-center border border-charcoal/20">
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productId,
                                    item.quantity - 1
                                  )
                                }
                                aria-label="Decrease quantity"
                                className="p-1.5 text-charcoal/70 hover:text-charcoal"
                              >
                                <Minus className="h-3 w-3" />
                              </button>
                              <span className="px-3 text-xs tabular-nums">
                                {item.quantity}
                              </span>
                              <button
                                type="button"
                                onClick={() =>
                                  updateCartQuantity(
                                    item.productId,
                                    item.quantity + 1
                                  )
                                }
                                disabled={item.quantity >= item.maxStock}
                                aria-label="Increase quantity"
                                className="p-1.5 text-charcoal/70 hover:text-charcoal disabled:opacity-30"
                              >
                                <Plus className="h-3 w-3" />
                              </button>
                            </div>

                            <span className="text-sm font-medium tabular-nums text-charcoal">
                              {formatINR(item.price * item.quantity)}
                            </span>
                          </div>
                        </div>
                      </li>
                    );
                  })}
                </ul>
              )}
            </div>

            {/* Footer */}
            {cart.length > 0 && (
              <div className="border-t border-charcoal/12 bg-white px-6 py-5 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-xs tracking-[0.14em] uppercase text-charcoal/70">
                    Subtotal
                  </span>
                  <span className="text-base font-medium tabular-nums text-charcoal">
                    {formatINR(cartSubtotal)}
                  </span>
                </div>
                <p className="text-[11px] text-charcoal/55">
                  Shipping, coupon codes, and taxes calculated at checkout.
                </p>
                <div className="grid grid-cols-1 gap-2.5">
                  <Link
                    href="/checkout"
                    onClick={closeCart}
                    className="flex w-full items-center justify-center bg-charcoal py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-ivory hover:bg-charcoal/90 transition-colors"
                  >
                    Proceed to Checkout
                  </Link>
                  <button
                    type="button"
                    onClick={closeCart}
                    className="w-full border border-charcoal/20 py-3 text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal hover:border-charcoal transition-colors"
                  >
                    Continue Browsing
                  </button>
                </div>
              </div>
            )}
          </motion.aside>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

