import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/account/AccountShell";
import { CONDITION_LABELS, formatINR } from "@/lib/utils";

async function OrdersContent() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/orders");
  }

  const orders = isDatabaseConfigured
    ? await prisma.order
        .findMany({
          where: { userId: session.user.id },
          include: { items: true },
          orderBy: { createdAt: "desc" },
        })
        .catch(() => [])
    : [];

  return (
    <AccountShell
      title="Order History"
      userName={session.user.name}
      userEmail={session.user.email}
    >
      {orders.length === 0 ? (
        <div className="border border-charcoal/12 bg-white p-12 text-center">
          <p className="font-editorial text-3xl text-charcoal">No orders yet</p>
          <p className="mt-2 text-xs text-charcoal/65">
            Once you claim a curated garment, your tracking and invoice details
            will appear here.
          </p>
          <Link
            href="/new-arrivals"
            className="mt-6 inline-block bg-charcoal px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase text-ivory"
          >
            Browse Archive
          </Link>
        </div>
      ) : (
        <div className="space-y-6">
          {orders.map((order) => (
            <div
              key={order.id}
              className="border border-charcoal/12 bg-white p-6 space-y-5"
            >
              <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/10 pb-4 text-xs">
                <div>
                  <p className="font-medium text-charcoal">
                    Order {order.orderNumber}
                  </p>
                  <p className="mt-0.5 text-charcoal/60">
                    Placed on{" "}
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "long",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex flex-wrap items-center gap-3">
                  <span className="border border-charcoal/20 px-3 py-1 text-[10px] tracking-[0.14em] uppercase">
                    {order.status}
                  </span>
                  <span className="border border-olive/35 px-3 py-1 text-[10px] tracking-[0.14em] uppercase text-olive">
                    {order.paymentMethod} · {order.paymentStatus}
                  </span>
                  <span className="text-sm font-medium tabular-nums text-charcoal">
                    {formatINR(order.total)}
                  </span>
                </div>
              </div>

              <ul className="divide-y divide-charcoal/10">
                {order.items.map((item) => (
                  <li
                    key={item.id}
                    className="flex items-center justify-between py-3 text-xs"
                  >
                    <div>
                      <Link
                        href={`/product/${item.productSlug}`}
                        className="text-sm text-charcoal hover:text-olive"
                      >
                        {item.productName}
                      </Link>
                      <p className="mt-0.5 text-charcoal/60">
                        Size {item.size} · {CONDITION_LABELS[item.condition]} ·
                        Qty {item.quantity}
                      </p>
                    </div>
                    <span className="tabular-nums font-medium text-charcoal">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>

              {order.trackingNumber && (
                <div className="bg-sand/35 px-4 py-3 text-xs text-charcoal/80">
                  Tracking: {order.trackingCarrier || "Courier"} —{" "}
                  <span className="font-medium">{order.trackingNumber}</span>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </AccountShell>
  );
}

export default function OrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-16">
          <div className="h-80 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <OrdersContent />
    </Suspense>
  );
}

