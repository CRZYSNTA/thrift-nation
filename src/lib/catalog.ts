import { cacheLife, cacheTag } from "next/cache";
import { ConditionGrade, Gender, Prisma } from "@prisma/client";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import {
  DEFAULT_EDITORIAL_ARTICLES,
  DEFAULT_SITE_SETTINGS,
  getFallbackCatalog,
  SEED_CATEGORIES,
  SEED_COLLECTIONS,
} from "@/lib/seed-data";
import type {
  CategorySummary,
  CollectionSummary,
  EditorialArticle,
  GarmentMeasurements,
  ProductCardItem,
  ProductDetailItem,
  SiteSettingsData,
} from "@/types/catalog";

export interface ProductQueryParams {
  gender?: Gender;
  collectionSlug?: string;
  categorySlug?: string;
  size?: string;
  brand?: string;
  condition?: ConditionGrade;
  availability?: "all" | "in-stock" | "sold";
  minPrice?: number;
  maxPrice?: number;
  search?: string;
  sort?: "newest" | "price-asc" | "price-desc" | "featured";
  featuredOnly?: boolean;
  limit?: number;
}

const productInclude = {
  category: {
    select: { id: true, name: true, slug: true, gender: true },
  },
  images: {
    orderBy: { sortOrder: "asc" as const },
    select: { id: true, url: true, alt: true, sortOrder: true },
  },
  collections: {
    include: {
      collection: {
        select: {
          id: true,
          name: true,
          slug: true,
          subtitle: true,
          description: true,
          image: true,
          featured: true,
        },
      },
    },
  },
} satisfies Prisma.ProductInclude;

type PrismaProductWithRelations = Prisma.ProductGetPayload<{
  include: typeof productInclude;
}>;

function mapPrismaProduct(p: PrismaProductWithRelations): ProductDetailItem {
  return {
    id: p.id,
    name: p.name,
    slug: p.slug,
    brand: p.brand,
    gender: p.gender,
    price: p.price,
    originalPrice: p.originalPrice,
    originalPriceVerified: p.originalPriceVerified,
    size: p.size,
    condition: p.condition,
    conditionNotes: p.conditionNotes,
    material: p.material,
    era: p.era,
    color: p.color,
    stockQuantity: p.stockQuantity,
    sku: p.sku,
    featured: p.featured,
    description: p.description,
    measurements: (p.measurements as GarmentMeasurements) ?? {},
    category: p.category,
    images: p.images,
    collections: p.collections.map((pc) => pc.collection),
    createdAt: p.createdAt.toISOString(),
  };
}

function filterAndSortFallback(params: ProductQueryParams): ProductDetailItem[] {
  let items = getFallbackCatalog();

  if (params.gender) {
    if (params.gender === "MEN" || params.gender === "WOMEN") {
      items = items.filter(
        (p) => p.gender === params.gender || p.gender === "UNISEX"
      );
    } else {
      items = items.filter((p) => p.gender === params.gender);
    }
  }
  if (params.collectionSlug) {
    items = items.filter((p) =>
      p.collections.some((c) => c.slug === params.collectionSlug)
    );
  }
  if (params.categorySlug) {
    items = items.filter((p) => p.category.slug === params.categorySlug);
  }
  if (params.size) {
    items = items.filter((p) =>
      p.size.toLowerCase().includes(params.size!.toLowerCase())
    );
  }
  if (params.brand) {
    items = items.filter(
      (p) => p.brand.toLowerCase() === params.brand!.toLowerCase()
    );
  }
  if (params.condition) {
    items = items.filter((p) => p.condition === params.condition);
  }
  if (params.availability === "in-stock") {
    items = items.filter((p) => p.stockQuantity > 0);
  } else if (params.availability === "sold") {
    items = items.filter((p) => p.stockQuantity <= 0);
  }
  if (typeof params.minPrice === "number") {
    items = items.filter((p) => p.price >= params.minPrice!);
  }
  if (typeof params.maxPrice === "number") {
    items = items.filter((p) => p.price <= params.maxPrice!);
  }
  if (params.featuredOnly) {
    items = items.filter((p) => p.featured);
  }
  if (params.search?.trim()) {
    const q = params.search.trim().toLowerCase();
    items = items.filter(
      (p) =>
        p.name.toLowerCase().includes(q) ||
        p.brand.toLowerCase().includes(q) ||
        p.material.toLowerCase().includes(q) ||
        p.category.name.toLowerCase().includes(q) ||
        p.description.toLowerCase().includes(q)
    );
  }

  switch (params.sort) {
    case "price-asc":
      items.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      items.sort((a, b) => b.price - a.price);
      break;
    case "featured":
      items.sort((a, b) => Number(b.featured) - Number(a.featured));
      break;
    case "newest":
    default:
      items.sort(
        (a, b) =>
          new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      );
      break;
  }

  if (params.limit) {
    items = items.slice(0, params.limit);
  }
  return items;
}

export async function getProducts(
  params: ProductQueryParams = {}
): Promise<ProductCardItem[]> {
  if (!isDatabaseConfigured) {
    return filterAndSortFallback(params);
  }

  try {
    const where: Prisma.ProductWhereInput = { published: true };

    if (params.gender) {
      if (params.gender === "MEN" || params.gender === "WOMEN") {
        where.gender = { in: [params.gender, "UNISEX"] };
      } else {
        where.gender = params.gender;
      }
    }
    if (params.collectionSlug) {
      where.collections = {
        some: { collection: { slug: params.collectionSlug } },
      };
    }
    if (params.categorySlug) {
      where.category = { slug: params.categorySlug };
    }
    if (params.size) {
      where.size = { contains: params.size, mode: "insensitive" };
    }
    if (params.brand) {
      where.brand = { equals: params.brand, mode: "insensitive" };
    }
    if (params.condition) {
      where.condition = params.condition;
    }
    if (params.availability === "in-stock") {
      where.stockQuantity = { gt: 0 };
    } else if (params.availability === "sold") {
      where.stockQuantity = { lte: 0 };
    }
    if (
      typeof params.minPrice === "number" ||
      typeof params.maxPrice === "number"
    ) {
      where.price = {
        ...(typeof params.minPrice === "number" ? { gte: params.minPrice } : {}),
        ...(typeof params.maxPrice === "number" ? { lte: params.maxPrice } : {}),
      };
    }
    if (params.featuredOnly) {
      where.featured = true;
    }
    if (params.search?.trim()) {
      const q = params.search.trim();
      where.OR = [
        { name: { contains: q, mode: "insensitive" } },
        { brand: { contains: q, mode: "insensitive" } },
        { material: { contains: q, mode: "insensitive" } },
        { description: { contains: q, mode: "insensitive" } },
      ];
    }

    let orderBy: Prisma.ProductOrderByWithRelationInput[] = [
      { createdAt: "desc" },
    ];
    if (params.sort === "price-asc") orderBy = [{ price: "asc" }];
    if (params.sort === "price-desc") orderBy = [{ price: "desc" }];
    if (params.sort === "featured")
      orderBy = [{ featured: "desc" }, { createdAt: "desc" }];

    const rows = await prisma.product.findMany({
      where,
      include: productInclude,
      orderBy,
      take: params.limit,
    });

    return rows.map(mapPrismaProduct);
  } catch (err) {
    console.warn("Database fallback triggered in getProducts:", err);
    return filterAndSortFallback(params);
  }
}

export async function getProductBySlug(
  slug: string
): Promise<ProductDetailItem | null> {
  if (!isDatabaseConfigured) {
    return getFallbackCatalog().find((p) => p.slug === slug) ?? null;
  }

  try {
    const row = await prisma.product.findFirst({
      where: { slug, published: true },
      include: productInclude,
    });
    return row ? mapPrismaProduct(row) : null;
  } catch (err) {
    console.warn("Database fallback triggered in getProductBySlug:", err);
    return getFallbackCatalog().find((p) => p.slug === slug) ?? null;
  }
}

export async function getCollections(): Promise<CollectionSummary[]> {
  "use cache";
  try {
    cacheLife("minutes");
    cacheTag("collections");
  } catch {
    // Outside Next.js runtime (e.g. unit tests)
  }
  if (!isDatabaseConfigured) {
    return SEED_COLLECTIONS;
  }
  try {
    const rows = await prisma.collection.findMany({
      orderBy: { sortOrder: "asc" },
      select: {
        id: true,
        name: true,
        slug: true,
        subtitle: true,
        description: true,
        image: true,
        featured: true,
      },
    });
    return rows.length > 0 ? rows : SEED_COLLECTIONS;
  } catch {
    return SEED_COLLECTIONS;
  }
}

export async function getCollectionBySlug(
  slug: string
): Promise<CollectionSummary | null> {
  const all = await getCollections();
  return all.find((c) => c.slug === slug) ?? null;
}

export async function getCategories(): Promise<CategorySummary[]> {
  if (!isDatabaseConfigured) {
    return SEED_CATEGORIES;
  }
  try {
    const rows = await prisma.category.findMany({
      orderBy: { sortOrder: "asc" },
      select: { id: true, name: true, slug: true, gender: true },
    });
    return rows.length > 0 ? rows : SEED_CATEGORIES;
  } catch {
    return SEED_CATEGORIES;
  }
}

export async function getFilterFacets(): Promise<{
  brands: string[];
  sizes: string[];
  categories: CategorySummary[];
}> {
  const products = await getProducts();
  const categories = await getCategories();
  const brands = Array.from(new Set(products.map((p) => p.brand))).sort();
  const sizes = Array.from(new Set(products.map((p) => p.size)));
  return { brands, sizes, categories };
}

export async function getSiteSettings(): Promise<SiteSettingsData> {
  "use cache";
  try {
    cacheLife("minutes");
    cacheTag("site-settings");
  } catch {
    // Outside Next.js runtime (e.g. unit tests)
  }
  if (!isDatabaseConfigured) {
    return DEFAULT_SITE_SETTINGS;
  }
  try {
    const row = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    if (!row) return DEFAULT_SITE_SETTINGS;

    const editorial = Array.isArray(row.editorialContent)
      ? (row.editorialContent as unknown as EditorialArticle[])
      : DEFAULT_EDITORIAL_ARTICLES;

    return {
      storeName: row.storeName,
      tagline: row.tagline,
      supportEmail: row.supportEmail,
      supportPhone: row.supportPhone,
      whatsappNumber: row.whatsappNumber,
      instagramUrl: row.instagramUrl,
      storeAddress: row.storeAddress,
      freeShippingThreshold: row.freeShippingThreshold,
      standardShippingFee: row.standardShippingFee,
      codEnabled: row.codEnabled,
      codFee: row.codFee,
      razorpayEnabled: row.razorpayEnabled,
      announcementEnabled: row.announcementEnabled,
      announcementText: row.announcementText,
      announcementLink: row.announcementLink,
      heroHeadline: row.heroHeadline,
      heroSubheadline: row.heroSubheadline,
      heroImage: row.heroImage,
      editorialContent: editorial,
    };
  } catch {
    return DEFAULT_SITE_SETTINGS;
  }
}
