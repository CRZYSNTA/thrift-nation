"use client";

import { useCallback, useState } from "react";
import Link from "next/link";
import type { SealedLiveQuery } from "@neon/realtime/client";
import { useLiveQuery } from "@neon/realtime-react";
import { useRealtimeEnabled } from "@/components/providers/RealtimeRoot";
import type { LiveAdminOrderRow } from "@/lib/realtime";
import { formatINR } from "@/lib/utils";

let adminSignedOut = false;

function LiveOrdersTable({
  initialOrders,
  sealedQuery,
}: {
  initialOrders: LiveAdminOrderRow[];
  sealedQuery: SealedLiveQuery<LiveAdminOrderRow>;
}) {
  const [query] = useState(sealedQuery);

  const refreshQuery = useCallback(async () => {
    if (adminSignedOut) {
      throw new Error("Signed out");
    }
    const res = await fetch("/api/realtime/admin-orders", {
      method: "POST",
    });
    if (res.status === 401 || res.status === 403) {
      adminSignedOut = true;
      window.location.reload();
      throw new Error("Unauthorized");
    }
    if (!res.ok) {
      throw new Error(`Could not refresh orders live query (${res.status})`);
    }
    return (await res.json()) as SealedLiveQuery<LiveAdminOrderRow>;
  }, []);

  const { data, status } = useLiveQuery(query, {
    refreshQuery,
    initialData: initialOrders,
  });

  const rows = data ?? initialOrders;

  return (
    <OrdersTableShell
      rows={rows}
      badge={
        <span className="inline-flex items-center gap-1.5 text-[10px] tracking-[0.14em] uppercase text-olive">
          <span className="h-1.5 w-1.5 rounded-full bg-olive animate-pulse" />
          {status === "live" ? "Live Sync" : status}
        </span>
      }
    />
  );
}

function OrdersTableShell({
  rows,
  badge,
}: {
  rows: readonly LiveAdminOrderRow[];
  badge?: React.ReactNode;
}) {
  return (
    <div className="mt-8 border border-charcoal/12 bg-white p-6">
      <div className="flex items-center justify-between pb-4 border-b border-charcoal/10">
        <div className="flex items-center gap-3">
          <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-charcoal">
            Recent Orders
          </h2>
          {badge}
        </div>
        <Link
          href="/admin/orders"
          className="text-[11px] uppercase tracking-[0.14em] text-olive hover:underline"
        >
          Manage All Orders
        </Link>
      </div>

      {rows.length === 0 ? (
        <p className="py-8 text-sm text-charcoal/60">
          No orders recorded yet.
        </p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead>
              <tr className="border-b border-charcoal/10 text-[10px] tracking-[0.14em] uppercase text-charcoal/55">
                <th className="py-3 pr-4">Order</th>
                <th className="py-3 pr-4">Customer</th>
                <th className="py-3 pr-4">Payment</th>
                <th className="py-3 pr-4">Status</th>
                <th className="py-3 text-right">Total</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-charcoal/10">
              {rows.map((o) => (
                <tr key={o.id}>
                  <td className="py-3.5 pr-4 font-medium text-charcoal">
                    {o.orderNumber}
                  </td>
                  <td className="py-3.5 pr-4 text-charcoal/75">
                    {o.customerName}
                  </td>
                  <td className="py-3.5 pr-4 text-charcoal/70">
                    {o.paymentMethod} · {o.paymentStatus}
                  </td>
                  <td className="py-3.5 pr-4">
                    <span className="border border-charcoal/20 px-2 py-0.5 text-[10px] uppercase tracking-[0.12em]">
                      {o.status}
                    </span>
                  </td>
                  <td className="py-3.5 text-right font-medium tabular-nums">
                    {formatINR(Number(o.total))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

export function LiveAdminOrdersFeed({
  initialOrders,
  sealedQuery,
}: {
  initialOrders: LiveAdminOrderRow[];
  sealedQuery: SealedLiveQuery<LiveAdminOrderRow> | null;
}) {
  const realtimeEnabled = useRealtimeEnabled();
  if (!realtimeEnabled || !sealedQuery) {
    return <OrdersTableShell rows={initialOrders} />;
  }

  return (
    <LiveOrdersTable
      key={sealedQuery.queryFingerprint}
      initialOrders={initialOrders}
      sealedQuery={sealedQuery}
    />
  );
}

