import { Suspense } from "react";
import Link from "next/link";
import { notFound } from "next/navigation";
import { CheckCircle2 } from "lucide-react";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { CONDITION_LABELS, formatINR } from "@/lib/utils";

async function OrderConfirmationContent({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  const { orderNumber } = await params;

  if (!isDatabaseConfigured) {
    notFound();
  }

  const order = await prisma.order.findUnique({
    where: { orderNumber },
    include: { items: true },
  });

  if (!order) {
    notFound();
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-16 sm:px-8 lg:py-24">
      <div className="border border-charcoal/15 bg-white p-8 sm:p-12">
        <div className="flex items-center gap-3 text-olive">
          <CheckCircle2 className="h-6 w-6 stroke-[1.5]" />
          <span className="text-[11px] font-medium tracking-[0.2em] uppercase">
            Order Confirmed
          </span>
        </div>

        <h1 className="mt-4 font-editorial text-4xl sm:text-5xl text-charcoal">
          Thank you, {order.customerName.split(" ")[0]}.
        </h1>
        <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
          Your archive order{" "}
          <span className="font-medium text-charcoal">{order.orderNumber}</span>{" "}
          has been confirmed. A dispatch update will be sent to{" "}
          <span className="text-charcoal">{order.customerEmail}</span>.
        </p>

        <div className="mt-8 grid grid-cols-2 gap-6 border-y border-charcoal/12 py-6 text-xs sm:grid-cols-4">
          <div>
            <span className="block text-[10px] tracking-[0.15em] uppercase text-charcoal/55">
              Order Number
            </span>
            <span className="mt-1 block font-medium text-charcoal">
              {order.orderNumber}
            </span>
          </div>
          <div>
            <span className="block text-[10px] tracking-[0.15em] uppercase text-charcoal/55">
              Payment Method
            </span>
            <span className="mt-1 block font-medium text-charcoal">
              {order.paymentMethod}
            </span>
          </div>
          <div>
            <span className="block text-[10px] tracking-[0.15em] uppercase text-charcoal/55">
              Payment Status
            </span>
            <span className="mt-1 block font-medium text-olive">
              {order.paymentStatus}
            </span>
          </div>
          <div>
            <span className="block text-[10px] tracking-[0.15em] uppercase text-charcoal/55">
              Total
            </span>
            <span className="mt-1 block font-medium tabular-nums text-charcoal">
              {formatINR(order.total)}
            </span>
          </div>
        </div>

        <div className="mt-8 space-y-4">
          <h2 className="text-[11px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
            Curated Pieces
          </h2>
          <ul className="divide-y divide-charcoal/10">
            {order.items.map((item) => (
              <li
                key={item.id}
                className="flex items-center justify-between py-3 text-sm"
              >
                <div>
                  <p className="text-charcoal">{item.productName}</p>
                  <p className="text-xs text-charcoal/60">
                    Size {item.size} · {CONDITION_LABELS[item.condition]} · Qty{" "}
                    {item.quantity}
                  </p>
                </div>
                <span className="font-medium tabular-nums text-charcoal">
                  {formatINR(item.price * item.quantity)}
                </span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-8 border-t border-charcoal/12 pt-6 text-xs text-charcoal/70">
          <p className="font-medium uppercase tracking-[0.14em] text-charcoal">
            Shipping To
          </p>
          <p className="mt-2">
            {order.customerName} · {order.customerPhone}
          </p>
          <p>
            {order.shippingAddress}, {order.shippingCity}, {order.shippingState}{" "}
            — {order.shippingPincode}
          </p>
        </div>

        <div className="mt-10 flex flex-wrap gap-3">
          <Link
            href="/account/orders"
            className="bg-charcoal px-7 py-3.5 text-xs font-medium tracking-[0.16em] uppercase text-ivory"
          >
            View Order History
          </Link>
          <Link
            href="/new-arrivals"
            className="border border-charcoal/25 px-7 py-3.5 text-xs font-medium tracking-[0.16em] uppercase text-charcoal hover:border-charcoal"
          >
            Continue Browsing
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function OrderConfirmationPage({
  params,
}: {
  params: Promise<{ orderNumber: string }>;
}) {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-3xl px-4 py-20">
          <div className="h-80 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <OrderConfirmationContent params={params} />
    </Suspense>
  );
}

