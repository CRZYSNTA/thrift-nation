import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const updateOrderSchema = z.object({
  orderId: z.string().min(1),
  status: z
    .enum([
      "PENDING",
      "CONFIRMED",
      "PROCESSING",
      "SHIPPED",
      "DELIVERED",
      "CANCELLED",
    ])
    .optional(),
  paymentStatus: z
    .enum(["PENDING", "PAID", "FAILED", "REFUNDED", "COD_PENDING"])
    .optional(),
  trackingCarrier: z.string().optional().nullable(),
  trackingNumber: z.string().optional().nullable(),
});

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

  const body = await req.json();
  const parsed = updateOrderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid order update" }, { status: 400 });
  }

  const d = parsed.data;

  const updated = await prisma.$transaction(async (tx) => {
    const existing = await tx.order.findUnique({
      where: { id: d.orderId },
      include: { items: true },
    });
    if (!existing) {
      throw new Error("NOT_FOUND");
    }

    // If transitioning to CANCELLED from a non-cancelled status, restore unique stock
    if (d.status === "CANCELLED" && existing.status !== "CANCELLED") {
      for (const item of existing.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }
    }

    return tx.order.update({
      where: { id: d.orderId },
      data: {
        ...(d.status ? { status: d.status } : {}),
        ...(d.paymentStatus ? { paymentStatus: d.paymentStatus } : {}),
        ...(d.trackingCarrier !== undefined
          ? { trackingCarrier: d.trackingCarrier?.trim() || null }
          : {}),
        ...(d.trackingNumber !== undefined
          ? { trackingNumber: d.trackingNumber?.trim() || null }
          : {}),
      },
    });
  });

  return NextResponse.json({ order: updated });
}

