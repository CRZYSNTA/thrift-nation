import { NextRequest, NextResponse } from "next/server";
import { revalidatePath } from "next/cache";
import { Prisma } from "@prisma/client";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const productSchema = z.object({
  id: z.string().optional(),
  name: z.string().min(2),
  brand: z.string().min(1),
  categoryId: z.string().min(1),
  collectionIds: z.array(z.string()).default([]),
  gender: z.enum(["MEN", "WOMEN", "UNISEX"]),
  price: z.number().int().positive(),
  originalPrice: z.number().int().positive().nullable().optional(),
  originalPriceVerified: z.boolean().default(false),
  size: z.string().min(1),
  measurements: z.record(z.string(), z.string()).default({}),
  condition: z.enum(["LIKE_NEW", "EXCELLENT", "GOOD", "FAIR"]),
  conditionNotes: z.string().optional().nullable(),
  material: z.string().min(1),
  era: z.string().optional().nullable(),
  color: z.string().optional().nullable(),
  stockQuantity: z.number().int().min(0),
  sku: z.string().min(2),
  featured: z.boolean().default(false),
  published: z.boolean().default(true),
  description: z.string().min(10),
  imageUrls: z.array(z.string().min(1)).min(1),
});

async function guardAdmin() {
  try {
    await requireAdminSession();
    return null;
  } catch (err) {
    const code = err instanceof Error && err.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "Admin access required" }, { status: code });
  }
}

export async function POST(req: NextRequest) {
  const denied = await guardAdmin();
  if (denied) return denied;
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const parsed = productSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid product data" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const baseSlug = slugify(d.name);
    const slug = `${baseSlug}-${Date.now().toString().slice(-4)}`;

    const created = await prisma.product.create({
      data: {
        name: d.name.trim(),
        slug,
        brand: d.brand.trim(),
        categoryId: d.categoryId,
        gender: d.gender,
        price: d.price,
        originalPrice: d.originalPrice ?? null,
        originalPriceVerified: Boolean(d.originalPrice && d.originalPriceVerified),
        size: d.size.trim(),
        measurements: d.measurements as Prisma.InputJsonValue,
        condition: d.condition,
        conditionNotes: d.conditionNotes?.trim() || null,
        material: d.material.trim(),
        era: d.era?.trim() || null,
        color: d.color?.trim() || null,
        stockQuantity: d.stockQuantity,
        sku: d.sku.trim().toUpperCase(),
        featured: d.featured,
        published: d.published,
        description: d.description.trim(),
        images: {
          create: d.imageUrls.map((url, idx) => ({
            url: url.trim(),
            alt: d.name.trim(),
            sortOrder: idx,
          })),
        },
        collections: {
          create: d.collectionIds.map((collectionId) => ({ collectionId })),
        },
      },
    });

    revalidatePath("/");
    revalidatePath("/men");
    revalidatePath("/women");
    revalidatePath("/new-arrivals");
    revalidatePath("/collections");

    return NextResponse.json({ product: created }, { status: 201 });
  } catch (err) {
    console.error("Admin create product error:", err);
    return NextResponse.json(
      { error: "Unable to create product. Ensure SKU is unique." },
      { status: 400 }
    );
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await guardAdmin();
  if (denied) return denied;
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    const body = await req.json();
    const parsed = productSchema.extend({ id: z.string().min(1) }).safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid update payload" },
        { status: 400 }
      );
    }

    const d = parsed.data;
    const updated = await prisma.$transaction(async (tx) => {
      await tx.productImage.deleteMany({ where: { productId: d.id } });
      await tx.productCollection.deleteMany({ where: { productId: d.id } });

      return tx.product.update({
        where: { id: d.id },
        data: {
          name: d.name.trim(),
          brand: d.brand.trim(),
          categoryId: d.categoryId,
          gender: d.gender,
          price: d.price,
          originalPrice: d.originalPrice ?? null,
          originalPriceVerified: Boolean(d.originalPrice && d.originalPriceVerified),
          size: d.size.trim(),
          measurements: d.measurements as Prisma.InputJsonValue,
          condition: d.condition,
          conditionNotes: d.conditionNotes?.trim() || null,
          material: d.material.trim(),
          era: d.era?.trim() || null,
          color: d.color?.trim() || null,
          stockQuantity: d.stockQuantity,
          sku: d.sku.trim().toUpperCase(),
          featured: d.featured,
          published: d.published,
          description: d.description.trim(),
          images: {
            create: d.imageUrls.map((url, idx) => ({
              url: url.trim(),
              alt: d.name.trim(),
              sortOrder: idx,
            })),
          },
          collections: {
            create: d.collectionIds.map((collectionId) => ({ collectionId })),
          },
        },
      });
    });

    revalidatePath("/");
    revalidatePath(`/product/${updated.slug}`);
    return NextResponse.json({ product: updated });
  } catch (err) {
    console.error("Admin update product error:", err);
    return NextResponse.json(
      { error: "Unable to update product." },
      { status: 400 }
    );
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await guardAdmin();
  if (denied) return denied;
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Product ID required" }, { status: 400 });
  }

  try {
    await prisma.product.delete({ where: { id } });
    revalidatePath("/");
    return NextResponse.json({ deleted: true });
  } catch {
    // If referenced by historical orderItems, unpublish instead of breaking FK integrity
    await prisma.product.update({
      where: { id },
      data: { published: false, stockQuantity: 0 },
    });
    revalidatePath("/");
    return NextResponse.json({ archived: true });
  }
}

