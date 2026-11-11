import { Suspense } from "react";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getProductBySlug, getProducts } from "@/lib/catalog";
import { ProductDetailClient } from "@/components/product/ProductDetailClient";
import { ProductCard } from "@/components/product/ProductCard";
import {
  ProductReviewsSection,
  type ReviewItem,
} from "@/components/product/ProductReviewsSection";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const product = await getProductBySlug(slug);
  if (!product) {
    return { title: "Piece Not Found" };
  }
  return {
    title: product.name,
    description: `${product.brand} — ${product.material}. Condition: ${product.condition}. ${product.description.slice(0, 140)}`,
    alternates: { canonical: `/product/${product.slug}` },
    openGraph: {
      title: `${product.name} | THRIFT NATION`,
      description: product.description.slice(0, 160),
      images: product.images[0]?.url ? [{ url: product.images[0].url }] : [],
    },
  };
}

async function ProductPageContent({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const product = await getProductBySlug(slug);

  if (!product) {
    notFound();
  }

  const [relatedAll, reviewRows] = await Promise.all([
    getProducts({
      gender: product.gender,
      limit: 5,
    }),
    isDatabaseConfigured
      ? prisma.review
          .findMany({
            where: { productId: product.id },
            include: { user: { select: { name: true } } },
            orderBy: { createdAt: "desc" },
          })
          .catch(() => [])
      : Promise.resolve([]),
  ]);
  const related = relatedAll.filter((p) => p.id !== product.id).slice(0, 4);
  const initialReviews: ReviewItem[] = reviewRows.map((r) => ({
    id: r.id,
    rating: r.rating,
    title: r.title,
    comment: r.comment,
    verified: r.verified,
    authorName: r.user.name || "Member",
    createdAt: r.createdAt.toISOString(),
  }));

  const jsonLd = {
    "@context": "https://schema.org",
    "@type": "Product",
    name: product.name,
    image: product.images.map((i) => i.url),
    description: product.description,
    sku: product.sku,
    brand: {
      "@type": "Brand",
      name: product.brand,
    },
    offers: {
      "@type": "Offer",
      priceCurrency: "INR",
      price: product.price,
      availability:
        product.stockQuantity > 0
          ? "https://schema.org/InStock"
          : "https://schema.org/OutOfStock",
      itemCondition: "https://schema.org/UsedCondition",
    },
  };

  return (
    <div className="pb-16 lg:pb-0">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <ProductDetailClient product={product} />

      <ProductReviewsSection
        productId={product.id}
        initialReviews={initialReviews}
      />

      {related.length > 0 && (
        <section className="border-t border-charcoal/12 bg-white/60">
          <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12">
            <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
              Complementary Finds
            </p>
            <h2 className="mt-2 font-editorial text-3xl text-charcoal">
              More from the Archive
            </h2>
            <div className="mt-8 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4">
              {related.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}

export default function ProductPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12">
          <div className="grid grid-cols-1 gap-10 lg:grid-cols-12">
            <div className="aspect-[3/4] animate-pulse bg-sand/50 lg:col-span-7" />
            <div className="h-96 animate-pulse bg-sand/40 lg:col-span-5" />
          </div>
        </div>
      }
    >
      <ProductPageContent params={params} />
    </Suspense>
  );
}

