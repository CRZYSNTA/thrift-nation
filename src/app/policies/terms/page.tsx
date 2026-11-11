import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Terms & Conditions",
  description: "Terms of purchase, authenticity, and use of THRIFT NATION.",
  alternates: { canonical: "/policies/terms" },
};

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:py-24 space-y-6">
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
        Legal
      </p>
      <h1 className="font-editorial text-4xl sm:text-5xl text-charcoal">
        Terms and Conditions
      </h1>
      <div className="space-y-4 text-sm leading-relaxed text-charcoal/80">
        <p>
          All garments sold on THRIFT NATION are pre-owned vintage or archive
          contemporary pieces unless explicitly marked otherwise. Subtle signs
          of age consistent with each item&apos;s published condition grade are
          part of their provenance.
        </p>
        <p>
          All prices are listed in Indian Rupees (₹). Inventory is reserved
          atomically at checkout; an item in your bag is not guaranteed until an
          order is confirmed.
        </p>
      </div>
    </div>
  );
}

