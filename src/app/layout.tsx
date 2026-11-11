import { Suspense } from "react";
import type { Metadata } from "next";
import { Instrument_Serif, Inter } from "next/font/google";
import "./globals.css";
import { StoreProvider } from "@/components/providers/StoreProvider";
import { AnnouncementBar } from "@/components/layout/AnnouncementBar";
import { Navbar } from "@/components/layout/Navbar";
import { Footer } from "@/components/layout/Footer";
import { CartDrawer } from "@/components/cart/CartDrawer";
import { SearchOverlay } from "@/components/search/SearchOverlay";
import { QuickViewModal } from "@/components/product/QuickViewModal";
import { getSiteSettings } from "@/lib/catalog";

const instrumentSerif = Instrument_Serif({
  variable: "--font-instrument-serif",
  subsets: ["latin"],
  weight: "400",
  style: ["normal", "italic"],
  display: "swap",
});

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";

export const metadata: Metadata = {
  metadataBase: new URL(siteUrl),
  title: {
    default: "THRIFT NATION — Pre-loved. Reimagined. Yours.",
    template: "%s | THRIFT NATION",
  },
  description:
    "Curated luxury thrift fashion for men and women. Discover singular vintage tailoring, heritage denim, and contemporary archive pieces.",
  openGraph: {
    title: "THRIFT NATION — Pre-loved. Reimagined. Yours.",
    description:
      "Curated luxury thrift fashion for men and women. Discover singular vintage tailoring, heritage denim, and contemporary archive pieces.",
    type: "website",
    locale: "en_IN",
    siteName: "THRIFT NATION",
    images: [
      {
        url: "/images/hero-editorial.jpg",
        width: 1600,
        height: 900,
        alt: "THRIFT NATION Editorial Campaign",
      },
    ],
  },
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const settings = await getSiteSettings();

  return (
    <html
      lang="en"
      className={`${instrumentSerif.variable} ${inter.variable} h-full`}
    >
      <body className="min-h-full flex flex-col bg-ivory text-charcoal antialiased">
        <StoreProvider>
          <AnnouncementBar
            enabled={settings.announcementEnabled}
            text={settings.announcementText}
            link={settings.announcementLink}
          />
          <Suspense
            fallback={
              <div className="h-16 border-b border-charcoal/10 bg-ivory" />
            }
          >
            <Navbar />
          </Suspense>
          <main className="flex-1">{children}</main>
          <Footer settings={settings} />
          <CartDrawer freeShippingThreshold={settings.freeShippingThreshold} />
          <SearchOverlay />
          <QuickViewModal />
        </StoreProvider>
      </body>
    </html>
  );
}
