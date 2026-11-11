import { NextRequest, NextResponse } from "next/server";
import { revalidatePath, revalidateTag } from "next/cache";
import { Prisma } from "@prisma/client";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

export async function PATCH(req: NextRequest) {
  try {
    await requireAdminSession();
  } catch (err) {
    const code = err instanceof Error && err.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "Admin access required" }, { status: code });
  }

  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  try {
    const body = await req.json();

    const settings = await prisma.siteSettings.upsert({
      where: { id: "default" },
      update: {
        ...(body.storeName !== undefined ? { storeName: String(body.storeName) } : {}),
        ...(body.tagline !== undefined ? { tagline: String(body.tagline) } : {}),
        ...(body.supportEmail !== undefined
          ? { supportEmail: String(body.supportEmail) }
          : {}),
        ...(body.supportPhone !== undefined
          ? { supportPhone: String(body.supportPhone) }
          : {}),
        ...(body.whatsappNumber !== undefined
          ? { whatsappNumber: String(body.whatsappNumber) }
          : {}),
        ...(body.instagramUrl !== undefined
          ? { instagramUrl: String(body.instagramUrl) }
          : {}),
        ...(body.storeAddress !== undefined
          ? { storeAddress: String(body.storeAddress) }
          : {}),
        ...(body.freeShippingThreshold !== undefined
          ? { freeShippingThreshold: Number(body.freeShippingThreshold) }
          : {}),
        ...(body.standardShippingFee !== undefined
          ? { standardShippingFee: Number(body.standardShippingFee) }
          : {}),
        ...(body.codEnabled !== undefined
          ? { codEnabled: Boolean(body.codEnabled) }
          : {}),
        ...(body.codFee !== undefined ? { codFee: Number(body.codFee) } : {}),
        ...(body.razorpayEnabled !== undefined
          ? { razorpayEnabled: Boolean(body.razorpayEnabled) }
          : {}),
        ...(body.announcementEnabled !== undefined
          ? { announcementEnabled: Boolean(body.announcementEnabled) }
          : {}),
        ...(body.announcementText !== undefined
          ? { announcementText: String(body.announcementText) }
          : {}),
        ...(body.announcementLink !== undefined
          ? { announcementLink: String(body.announcementLink) }
          : {}),
        ...(body.heroHeadline !== undefined
          ? { heroHeadline: String(body.heroHeadline) }
          : {}),
        ...(body.heroSubheadline !== undefined
          ? { heroSubheadline: String(body.heroSubheadline) }
          : {}),
        ...(body.heroImage !== undefined
          ? { heroImage: String(body.heroImage) }
          : {}),
        ...(body.editorialContent !== undefined
          ? { editorialContent: body.editorialContent as Prisma.InputJsonValue }
          : {}),
      },
      create: {
        id: "default",
      },
    });

    if (Array.isArray(body.featuredCollectionIds)) {
      const featuredIds = new Set<string>(body.featuredCollectionIds);
      const allCols = await prisma.collection.findMany({ select: { id: true } });
      for (const col of allCols) {
        await prisma.collection.update({
          where: { id: col.id },
          data: { featured: featuredIds.has(col.id) },
        });
      }
    }

    revalidateTag("site-settings", "max");
    revalidateTag("collections", "max");
    revalidatePath("/", "layout");

    return NextResponse.json({ settings });
  } catch (err) {
    console.error("Settings update error:", err);
    return NextResponse.json(
      { error: "Unable to update settings." },
      { status: 400 }
    );
  }
}

