import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Return Policy",
  description: "Return and archive credit policy for curated pre-loved garments.",
  alternates: { canonical: "/policies/returns" },
};

export default function ReturnPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:py-24 space-y-6">
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
        Client Care
      </p>
      <h1 className="font-editorial text-4xl sm:text-5xl text-charcoal">
        Return Policy
      </h1>
      <div className="space-y-4 text-sm leading-relaxed text-charcoal/80">
        <p>
          Because every garment at THRIFT NATION is individually sourced and
          often one-of-a-kind, we provide detailed flat-lay measurements and
          honest condition reports on every product page.
        </p>
        <p>
          We accept returns within 7 days of delivery for garments that remain
          unworn with the original THRIFT NATION archival tag intact. Reverse
          pickup is arranged seamlessly for eligible requests.
        </p>
        <p>
          Approved returns may be refunded to your original payment method
          (within 5–7 business days) or issued as instant THRIFT NATION Archive
          Credit.
        </p>
      </div>
    </div>
  );
}

