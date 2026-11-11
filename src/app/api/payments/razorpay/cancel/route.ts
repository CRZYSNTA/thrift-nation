import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";

const cancelSchema = z.object({
  orderId: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json({ ok: true });
    }

    const body = await req.json();
    const parsed = cancelSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: "Invalid orderId" }, { status: 400 });
    }

    await prisma.$transaction(async (tx) => {
      const order = await tx.order.findUnique({
        where: { id: parsed.data.orderId },
        include: { items: true },
      });

      if (!order || order.status !== "PENDING" || order.paymentStatus !== "PENDING") {
        return;
      }

      const updated = await tx.order.updateMany({
        where: {
          id: order.id,
          status: "PENDING",
          paymentStatus: "PENDING",
        },
        data: {
          status: "CANCELLED",
          paymentStatus: "FAILED",
        },
      });

      if (updated.count === 0) return;

      for (const item of order.items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { stockQuantity: { increment: item.quantity } },
        });
      }

      await tx.payment.updateMany({
        where: { orderId: order.id, status: "PENDING" },
        data: { status: "FAILED" },
      });
    });

    return NextResponse.json({ released: true });
  } catch (err) {
    console.error("Razorpay cancel release error:", err);
    return NextResponse.json(
      { error: "Unable to release pending order." },
      { status: 500 }
    );
  }
}

