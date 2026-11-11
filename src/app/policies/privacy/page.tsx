import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Privacy Policy",
  description: "How THRIFT NATION safeguards your personal and payment data.",
  alternates: { canonical: "/policies/privacy" },
};

export default function PrivacyPolicyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:py-24 space-y-6">
      <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
        Legal
      </p>
      <h1 className="font-editorial text-4xl sm:text-5xl text-charcoal">
        Privacy Policy
      </h1>
      <div className="space-y-4 text-sm leading-relaxed text-charcoal/80">
        <p>
          THRIFT NATION respects your privacy and collects only the personal
          information required to authenticate your account, fulfill your
          orders, and send drop dispatches when explicitly opted in.
        </p>
        <p>
          Payment credentials are processed directly over encrypted Razorpay
          gateways and are never stored on THRIFT NATION servers.
        </p>
        <p>
          To request data deletion or account export, email our concierge at
          concierge@thriftnation.in.
        </p>
      </div>
    </div>
  );
}

