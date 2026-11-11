import type { Metadata } from "next";
import {
  CatalogPageShell,
  type CatalogSearchParams,
} from "@/components/catalog/CatalogPageShell";

export const metadata: Metadata = {
  title: "Women’s Archive",
  description:
    "Curated pre-loved womenswear — Italian wool blazers, pleated midi skirts, vintage trench coats, and quiet luxury separates.",
  alternates: { canonical: "/women" },
};

export default function WomenPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <CatalogPageShell
      eyebrow="Department · Womenswear"
      title="Women’s Archive"
      description="Fluid Italian wool tailoring, sculptural skirts, and timeless coats ready for their second life."
      fixedGender="WOMEN"
      searchParams={searchParams}
    />
  );
}

