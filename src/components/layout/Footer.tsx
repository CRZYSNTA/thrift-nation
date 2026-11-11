import Link from "next/link";
import type { SiteSettingsData } from "@/types/catalog";

interface FooterProps {
  settings: SiteSettingsData;
}

export function Footer({ settings }: FooterProps) {
  const whatsappHref = `https://wa.me/${settings.whatsappNumber.replace(/[^0-9]/g, "")}`;

  return (
    <footer className="border-t border-charcoal/12 bg-ivory text-charcoal">
      <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-12 md:grid-cols-2 lg:grid-cols-12">
          {/* Brand */}
          <div className="lg:col-span-4 space-y-4">
            <Link
              href="/"
              className="font-editorial text-3xl tracking-[0.06em] text-charcoal inline-block"
            >
              {settings.storeName}
            </Link>
            <p className="text-xs tracking-[0.18em] uppercase text-olive">
              {settings.tagline}
            </p>
            <p className="max-w-sm text-sm leading-relaxed text-charcoal/70">
              A curated archive of singular vintage and contemporary garments.
              Authenticated, restored, and measured with editorial precision.
            </p>
            <p className="text-xs text-charcoal/60 pt-2">
              {settings.storeAddress}
            </p>
          </div>

          {/* Shop */}
          <div className="lg:col-span-2 space-y-4">
            <h3 className="text-[11px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
              Shop
            </h3>
            <ul className="space-y-2.5 text-sm text-charcoal/80">
              <li>
                <Link href="/men" className="hover:text-charcoal transition-colors">
                  Men
                </Link>
              </li>
              <li>
                <Link href="/women" className="hover:text-charcoal transition-colors">
                  Women
                </Link>
              </li>
              <li>
                <Link
                  href="/new-arrivals"
                  className="hover:text-charcoal transition-colors"
                >
                  New Arrivals
                </Link>
              </li>
              <li>
                <Link
                  href="/collections"
                  className="hover:text-charcoal transition-colors"
                >
                  Collections
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/vintage-essentials"
                  className="hover:text-charcoal transition-colors"
                >
                  Vintage Essentials
                </Link>
              </li>
              <li>
                <Link
                  href="/collections/denim-collection"
                  className="hover:text-charcoal transition-colors"
                >
                  Denim Collection
                </Link>
              </li>
            </ul>
          </div>

          {/* Information & Policies */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-[11px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
              House &amp; Policies
            </h3>
            <ul className="space-y-2.5 text-sm text-charcoal/80">
              <li>
                <Link href="/about" className="hover:text-charcoal transition-colors">
                  About
                </Link>
              </li>
              <li>
                <Link href="/contact" className="hover:text-charcoal transition-colors">
                  Contact
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/shipping"
                  className="hover:text-charcoal transition-colors"
                >
                  Shipping Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/returns"
                  className="hover:text-charcoal transition-colors"
                >
                  Return Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/privacy"
                  className="hover:text-charcoal transition-colors"
                >
                  Privacy Policy
                </Link>
              </li>
              <li>
                <Link
                  href="/policies/terms"
                  className="hover:text-charcoal transition-colors"
                >
                  Terms and Conditions
                </Link>
              </li>
            </ul>
          </div>

          {/* Connect */}
          <div className="lg:col-span-3 space-y-4">
            <h3 className="text-[11px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
              Connect
            </h3>
            <ul className="space-y-2.5 text-sm text-charcoal/80">
              <li>
                <a
                  href={settings.instagramUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-charcoal transition-colors"
                >
                  Instagram
                </a>
              </li>
              <li>
                <a
                  href={whatsappHref}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="hover:text-charcoal transition-colors"
                >
                  WhatsApp Concierge
                </a>
              </li>
              <li>
                <a
                  href={`mailto:${settings.supportEmail}`}
                  className="hover:text-charcoal transition-colors"
                >
                  {settings.supportEmail}
                </a>
              </li>
              <li className="text-charcoal/60">{settings.supportPhone}</li>
            </ul>
          </div>
        </div>

        <div className="mt-16 flex flex-col gap-4 border-t border-charcoal/10 pt-8 text-xs text-charcoal/60 sm:flex-row sm:items-center sm:justify-between">
          <p>© 2026 THRIFT NATION. All rights reserved.</p>
          <p className="tracking-[0.12em] uppercase">
            Curated Circular Luxury · India
          </p>
        </div>
      </div>
    </footer>
  );
}

