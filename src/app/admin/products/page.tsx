import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminProductsClient,
  type AdminProductRow,
} from "@/components/admin/AdminProductsClient";

async function AdminProductsContent() {
  try {
    await requireAdminSession();
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") redirect("/");
    redirect("/login?callbackUrl=/admin/products");
  }

  if (!isDatabaseConfigured) {
    return (
      <AdminShell title="Product Management">
        <div className="border border-charcoal/15 bg-white p-8 text-sm text-charcoal/75">
          Configure `DATABASE_URL` and run migrations to manage archive products.
        </div>
      </AdminShell>
    );
  }

  const [rows, categories, collections] = await Promise.all([
    prisma.product.findMany({
      include: {
        category: true,
        images: { orderBy: { sortOrder: "asc" } },
        collections: true,
      },
      orderBy: { createdAt: "desc" },
    }),
    prisma.category.findMany({ orderBy: { sortOrder: "asc" } }),
    prisma.collection.findMany({ orderBy: { sortOrder: "asc" } }),
  ]);

  const initialProducts: AdminProductRow[] = rows.map((r) => ({
    id: r.id,
    name: r.name,
    slug: r.slug,
    brand: r.brand,
    categoryId: r.categoryId,
    categoryName: r.category.name,
    collectionIds: r.collections.map((c) => c.collectionId),
    gender: r.gender,
    price: r.price,
    originalPrice: r.originalPrice,
    originalPriceVerified: r.originalPriceVerified,
    size: r.size,
    measurements: (r.measurements as Record<string, string>) ?? {},
    condition: r.condition,
    conditionNotes: r.conditionNotes,
    material: r.material,
    era: r.era,
    color: r.color,
    stockQuantity: r.stockQuantity,
    sku: r.sku,
    featured: r.featured,
    published: r.published,
    description: r.description,
    imageUrls: r.images.map((i) => i.url),
  }));

  return (
    <AdminShell
      title="Product Management"
      subtitle="Create, edit, photograph, and verify one-of-a-kind archive pieces."
    >
      <AdminProductsClient
        initialProducts={initialProducts}
        categories={categories}
        collections={collections}
      />
    </AdminShell>
  );
}

export default function AdminProductsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-12">
          <div className="h-96 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <AdminProductsContent />
    </Suspense>
  );
}

