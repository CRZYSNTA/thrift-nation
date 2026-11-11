import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const reviewSchema = z.object({
  productId: z.string().min(1),
  rating: z.number().int().min(1).max(5),
  title: z.string().max(100).optional().nullable(),
  comment: z.string().min(5, "Please share at least 5 characters.").max(1000),
});

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("productId");
  if (!productId || !isDatabaseConfigured) {
    return NextResponse.json({ reviews: [] });
  }

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: { select: { name: true } },
      },
      orderBy: { createdAt: "desc" },
    });
    return NextResponse.json({
      reviews: reviews.map((r) => ({
        id: r.id,
        rating: r.rating,
        title: r.title,
        comment: r.comment,
        verified: r.verified,
        authorName: r.user.name || "Member",
        createdAt: r.createdAt.toISOString(),
      })),
    });
  } catch {
    return NextResponse.json({ reviews: [] });
  }
}

export async function POST(req: NextRequest) {
  const session = await auth();
  if (!session?.user?.id) {
    return NextResponse.json(
      { error: "Please sign in to leave a review." },
      { status: 401 }
    );
  }
  if (!isDatabaseConfigured) {
    return NextResponse.json(
      { error: "Database is not configured." },
      { status: 503 }
    );
  }

  const body = await req.json();
  const parsed = reviewSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid review input." },
      { status: 400 }
    );
  }

  const purchased = await prisma.orderItem.findFirst({
    where: {
      productId: parsed.data.productId,
      order: {
        userId: session.user.id,
        status: { not: "CANCELLED" },
      },
    },
  });

  const review = await prisma.review.create({
    data: {
      productId: parsed.data.productId,
      userId: session.user.id,
      rating: parsed.data.rating,
      title: parsed.data.title?.trim() || null,
      comment: parsed.data.comment.trim(),
      verified: Boolean(purchased),
    },
    include: {
      user: { select: { name: true } },
    },
  });

  return NextResponse.json(
    {
      review: {
        id: review.id,
        rating: review.rating,
        title: review.title,
        comment: review.comment,
        verified: review.verified,
        authorName: review.user.name || "Member",
        createdAt: review.createdAt.toISOString(),
      },
    },
    { status: 201 }
  );
}

