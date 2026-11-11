import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getCollectionBySlug } from "@/lib/catalog";
import {
  CatalogPageShell,
  type CatalogSearchParams,
} from "@/components/catalog/CatalogPageShell";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);
  if (!collection) {
    return { title: "Collection Not Found" };
  }
  return {
    title: collection.name,
    description:
      collection.description ||
      `Explore ${collection.name} at THRIFT NATION.`,
    alternates: { canonical: `/collections/${collection.slug}` },
  };
}

async function CollectionDetailContent({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  const { slug } = await params;
  const collection = await getCollectionBySlug(slug);

  if (!collection) {
    notFound();
  }

  return (
    <CatalogPageShell
      eyebrow={collection.subtitle || "Curated Collection"}
      title={collection.name}
      description={
        collection.description ||
        "Individually authenticated vintage and contemporary garments."
      }
      fixedCollectionSlug={collection.slug}
      showGenderFilter
      searchParams={searchParams}
    />
  );
}

export default function CollectionDetailPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<CatalogSearchParams>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12">
          <div className="h-64 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <CollectionDetailContent params={params} searchParams={searchParams} />
    </Suspense>
  );
}
