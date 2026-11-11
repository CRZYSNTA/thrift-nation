import { PrismaClient, Prisma } from "@prisma/client";
import bcrypt from "bcryptjs";
import {
  DEFAULT_EDITORIAL_ARTICLES,
  DEFAULT_SITE_SETTINGS,
  SEED_CATEGORIES,
  SEED_COLLECTIONS,
  SEED_PRODUCTS,
} from "../src/lib/seed-data";

const prisma = new PrismaClient();

async function main() {
  console.log("Seeding THRIFT NATION database...");

  // 1. Seed Site Settings
  await prisma.siteSettings.upsert({
    where: { id: "default" },
    update: {},
    create: {
      id: "default",
      storeName: DEFAULT_SITE_SETTINGS.storeName,
      tagline: DEFAULT_SITE_SETTINGS.tagline,
      supportEmail: DEFAULT_SITE_SETTINGS.supportEmail,
      supportPhone: DEFAULT_SITE_SETTINGS.supportPhone,
      whatsappNumber: DEFAULT_SITE_SETTINGS.whatsappNumber,
      instagramUrl: DEFAULT_SITE_SETTINGS.instagramUrl,
      storeAddress: DEFAULT_SITE_SETTINGS.storeAddress,
      freeShippingThreshold: DEFAULT_SITE_SETTINGS.freeShippingThreshold,
      standardShippingFee: DEFAULT_SITE_SETTINGS.standardShippingFee,
      codEnabled: DEFAULT_SITE_SETTINGS.codEnabled,
      codFee: DEFAULT_SITE_SETTINGS.codFee,
      razorpayEnabled: DEFAULT_SITE_SETTINGS.razorpayEnabled,
      announcementEnabled: DEFAULT_SITE_SETTINGS.announcementEnabled,
      announcementText: DEFAULT_SITE_SETTINGS.announcementText,
      announcementLink: DEFAULT_SITE_SETTINGS.announcementLink,
      heroHeadline: DEFAULT_SITE_SETTINGS.heroHeadline,
      heroSubheadline: DEFAULT_SITE_SETTINGS.heroSubheadline,
      heroImage: DEFAULT_SITE_SETTINGS.heroImage,
      editorialContent: DEFAULT_EDITORIAL_ARTICLES as unknown as Prisma.InputJsonValue,
    },
  });

  // 2. Seed Admin & Sample Customer Users
  const adminPasswordHash = await bcrypt.hash("Admin@1234", 12);
  const customerPasswordHash = await bcrypt.hash("Customer@1234", 12);

  await prisma.user.upsert({
    where: { email: "admin@thriftnation.in" },
    update: {},
    create: {
      name: "Curator Admin",
      email: "admin@thriftnation.in",
      passwordHash: adminPasswordHash,
      role: "SUPER_ADMIN",
      phone: "+91 98200 12345",
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: "arjun@thriftnation.in" },
    update: {},
    create: {
      name: "Arjun Mehta",
      email: "arjun@thriftnation.in",
      passwordHash: customerPasswordHash,
      role: "CUSTOMER",
      phone: "+91 98201 54321",
    },
  });

  await prisma.wishlist.upsert({
    where: { userId: customer.id },
    update: {},
    create: { userId: customer.id },
  });

  // 3. Seed Categories
  const categoryIdBySlug = new Map<string, string>();
  for (let i = 0; i < SEED_CATEGORIES.length; i++) {
    const cat = SEED_CATEGORIES[i];
    const upserted = await prisma.category.upsert({
      where: { slug: cat.slug },
      update: { name: cat.name, sortOrder: i },
      create: {
        name: cat.name,
        slug: cat.slug,
        gender: cat.gender,
        sortOrder: i,
      },
    });
    categoryIdBySlug.set(cat.slug, upserted.id);
  }

  // 4. Seed Collections
  const collectionIdBySlug = new Map<string, string>();
  for (let i = 0; i < SEED_COLLECTIONS.length; i++) {
    const col = SEED_COLLECTIONS[i];
    const upserted = await prisma.collection.upsert({
      where: { slug: col.slug },
      update: {
        name: col.name,
        subtitle: col.subtitle,
        description: col.description,
        image: col.image,
        featured: col.featured,
        sortOrder: i,
      },
      create: {
        name: col.name,
        slug: col.slug,
        subtitle: col.subtitle,
        description: col.description,
        image: col.image,
        featured: col.featured,
        sortOrder: i,
      },
    });
    collectionIdBySlug.set(col.slug, upserted.id);
  }

  // 5. Seed Products
  for (const prod of SEED_PRODUCTS) {
    const categoryId = categoryIdBySlug.get(prod.categorySlug);
    if (!categoryId) continue;

    const existing = await prisma.product.findUnique({
      where: { slug: prod.slug },
    });

    if (!existing) {
      await prisma.product.create({
        data: {
          name: prod.name,
          slug: prod.slug,
          brand: prod.brand,
          categoryId,
          gender: prod.gender,
          price: prod.price,
          originalPrice: prod.originalPrice,
          originalPriceVerified: prod.originalPriceVerified,
          size: prod.size,
          measurements: prod.measurements as unknown as Prisma.InputJsonValue,
          condition: prod.condition,
          conditionNotes: prod.conditionNotes,
          material: prod.material,
          era: prod.era,
          color: prod.color,
          stockQuantity: prod.stockQuantity,
          sku: prod.sku,
          featured: prod.featured,
          published: true,
          description: prod.description,
          images: {
            create: prod.images.map((img, idx) => ({
              url: img.url,
              alt: img.alt,
              sortOrder: idx,
            })),
          },
          collections: {
            create: prod.collectionSlugs
              .map((s) => collectionIdBySlug.get(s))
              .filter((id): id is string => Boolean(id))
              .map((collectionId) => ({ collectionId })),
          },
        },
      });
    }
  }

  // 6. Seed Coupons
  await prisma.coupon.upsert({
    where: { code: "NATION10" },
    update: {},
    create: {
      code: "NATION10",
      description: "10% off on curated archive orders above ₹2,999",
      discountType: "PERCENTAGE",
      discountValue: 10,
      minOrderAmount: 2999,
      maxDiscount: 2500,
      active: true,
    },
  });

  await prisma.coupon.upsert({
    where: { code: "FIRST500" },
    update: {},
    create: {
      code: "FIRST500",
      description: "Flat ₹500 off on orders above ₹4,500",
      discountType: "FIXED",
      discountValue: 500,
      minOrderAmount: 4500,
      active: true,
    },
  });

  console.log("Seed completed successfully.");
}

main()
  .catch((err) => {
    console.error("Seed error:", err);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });

