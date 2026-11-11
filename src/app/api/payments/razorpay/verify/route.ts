import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import {
  getRazorpayClient,
  verifyRazorpayPaymentSignature,
} from "@/lib/razorpay";

const verifySchema = z.object({
  orderId: z.string().min(1),
  razorpay_order_id: z.string().min(1),
  razorpay_payment_id: z.string().min(1),
  razorpay_signature: z.string().min(1),
});

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json(
        { error: "Database not configured." },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = verifySchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: "Invalid payment verification payload." },
        { status: 400 }
      );
    }

    const { orderId, razorpay_order_id, razorpay_payment_id, razorpay_signature } =
      parsed.data;

    // 1. Cryptographic signature verification
    const signatureValid = verifyRazorpayPaymentSignature({
      razorpayOrderId: razorpay_order_id,
      razorpayPaymentId: razorpay_payment_id,
      razorpaySignature: razorpay_signature,
    });

    if (!signatureValid) {
      return NextResponse.json(
        { error: "Payment signature verification failed." },
        { status: 400 }
      );
    }

    const paymentRecord = await prisma.payment.findUnique({
      where: { razorpayOrderId: razorpay_order_id },
      include: { order: true },
    });

    if (!paymentRecord || paymentRecord.orderId !== orderId) {
      return NextResponse.json(
        { error: "Matching order payment record not found." },
        { status: 404 }
      );
    }

    // 2. Independent server-side fetch from Razorpay API
    const razorpay = getRazorpayClient();
    const rpPayment = await razorpay.payments.fetch(razorpay_payment_id);

    if (
      rpPayment.order_id !== razorpay_order_id ||
      (rpPayment.status !== "captured" && rpPayment.status !== "authorized") ||
      Number(rpPayment.amount) !== paymentRecord.amount * 100
    ) {
      return NextResponse.json(
        { error: "Payment verification with Razorpay gateway failed." },
        { status: 400 }
      );
    }

    await prisma.$transaction([
      prisma.payment.update({
        where: { id: paymentRecord.id },
        data: {
          razorpayPaymentId: razorpay_payment_id,
          razorpaySignature: razorpay_signature,
          status: "PAID",
          rawPayload: rpPayment as unknown as object,
        },
      }),
      prisma.order.update({
        where: { id: orderId },
        data: {
          status: "CONFIRMED",
          paymentStatus: "PAID",
        },
      }),
    ]);

    return NextResponse.json({
      verified: true,
      orderNumber: paymentRecord.order.orderNumber,
    });
  } catch (err) {
    console.error("Razorpay verification error:", err);
    return NextResponse.json(
      { error: "Unable to verify payment." },
      { status: 500 }
    );
  }
}

