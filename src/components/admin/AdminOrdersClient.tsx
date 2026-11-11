"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { formatINR } from "@/lib/utils";
import type { OrderStatus, PaymentMethod, PaymentStatus } from "@prisma/client";

export interface AdminOrderRow {
  id: string;
  orderNumber: string;
  status: OrderStatus;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  total: number;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  shippingAddress: string;
  shippingCity: string;
  shippingState: string;
  shippingPincode: string;
  trackingCarrier: string | null;
  trackingNumber: string | null;
  createdAt: string;
  items: Array<{
    id: string;
    productName: string;
    size: string;
    quantity: number;
    price: number;
  }>;
}

const ORDER_STATUSES: OrderStatus[] = [
  "PENDING",
  "CONFIRMED",
  "PROCESSING",
  "SHIPPED",
  "DELIVERED",
  "CANCELLED",
];

const PAYMENT_STATUSES: PaymentStatus[] = [
  "PENDING",
  "PAID",
  "COD_PENDING",
  "FAILED",
  "REFUNDED",
];

export function AdminOrdersClient({
  initialOrders,
}: {
  initialOrders: AdminOrderRow[];
}) {
  const router = useRouter();
  const [orders, setOrders] = useState<AdminOrderRow[]>(initialOrders);
  const [savingId, setSavingId] = useState<string | null>(null);

  async function updateOrder(
    orderId: string,
    patch: {
      status?: OrderStatus;
      paymentStatus?: PaymentStatus;
      trackingCarrier?: string;
      trackingNumber?: string;
    }
  ) {
    setSavingId(orderId);
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, ...patch }),
      });
      if (res.ok) {
        const data = await res.json();
        setOrders((prev) =>
          prev.map((o) =>
            o.id === orderId
              ? {
                  ...o,
                  status: data.order.status,
                  paymentStatus: data.order.paymentStatus,
                  trackingCarrier: data.order.trackingCarrier,
                  trackingNumber: data.order.trackingNumber,
                }
              : o
          )
        );
        router.refresh();
      }
    } finally {
      setSavingId(null);
    }
  }

  if (orders.length === 0) {
    return (
      <div className="border border-charcoal/12 bg-white p-12 text-center text-sm text-charcoal/65">
        No customer orders have been placed yet.
      </div>
    );
  }

  return (
    <div className="space-y-5">
      {orders.map((order) => (
        <div
          key={order.id}
          className="border border-charcoal/12 bg-white p-6 space-y-5 text-xs"
        >
          <div className="flex flex-wrap items-start justify-between gap-4 border-b border-charcoal/10 pb-4">
            <div>
              <p className="text-sm font-medium text-charcoal">
                {order.orderNumber}
              </p>
              <p className="mt-1 text-charcoal/65">
                {new Date(order.createdAt).toLocaleString("en-IN")} ·{" "}
                {order.paymentMethod}
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-3">
              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-charcoal/55 mb-1">
                  Order Status
                </label>
                <select
                  value={order.status}
                  disabled={savingId === order.id}
                  onChange={(e) =>
                    updateOrder(order.id, {
                      status: e.target.value as OrderStatus,
                    })
                  }
                  className="border border-charcoal/25 bg-ivory/40 px-2.5 py-1.5 text-xs"
                >
                  {ORDER_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-[10px] uppercase tracking-[0.12em] text-charcoal/55 mb-1">
                  Payment Status
                </label>
                <select
                  value={order.paymentStatus}
                  disabled={savingId === order.id}
                  onChange={(e) =>
                    updateOrder(order.id, {
                      paymentStatus: e.target.value as PaymentStatus,
                    })
                  }
                  className="border border-charcoal/25 bg-ivory/40 px-2.5 py-1.5 text-xs"
                >
                  {PAYMENT_STATUSES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
              </div>

              <div className="text-right pl-2">
                <span className="block text-[10px] uppercase tracking-[0.12em] text-charcoal/55">
                  Total
                </span>
                <span className="text-base font-medium tabular-nums text-charcoal">
                  {formatINR(order.total)}
                </span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-1 gap-6 md:grid-cols-2">
            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-charcoal/55">
                Customer &amp; Delivery
              </p>
              <p className="mt-1.5 font-medium text-charcoal">
                {order.customerName}
              </p>
              <p className="text-charcoal/70">
                {order.customerEmail} · {order.customerPhone}
              </p>
              <p className="mt-1 text-charcoal/70">
                {order.shippingAddress}, {order.shippingCity},{" "}
                {order.shippingState} — {order.shippingPincode}
              </p>
            </div>

            <div>
              <p className="text-[10px] font-medium uppercase tracking-[0.14em] text-charcoal/55">
                Items ({order.items.length})
              </p>
              <ul className="mt-1.5 space-y-1">
                {order.items.map((item) => (
                  <li key={item.id} className="flex justify-between">
                    <span>
                      {item.productName} (Size {item.size}) × {item.quantity}
                    </span>
                    <span className="tabular-nums font-medium">
                      {formatINR(item.price * item.quantity)}
                    </span>
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Tracking & Cancel */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              const fd = new FormData(e.currentTarget);
              updateOrder(order.id, {
                trackingCarrier: String(fd.get("carrier") || ""),
                trackingNumber: String(fd.get("tracking") || ""),
              });
            }}
            className="flex flex-wrap items-center justify-between gap-3 border-t border-charcoal/10 pt-4"
          >
            <div className="flex flex-wrap items-center gap-2">
              <input
                name="carrier"
                defaultValue={order.trackingCarrier ?? ""}
                placeholder="Courier (e.g. BlueDart)"
                className="border border-charcoal/25 bg-ivory/30 px-3 py-1.5 text-xs"
              />
              <input
                name="tracking"
                defaultValue={order.trackingNumber ?? ""}
                placeholder="Tracking AWB Number"
                className="border border-charcoal/25 bg-ivory/30 px-3 py-1.5 text-xs"
              />
              <button
                type="submit"
                disabled={savingId === order.id}
                className="border border-charcoal px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] hover:bg-charcoal hover:text-ivory transition-colors"
              >
                Save Tracking
              </button>
            </div>

            {order.status !== "CANCELLED" && (
              <button
                type="button"
                onClick={() => updateOrder(order.id, { status: "CANCELLED" })}
                className="border border-red-300 px-3.5 py-1.5 text-[11px] font-medium uppercase tracking-[0.12em] text-red-700 hover:bg-red-50"
              >
                Cancel &amp; Restock
              </button>
            )}
          </form>
        </div>
      ))}
    </div>
  );
}

