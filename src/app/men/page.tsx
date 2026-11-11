import type { Metadata } from "next";
import {
  CatalogPageShell,
  type CatalogSearchParams,
} from "@/components/catalog/CatalogPageShell";

export const metadata: Metadata = {
  title: "Men’s Archive",
  description:
    "Curated pre-loved menswear — structured camel coats, Japanese selvedge denim, patinated leather bombers, and archival workwear.",
  alternates: { canonical: "/men" },
};

export default function MenPage({
  searchParams,
}: {
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <CatalogPageShell
      eyebrow="Department · Menswear"
      title="Men’s Archive"
      description="Tailored outerwear, heritage workwear, and relaxed vintage silhouettes—sourced singly and inspected by hand."
      fixedGender="MEN"
      searchParams={searchParams}
    />
  );
}

