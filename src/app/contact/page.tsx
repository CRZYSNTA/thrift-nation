import type { Metadata } from "next";
import { getSiteSettings } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Contact & Atelier Concierge",
  description:
    "Reach the THRIFT NATION curation and client concierge team in Mumbai.",
  alternates: { canonical: "/contact" },
};

export default async function ContactPage() {
  const settings = await getSiteSettings();
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <div className="mx-auto max-w-4xl px-4 py-16 sm:px-8 lg:py-24">
      <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-olive">
        Client Concierge
      </p>
      <h1 className="mt-2 font-editorial text-4xl sm:text-5xl text-charcoal">
        Contact THRIFT NATION
      </h1>
      <p className="mt-4 max-w-2xl text-sm leading-relaxed text-charcoal/75">
        Need additional garment measurements, styling guidance, or assistance
        with an active order? Our Mumbai archive team responds within one
        business day.
      </p>

      <div className="mt-12 grid grid-cols-1 gap-6 sm:grid-cols-2">
        <div className="border border-charcoal/12 bg-white p-6 space-y-2">
          <h2 className="text-[11px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
            Direct Concierge
          </h2>
          <p className="text-sm text-charcoal">
            Email:{" "}
            <a
              href={`mailto:${settings.supportEmail}`}
              className="underline underline-offset-4"
            >
              {settings.supportEmail}
            </a>
          </p>
          <p className="text-sm text-charcoal">Phone: {settings.supportPhone}</p>
          <p className="pt-2">
            <a
              href={whatsappHref}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-block border border-charcoal px-4 py-2 text-[11px] font-medium tracking-[0.14em] uppercase text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              Message on WhatsApp
            </a>
          </p>
        </div>

        <div className="border border-charcoal/12 bg-white p-6 space-y-2">
          <h2 className="text-[11px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
            Archive Studio
          </h2>
          <p className="text-sm text-charcoal">{settings.storeAddress}</p>
          <p className="text-xs text-charcoal/65">
            Tuesday – Sunday, 11:00 AM to 7:30 PM IST (By private appointment)
          </p>
        </div>
      </div>
    </div>
  );
}

