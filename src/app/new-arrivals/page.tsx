import type { Metadata } from "next";
import {
  CatalogPageShell,
  type CatalogSearchParams,
} from "@/components/catalog/CatalogPageShell";

export const metadata: Metadata = {
  title: "New Arrivals",
  description:
    "Explore the latest weekly drop of curated one-of-a-kind vintage and contemporary garments at THRIFT NATION.",
  alternates: { canonical: "/new-arrivals" },
};

export default function NewArrivalsPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <CatalogPageShell
      eyebrow="Archive Drop 04"
      title="New Arrivals"
      description="Freshly steamed, measured, and authenticated pieces added to our archive this week. Once claimed, never restocked."
      showGenderFilter
      searchParams={searchParams}
    />
  );
}

