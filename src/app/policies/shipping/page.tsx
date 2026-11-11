import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/catalog";
import { formatINR } from "@/lib/utils";

export const metadata: Metadata = {
  title: "Shipping Policy",
  description: "Nationwide shipping timelines, packaging, and delivery charges at THRIFT NATION.",
  alternates: { canonical: "/policies/shipping" },
};

export default async function ShippingPolicyPage() {
  const settings = await getSiteSettings();
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:py-24 space-y-6">
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
        Client Care
      </p>
      <h1 className="font-editorial text-4xl sm:text-5xl text-charcoal">
        Shipping Policy
      </h1>
      <div className="space-y-4 text-sm leading-relaxed text-charcoal/80">
        <p>
          All orders are dispatched from our Mumbai studio within 24–48 business
          hours inside plastic-free, breathable cotton dust bags and recycled
          rigid cartons.
        </p>
        <p>
          Complimentary express shipping is extended on all orders above{" "}
          {formatINR(settings.freeShippingThreshold)}. Orders below this
          threshold carry a flat shipping charge of{" "}
          {formatINR(settings.standardShippingFee)}.
        </p>
        <p>
          Metro deliveries typically arrive within 2–4 business days; rest of
          India deliveries arrive within 4–7 business days via insured courier
          partners.
        </p>
      </div>
    </div>
  );
}

