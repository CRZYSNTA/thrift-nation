import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { auth } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getRazorpayClient, isRazorpayConfigured } from "@/lib/razorpay";
import { generateOrderNumber } from "@/lib/utils";
import { DEFAULT_SITE_SETTINGS } from "@/lib/seed-data";

const checkoutSchema = z.object({
  customerName: z.string().min(2, "Full name is required.").max(100),
  customerPhone: z
    .string()
    .regex(/^(\+91[\-\s]?)?[6-9]\d{9}$/, "Please enter a valid 10-digit Indian mobile number."),
  customerEmail: z.string().email("Please enter a valid email address."),
  shippingAddress: z.string().min(5, "Delivery address is required.").max(300),
  shippingCity: z.string().min(2, "City is required.").max(80),
  shippingState: z.string().min(2, "State is required.").max(80),
  shippingPincode: z
    .string()
    .regex(/^[1-9][0-9]{5}$/, "Please enter a valid 6-digit PIN code."),
  paymentMethod: z.enum(["RAZORPAY", "COD"]),
  couponCode: z.string().optional().nullable(),
  items: z
    .array(
      z.object({
        productId: z.string().min(1),
        quantity: z.number().int().positive().max(10),
      })
    )
    .min(1, "Your bag is empty."),
});

export async function POST(req: NextRequest) {
  try {
    if (!isDatabaseConfigured) {
      return NextResponse.json(
        {
          error:
            "PostgreSQL database is not configured. Set DATABASE_URL and run migrations to place orders.",
        },
        { status: 503 }
      );
    }

    const body = await req.json();
    const parsed = checkoutSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json(
        { error: parsed.error.issues[0]?.message || "Invalid checkout fields." },
        { status: 400 }
      );
    }

    const data = parsed.data;
    const session = await auth();

    if (data.paymentMethod === "RAZORPAY" && !isRazorpayConfigured()) {
      return NextResponse.json(
        {
          error:
            "Razorpay online payment gateway is not configured yet (missing RAZORPAY_KEY_ID / RAZORPAY_KEY_SECRET).",
        },
        { status: 503 }
      );
    }

    const settingsRow = await prisma.siteSettings.findUnique({
      where: { id: "default" },
    });
    const freeThreshold =
      settingsRow?.freeShippingThreshold ??
      DEFAULT_SITE_SETTINGS.freeShippingThreshold;
    const standardShippingFee =
      settingsRow?.standardShippingFee ??
      DEFAULT_SITE_SETTINGS.standardShippingFee;
    const codEnabled =
      settingsRow?.codEnabled ?? DEFAULT_SITE_SETTINGS.codEnabled;
    const codFee = settingsRow?.codFee ?? DEFAULT_SITE_SETTINGS.codFee;
    const razorpayEnabled =
      settingsRow?.razorpayEnabled ?? DEFAULT_SITE_SETTINGS.razorpayEnabled;

    if (data.paymentMethod === "COD" && !codEnabled) {
      return NextResponse.json(
        { error: "Cash on Delivery is currently disabled." },
        { status: 400 }
      );
    }
    if (data.paymentMethod === "RAZORPAY" && !razorpayEnabled) {
      return NextResponse.json(
        { error: "Online payments are currently disabled." },
        { status: 400 }
      );
    }

    // Deduplicate requested items by productId
    const qtyByProduct = new Map<string, number>();
    for (const item of data.items) {
      qtyByProduct.set(
        item.productId,
        (qtyByProduct.get(item.productId) ?? 0) + item.quantity
      );
    }
    const productIds = Array.from(qtyByProduct.keys());

    const result = await prisma.$transaction(async (tx) => {
      const dbProducts = await tx.product.findMany({
        where: { id: { in: productIds } },
        include: {
          images: { orderBy: { sortOrder: "asc" }, take: 1 },
        },
      });

      if (dbProducts.length !== productIds.length) {
        throw new Error("PRODUCT_NOT_FOUND");
      }

      let subtotal = 0;
      const orderItemsPayload: Array<{
        productId: string;
        productName: string;
        productSlug: string;
        productImage: string | null;
        productSku: string;
        size: string;
        condition: (typeof dbProducts)[number]["condition"];
        quantity: number;
        price: number;
      }> = [];

      for (const product of dbProducts) {
        const requestedQty = qtyByProduct.get(product.id) ?? 0;

        // Atomic conditional decrement to prevent double-purchase of unique 1-of-1 garments
        const updated = await tx.product.updateMany({
          where: {
            id: product.id,
            published: true,
            stockQuantity: { gte: requestedQty },
          },
          data: {
            stockQuantity: { decrement: requestedQty },
          },
        });

        if (updated.count === 0) {
          throw new Error(`OUT_OF_STOCK:${product.name}`);
        }

        subtotal += product.price * requestedQty;
        orderItemsPayload.push({
          productId: product.id,
          productName: product.name,
          productSlug: product.slug,
          productImage: product.images[0]?.url ?? null,
          productSku: product.sku,
          size: product.size,
          condition: product.condition,
          quantity: requestedQty,
          price: product.price,
        });
      }

      // Validate coupon server-side
      let discount = 0;
      let appliedCouponCode: string | null = null;
      if (data.couponCode?.trim()) {
        const code = data.couponCode.trim().toUpperCase();
        const coupon = await tx.coupon.findUnique({ where: { code } });
        if (
          coupon &&
          coupon.active &&
          (!coupon.expiresAt || coupon.expiresAt >= new Date()) &&
          (!coupon.usageLimit || coupon.usedCount < coupon.usageLimit) &&
          subtotal >= coupon.minOrderAmount
        ) {
          discount =
            coupon.discountType === "PERCENTAGE"
              ? Math.round((subtotal * coupon.discountValue) / 100)
              : coupon.discountValue;
          if (coupon.maxDiscount) {
            discount = Math.min(discount, coupon.maxDiscount);
          }
          discount = Math.min(discount, subtotal);
          appliedCouponCode = coupon.code;

          await tx.coupon.update({
            where: { id: coupon.id },
            data: { usedCount: { increment: 1 } },
          });
        }
      }

      const discountedSubtotal = Math.max(0, subtotal - discount);
      const baseShipping =
        discountedSubtotal >= freeThreshold ? 0 : standardShippingFee;
      const shippingFee =
        data.paymentMethod === "COD" ? baseShipping + codFee : baseShipping;
      const total = discountedSubtotal + shippingFee;
      const orderNumber = generateOrderNumber();

      const order = await tx.order.create({
        data: {
          orderNumber,
          userId: session?.user?.id ?? null,
          status: data.paymentMethod === "COD" ? "CONFIRMED" : "PENDING",
          paymentMethod: data.paymentMethod,
          paymentStatus:
            data.paymentMethod === "COD" ? "COD_PENDING" : "PENDING",
          subtotal,
          discount,
          shippingFee,
          total,
          couponCode: appliedCouponCode,
          customerName: data.customerName.trim(),
          customerEmail: data.customerEmail.toLowerCase().trim(),
          customerPhone: data.customerPhone.trim(),
          shippingAddress: data.shippingAddress.trim(),
          shippingCity: data.shippingCity.trim(),
          shippingState: data.shippingState.trim(),
          shippingPincode: data.shippingPincode.trim(),
          items: {
            create: orderItemsPayload,
          },
        },
      });

      if (data.paymentMethod === "COD") {
        await tx.payment.create({
          data: {
            orderId: order.id,
            provider: "COD",
            amount: total,
            currency: "INR",
            status: "COD_PENDING",
          },
        });
      }

      return { order, total };
    });

    if (data.paymentMethod === "COD") {
      return NextResponse.json({
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        paymentMethod: "COD",
      });
    }

    // Create Razorpay Order after stock reservation succeeds
    try {
      const razorpay = getRazorpayClient();
      const rpOrder = await razorpay.orders.create({
        amount: result.total * 100,
        currency: "INR",
        receipt: result.order.orderNumber,
        notes: {
          orderId: result.order.id,
          orderNumber: result.order.orderNumber,
        },
      });

      await prisma.payment.create({
        data: {
          orderId: result.order.id,
          provider: "RAZORPAY",
          razorpayOrderId: rpOrder.id,
          amount: result.total,
          currency: "INR",
          status: "PENDING",
        },
      });

      return NextResponse.json({
        orderId: result.order.id,
        orderNumber: result.order.orderNumber,
        paymentMethod: "RAZORPAY",
        razorpayOrderId: rpOrder.id,
        amount: rpOrder.amount,
        currency: rpOrder.currency,
        keyId: process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || process.env.RAZORPAY_KEY_ID,
      });
    } catch (rpErr) {
      // Roll back reserved stock & cancel pending order if Razorpay order creation failed
      await prisma.$transaction(async (tx) => {
        const items = await tx.orderItem.findMany({
          where: { orderId: result.order.id },
        });
        for (const item of items) {
          await tx.product.update({
            where: { id: item.productId },
            data: { stockQuantity: { increment: item.quantity } },
          });
        }
        await tx.order.update({
          where: { id: result.order.id },
          data: { status: "CANCELLED", paymentStatus: "FAILED" },
        });
      });
      console.error("Razorpay order creation failed:", rpErr);
      return NextResponse.json(
        { error: "Unable to initiate Razorpay payment. Please try again." },
        { status: 502 }
      );
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : "";
    if (message.startsWith("OUT_OF_STOCK:")) {
      const name = message.replace("OUT_OF_STOCK:", "");
      return NextResponse.json(
        {
          error: `"${name}" is no longer available in the requested quantity. Unique thrift pieces cannot be double-purchased.`,
        },
        { status: 409 }
      );
    }
    if (message === "PRODUCT_NOT_FOUND") {
      return NextResponse.json(
        { error: "One or more items in your bag are no longer listed." },
        { status: 404 }
      );
    }
    console.error("Checkout error:", err);
    return NextResponse.json(
      { error: "Checkout failed. Please review your details and try again." },
      { status: 500 }
    );
  }
}

