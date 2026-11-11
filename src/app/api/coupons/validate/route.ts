import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const couponSchema = z.object({
  code: z.string().min(1),
  subtotal: z.number().nonnegative(),
});

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json(
        { error: "Database is not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = couponSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid coupon request" }, { status: 400 });
    }

    const code = parsed.data.code.trim().toUpperCase();
    const coupon = await prisma.coupon.findUnique({ where: { code } });

    if (!coupon || !coupon.active) {
      return NextResponse.json(
        { error: "Coupon code is invalid or inactive." },
        { status: 404 }
      );
    }

    if (coupon.expiresAt && coupon.expiresAt < new Date()) {
      return NextResponse.json(
        { error: "This coupon has expired." },
        { status: 400 }
      );
    }

    if (coupon.usageLimit && coupon.usedCount >= coupon.usageLimit) {
      return NextResponse.json(
        { error: "This coupon has reached its usage limit." },
        { status: 400 }
      );
    }

    if (parsed.data.subtotal < coupon.minOrderAmount) {
      return NextResponse.json(
        {
          error: `Minimum order amount of ₹${coupon.minOrderAmount.toLocaleString("en-IN")} required.`,
        },
        { status: 400 }
      );
    }

    let discount =
      coupon.discountType === "PERCENTAGE"
        ? Math.round((parsed.data.subtotal * coupon.discountValue) / 100)
        : coupon.discountValue;

    if (coupon.maxDiscount) {
      discount = Math.min(discount, coupon.maxDiscount);
    }
    discount = Math.min(discount, parsed.data.subtotal);

    return NextResponse.json({
      code: coupon.code,
      discount,
      description: coupon.description,
    });
  } catch (err) {
    console.error("Coupon validation error:", err);
    return NextResponse.json(
      { error: "Unable to validate coupon." },
      { status: 500 }
    );
  }
}

