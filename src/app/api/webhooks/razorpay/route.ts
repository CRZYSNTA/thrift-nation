import { NextRequest, NextResponse } from "next/server";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { verifyRazorpayWebhookSignature } from "@/lib/razorpay";

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const rawBody = await req.text();
    const signature = req.headers.get("x-razorpay-signature") ?? "";

    if (!verifyRazorpayWebhookSignature(rawBody, signature)) {
      return NextResponse.json(
        { error: "Invalid webhook signature" },
        { status: 400 }
      );
    }

    const event = JSON.parse(rawBody);
    const eventType: string | undefined = event?.event;
    const paymentEntity = event?.payload?.payment?.entity;

    if (!paymentEntity?.order_id) {
      return NextResponse.json({ received: true });
    }

    const payment = await prisma.payment.findUnique({
      where: { razorpayOrderId: paymentEntity.order_id },
      include: { order: { include: { items: true } } },
    });

    if (!payment) {
      return NextResponse.json({ received: true });
    }

    if (eventType === "payment.captured" || eventType === "order.paid") {
      await prisma.$transaction([
        prisma.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: paymentEntity.id,
            status: "PAID",
            rawPayload: event,
          },
        }),
        prisma.order.update({
          where: { id: payment.orderId },
          data: {
            status:
              payment.order.status === "PENDING"
                ? "CONFIRMED"
                : payment.order.status,
            paymentStatus: "PAID",
          },
        }),
      ]);
    } else if (eventType === "payment.failed") {
      await prisma.$transaction(async (tx) => {
        const updated = await tx.order.updateMany({
          where: {
            id: payment.orderId,
            status: "PENDING",
            paymentStatus: "PENDING",
          },
          data: {
            status: "CANCELLED",
            paymentStatus: "FAILED",
          },
        });

        if (updated.count > 0) {
          for (const item of payment.order.items) {
            await tx.product.update({
              where: { id: item.productId },
              data: { stockQuantity: { increment: item.quantity } },
            });
          }
        }

        await tx.payment.update({
          where: { id: payment.id },
          data: {
            razorpayPaymentId: paymentEntity.id,
            status: "FAILED",
            rawPayload: event,
          },
        });
      });
    }

    return NextResponse.json({ received: true });
  } catch (err) {
    console.error("Razorpay webhook error:", err);
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    );
  }
}

