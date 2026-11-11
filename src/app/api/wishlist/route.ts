import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const toggleSchema = z.object({
  productId: z.string().min(1),
});

export async function GET() {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ productIds: [] });
  }
  if (!isDatabaseConfigured) {
    return NextResponse.json({ productIds: [] });
  }

  try {
    const wishlist = await prisma.wishlist.findUnique({
      where: { userId: session.user.id },
      include: {
        items: {
          select: { productId: true },
        },
      },
    });

    return NextResponse.json({
      productIds: wishlist?.items.map((i) => i.productId) ?? [],
    });
  } catch {
    return NextResponse.json({ productIds: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "Database not configured." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = toggleSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid productId" }, { status: 400 });
  }

  const wishlist = await prisma.wishlist.upsert({
    where: { userId: session.user.id },
    update: {},
    create: { userId: session.user.id },
  });

  const existing = await prisma.wishlistItem.findUnique({
    where: {
      wishlistId_productId: {
        wishlistId: wishlist.id,
        productId: parsed.data.productId,
      },
    },
  });

  if (existing) {
    await prisma.wishlistItem.delete({ where: { id: existing.id } });
    return NextResponse.json({ saved: false });
  } else {
    await prisma.wishlistItem.create({
      data: {
        wishlistId: wishlist.id,
        productId: parsed.data.productId,
      },
    });
    return NextResponse.json({ saved: true });
  }
}

