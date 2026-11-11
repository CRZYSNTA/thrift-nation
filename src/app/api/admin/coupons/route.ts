import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const couponSchema = z.object({
  code: z.string().min(2).max(30),
  description: z.string().optional().nullable(),
  discountType: z.enum(["PERCENTAGE", "FIXED"]),
  discountValue: z.number().int().positive(),
  minOrderAmount: z.number().int().min(0).default(0),
  maxDiscount: z.number().int().positive().nullable().optional(),
  usageLimit: z.number().int().positive().nullable().optional(),
  expiresAt: z.string().optional().nullable(),
});

async function guard() {
  try {
    await requireAdminSession();
    return null;
  } catch (err) {
    const code = err instanceof Error && err.message === "FORBIDDEN" ? 403 : 401;
    return NextResponse.json({ error: "Admin access required" }, { status: code });
  }
}

export async function POST(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const body = await req.json();
  const parsed = couponSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: parsed.error.issues[0]?.message || "Invalid coupon fields" },
      { status: 400 }
    );
  }

  const d = parsed.data;
  const coupon = await prisma.coupon.create({
    data: {
      code: d.code.trim().toUpperCase(),
      description: d.description?.trim() || null,
      discountType: d.discountType,
      discountValue: d.discountValue,
      minOrderAmount: d.minOrderAmount,
      maxDiscount: d.maxDiscount ?? null,
      usageLimit: d.usageLimit ?? null,
      expiresAt: d.expiresAt ? new Date(d.expiresAt) : null,
      active: true,
    },
  });

  return NextResponse.json({ coupon }, { status: 201 });
}

export async function PATCH(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const body = await req.json();
  const id = String(body.id || "");
  const active = Boolean(body.active);
  if (!id) {
    return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });
  }

  const coupon = await prisma.coupon.update({
    where: { id },
    data: { active },
  });
  return NextResponse.json({ coupon });
}

export async function DELETE(req: NextRequest) {
  const denied = await guard();
  if (denied) return denied;
  if (!isDatabaseConfigured) {
    return NextResponse.json({ error: "Database not configured." }, { status: 503 });
  }

  const { searchParams } = new URL(req.url);
  const id = searchParams.get("id");
  if (!id) {
    return NextResponse.json({ error: "Coupon ID required" }, { status: 400 });
  }

  await prisma.coupon.delete({ where: { id } });
  return NextResponse.json({ deleted: true });
}

