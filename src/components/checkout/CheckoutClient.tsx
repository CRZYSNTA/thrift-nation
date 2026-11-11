"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import Script from "next/script";
import { useRouter } from "next/navigation";
import { Lock, Tag } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { formatINR } from "@/lib/utils";
import type { SiteSettingsData } from "@/types/catalog";

interface SavedAddress {
  id: string;
  fullName: string;
  phone: string;
  line1: string;
  line2: string | null;
  city: string;
  state: string;
  pincode: string;
  isDefault: boolean;
}

declare global {
  interface Window {
    Razorpay?: new (options: Record<string, unknown>) => {
      open: () => void;
    };
  }
}

export function CheckoutClient({
  settings,
  savedAddresses,
  userEmail = "",
  userName = "",
}: {
  settings: SiteSettingsData;
  savedAddresses: SavedAddress[];
  userEmail?: string;
  userName?: string;
}) {
  const router = useRouter();
  const { cart, cartSubtotal, clearCart } = useStore();

  const defaultAddr =
    savedAddresses.find((a) => a.isDefault) ?? savedAddresses[0];

  const [customerName, setCustomerName] = useState(
    defaultAddr?.fullName || userName || ""
  );
  const [customerPhone, setCustomerPhone] = useState(defaultAddr?.phone || "");
  const [customerEmail, setCustomerEmail] = useState(userEmail || "");
  const [shippingAddress, setShippingAddress] = useState(
    defaultAddr
      ? [defaultAddr.line1, defaultAddr.line2].filter(Boolean).join(", ")
      : ""
  );
  const [shippingCity, setShippingCity] = useState(defaultAddr?.city || "");
  const [shippingState, setShippingState] = useState(defaultAddr?.state || "");
  const [shippingPincode, setShippingPincode] = useState(
    defaultAddr?.pincode || ""
  );

  const [paymentMethod, setPaymentMethod] = useState<"RAZORPAY" | "COD">(
    settings.razorpayEnabled ? "RAZORPAY" : "COD"
  );

  const [couponInput, setCouponInput] = useState("");
  const [appliedCoupon, setAppliedCoupon] = useState<{
    code: string;
    discount: number;
  } | null>(null);
  const [couponError, setCouponError] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  function applySavedAddress(addr: SavedAddress) {
    setCustomerName(addr.fullName);
    setCustomerPhone(addr.phone);
    setShippingAddress([addr.line1, addr.line2].filter(Boolean).join(", "));
    setShippingCity(addr.city);
    setShippingState(addr.state);
    setShippingPincode(addr.pincode);
  }

  async function handleApplyCoupon() {
    setCouponError("");
    if (!couponInput.trim()) return;
    try {
      const res = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          code: couponInput.trim(),
          subtotal: cartSubtotal,
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || "Invalid coupon code.");
        setAppliedCoupon(null);
        return;
      }
      setAppliedCoupon({ code: data.code, discount: data.discount });
    } catch {
      setCouponError("Unable to verify coupon right now.");
    }
  }

  const discount = appliedCoupon?.discount ?? 0;
  const discountedSubtotal = Math.max(0, cartSubtotal - discount);
  const baseShipping =
    discountedSubtotal >= settings.freeShippingThreshold
      ? 0
      : settings.standardShippingFee;
  const codFee = paymentMethod === "COD" ? settings.codFee : 0;
  const total = discountedSubtotal + baseShipping + codFee;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (cart.length === 0) return;

    setError("");
    setSubmitting(true);

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          customerName,
          customerPhone,
          customerEmail,
          shippingAddress,
          shippingCity,
          shippingState,
          shippingPincode,
          paymentMethod,
          couponCode: appliedCoupon?.code ?? null,
          items: cart.map((i) => ({
            productId: i.productId,
            quantity: i.quantity,
          })),
        }),
      });

      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Unable to complete checkout.");
        setSubmitting(false);
        return;
      }

      if (data.paymentMethod === "COD") {
        clearCart();
        router.push(`/order-confirmation/${data.orderNumber}`);
        return;
      }

      // Razorpay Modal
      if (!window.Razorpay) {
        await fetch("/api/payments/razorpay/cancel", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ orderId: data.orderId }),
        });
        setError("Payment gateway failed to load. Please refresh and try again.");
        setSubmitting(false);
        return;
      }

      const rzp = new window.Razorpay({
        key: data.keyId,
        amount: data.amount,
        currency: data.currency,
        name: "THRIFT NATION",
        description: `Order ${data.orderNumber}`,
        order_id: data.razorpayOrderId,
        prefill: {
          name: customerName,
          email: customerEmail,
          contact: customerPhone,
        },
        theme: { color: "#191919" },
        modal: {
          ondismiss: async () => {
            await fetch("/api/payments/razorpay/cancel", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({ orderId: data.orderId }),
            });
            setError("Payment was cancelled. Your reserved piece has been released.");
            setSubmitting(false);
          },
        },
        handler: async (response: {
          razorpay_order_id: string;
          razorpay_payment_id: string;
          razorpay_signature: string;
        }) => {
          const verifyRes = await fetch("/api/payments/razorpay/verify", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              orderId: data.orderId,
              ...response,
            }),
          });
          const verifyData = await verifyRes.json();
          if (!verifyRes.ok) {
            setError(
              verifyData.error ||
                "Payment verification failed. Contact concierge if debited."
            );
            setSubmitting(false);
            return;
          }
          clearCart();
          router.push(`/order-confirmation/${verifyData.orderNumber}`);
        },
      });

      rzp.open();
    } catch {
      setError("Network error while creating your order.");
      setSubmitting(false);
    }
  }

  if (cart.length === 0) {
    return (
      <div className="mx-auto max-w-2xl px-4 py-24 text-center">
        <h1 className="font-editorial text-4xl text-charcoal">
          Your Bag is Empty
        </h1>
        <p className="mt-3 text-sm text-charcoal/70">
          Add curated pieces from our archive before proceeding to checkout.
        </p>
        <Link
          href="/new-arrivals"
          className="mt-8 inline-block bg-charcoal px-8 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-ivory"
        >
          Explore New Arrivals
        </Link>
      </div>
    );
  }

  return (
    <>
      <Script
        src="https://checkout.razorpay.com/v1/checkout.js"
        strategy="lazyOnload"
      />
      <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
        <div className="border-b border-charcoal/12 pb-6">
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
            Secure Archive Checkout
          </p>
          <h1 className="mt-2 font-editorial text-4xl text-charcoal">
            Delivery &amp; Payment
          </h1>
        </div>

        <form
          onSubmit={handleSubmit}
          className="mt-10 grid grid-cols-1 gap-12 lg:grid-cols-12"
        >
          {/* Left: Shipping & Payment */}
          <div className="space-y-10 lg:col-span-7">
            {savedAddresses.length > 0 && (
              <div className="space-y-3">
                <p className="text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal/65">
                  Saved Addresses
                </p>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {savedAddresses.map((addr) => (
                    <button
                      key={addr.id}
                      type="button"
                      onClick={() => applySavedAddress(addr)}
                      className="border border-charcoal/20 bg-white p-4 text-left text-xs hover:border-charcoal transition-colors"
                    >
                      <p className="font-medium text-charcoal">{addr.fullName}</p>
                      <p className="mt-1 text-charcoal/70">{addr.line1}</p>
                      <p className="text-charcoal/70">
                        {addr.city}, {addr.state} — {addr.pincode}
                      </p>
                    </button>
                  ))}
                </div>
              </div>
            )}

            <div className="space-y-5">
              <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-charcoal">
                1. Contact &amp; Delivery Details
              </h2>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
                    Full Name *
                  </label>
                  <input
                    required
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Arjun Mehta"
                    className="w-full border border-charcoal/25 bg-white px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
                    Mobile Number (India) *
                  </label>
                  <input
                    required
                    type="tel"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="9820012345"
                    className="w-full border border-charcoal/25 bg-white px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
                  Email Address *
                </label>
                <input
                  required
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full border border-charcoal/25 bg-white px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
                />
              </div>

              <div>
                <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
                  Delivery Address *
                </label>
                <textarea
                  required
                  rows={2}
                  value={shippingAddress}
                  onChange={(e) => setShippingAddress(e.target.value)}
                  placeholder="Apartment, Street, Landmark"
                  className="w-full border border-charcoal/25 bg-white px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
                    City *
                  </label>
                  <input
                    required
                    value={shippingCity}
                    onChange={(e) => setShippingCity(e.target.value)}
                    placeholder="Mumbai"
                    className="w-full border border-charcoal/25 bg-white px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
                    State *
                  </label>
                  <input
                    required
                    value={shippingState}
                    onChange={(e) => setShippingState(e.target.value)}
                    placeholder="Maharashtra"
                    className="w-full border border-charcoal/25 bg-white px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-[11px] uppercase tracking-[0.14em] text-charcoal/70 mb-1.5">
                    PIN Code *
                  </label>
                  <input
                    required
                    maxLength={6}
                    value={shippingPincode}
                    onChange={(e) => setShippingPincode(e.target.value)}
                    placeholder="400001"
                    className="w-full border border-charcoal/25 bg-white px-4 py-3 text-sm focus:border-charcoal focus:outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Payment Method */}
            <div className="space-y-4 border-t border-charcoal/12 pt-8">
              <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-charcoal">
                2. Payment Method
              </h2>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                {settings.razorpayEnabled && (
                  <label
                    className={`cursor-pointer border p-4 transition-colors ${
                      paymentMethod === "RAZORPAY"
                        ? "border-charcoal bg-white"
                        : "border-charcoal/20 bg-white/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium tracking-[0.14em] uppercase text-charcoal">
                        Razorpay Online
                      </span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "RAZORPAY"}
                        onChange={() => setPaymentMethod("RAZORPAY")}
                        className="accent-charcoal"
                      />
                    </div>
                    <p className="mt-2 text-xs text-charcoal/65">
                      UPI, Credit / Debit Cards, Netbanking. Verified instantly.
                    </p>
                  </label>
                )}

                {settings.codEnabled && (
                  <label
                    className={`cursor-pointer border p-4 transition-colors ${
                      paymentMethod === "COD"
                        ? "border-charcoal bg-white"
                        : "border-charcoal/20 bg-white/50"
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-medium tracking-[0.14em] uppercase text-charcoal">
                        Cash on Delivery
                      </span>
                      <input
                        type="radio"
                        name="paymentMethod"
                        checked={paymentMethod === "COD"}
                        onChange={() => setPaymentMethod("COD")}
                        className="accent-charcoal"
                      />
                    </div>
                    <p className="mt-2 text-xs text-charcoal/65">
                      Pay upon delivery (+{formatINR(settings.codFee)} handling
                      fee).
                    </p>
                  </label>
                )}
              </div>
            </div>
          </div>

          {/* Right: Order Summary */}
          <div className="lg:col-span-5">
            <div className="border border-charcoal/12 bg-white p-6 sm:p-8 space-y-6">
              <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-charcoal">
                Order Summary
              </h2>

              <ul className="divide-y divide-charcoal/10">
                {cart.map((item) => (
                  <li key={item.productId} className="flex gap-4 py-4">
                    <div className="relative h-20 w-16 shrink-0 border border-charcoal/10 bg-sand/30">
                      <Image
                        src={item.image}
                        alt={item.name}
                        fill
                        sizes="64px"
                        className="object-cover"
                      />
                    </div>
                    <div className="flex flex-1 justify-between gap-2 text-xs">
                      <div>
                        <p className="font-medium text-charcoal">{item.name}</p>
                        <p className="mt-1 text-charcoal/60">
                          Size {item.size} · Qty {item.quantity}
                        </p>
                      </div>
                      <p className="font-medium tabular-nums text-charcoal">
                        {formatINR(item.price * item.quantity)}
                      </p>
                    </div>
                  </li>
                ))}
              </ul>

              {/* Coupon */}
              <div className="border-t border-charcoal/10 pt-5">
                <div className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="pointer-events-none absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-charcoal/45" />
                    <input
                      type="text"
                      value={couponInput}
                      onChange={(e) => setCouponInput(e.target.value)}
                      placeholder="Coupon code (e.g. NATION10)"
                      className="w-full border border-charcoal/25 bg-ivory/40 py-2.5 pl-9 pr-3 text-xs uppercase tracking-[0.1em] focus:border-charcoal focus:outline-none"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleApplyCoupon}
                    className="border border-charcoal px-4 text-[11px] font-medium tracking-[0.14em] uppercase text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
                  >
                    Apply
                  </button>
                </div>
                {couponError && (
                  <p className="mt-2 text-xs text-red-700">{couponError}</p>
                )}
                {appliedCoupon && (
                  <p className="mt-2 text-xs text-olive">
                    Code {appliedCoupon.code} applied (–
                    {formatINR(appliedCoupon.discount)})
                  </p>
                )}
              </div>

              {/* Totals */}
              <dl className="space-y-2.5 border-t border-charcoal/10 pt-5 text-xs">
                <div className="flex justify-between">
                  <dt className="text-charcoal/70">Subtotal</dt>
                  <dd className="tabular-nums text-charcoal">
                    {formatINR(cartSubtotal)}
                  </dd>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-olive">
                    <dt>Discount ({appliedCoupon?.code})</dt>
                    <dd className="tabular-nums">–{formatINR(discount)}</dd>
                  </div>
                )}
                <div className="flex justify-between">
                  <dt className="text-charcoal/70">Shipping</dt>
                  <dd className="tabular-nums text-charcoal">
                    {baseShipping === 0
                      ? "Complimentary"
                      : formatINR(baseShipping)}
                  </dd>
                </div>
                {codFee > 0 && (
                  <div className="flex justify-between">
                    <dt className="text-charcoal/70">COD Handling</dt>
                    <dd className="tabular-nums text-charcoal">
                      {formatINR(codFee)}
                    </dd>
                  </div>
                )}
                <div className="flex justify-between border-t border-charcoal/12 pt-3 text-base font-medium text-charcoal">
                  <dt>Total</dt>
                  <dd className="tabular-nums">{formatINR(total)}</dd>
                </div>
              </dl>

              {error && (
                <div
                  role="alert"
                  className="border border-red-300 bg-red-50 px-4 py-3 text-xs text-red-800"
                >
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="flex w-full items-center justify-center gap-2 bg-charcoal py-4 text-xs font-medium tracking-[0.18em] uppercase text-ivory transition-colors hover:bg-charcoal/90 disabled:opacity-50"
              >
                <Lock className="h-3.5 w-3.5" />
                {submitting
                  ? "Securing Archive Piece..."
                  : paymentMethod === "RAZORPAY"
                    ? `Pay ${formatINR(total)}`
                    : `Place COD Order (${formatINR(total)})`}
              </button>
            </div>
          </div>
        </form>
      </div>
    </>
  );
}
