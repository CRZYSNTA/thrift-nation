import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatINR } from "@/lib/utils";

async function AdminOverviewContent() {
  try {
    await requireAdminSession();
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") {
      redirect("/");
    }
    redirect("/login?callbackUrl=/admin");
  }

  if (!isDatabaseConfigured) {
    return (
      <AdminShell
        title="Executive Overview"
        subtitle="Connect PostgreSQL DATABASE_URL and run migrations to enable live metrics."
      >
        <div className="border border-charcoal/15 bg-white p-8 text-sm text-charcoal/75">
          Database is currently unconfigured (`DATABASE_URL` missing). Set
          `DATABASE_URL` in `.env`, run `npx prisma migrate dev`, and run `npm
          run db:seed` to populate live admin metrics.
        </div>
      </AdminShell>
    );
  }

  const [
    paidOrdersAgg,
    totalOrders,
    pendingOrders,
    totalCustomers,
    activeProducts,
    outOfStockProducts,
    recentOrders,
  ] = await Promise.all([
    prisma.order.aggregate({
      where: {
        status: { not: "CANCELLED" },
        OR: [{ paymentStatus: "PAID" }, { paymentMethod: "COD" }],
      },
      _sum: { total: true },
    }),
    prisma.order.count(),
    prisma.order.count({
      where: { status: { in: ["PENDING", "CONFIRMED", "PROCESSING"] } },
    }),
    prisma.user.count({ where: { role: "CUSTOMER" } }),
    prisma.product.count({
      where: { published: true, stockQuantity: { gt: 0 } },
    }),
    prisma.product.count({ where: { stockQuantity: { lte: 0 } } }),
    prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      take: 6,
      include: { items: true },
    }),
  ]);

  const metrics = [
    {
      label: "Total Revenue",
      value: formatINR(paidOrdersAgg._sum.total ?? 0),
    },
    { label: "Total Orders", value: String(totalOrders) },
    { label: "Pending Fulfillment", value: String(pendingOrders) },
    { label: "Total Customers", value: String(totalCustomers) },
    { label: "Active Archive Pieces", value: String(activeProducts) },
    { label: "Out of Stock / Claimed", value: String(outOfStockProducts) },
  ];

  return (
    <AdminShell
      title="Executive Overview"
      subtitle="Live performance across inventory, orders, and client activity."
    >
      <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
        {metrics.map((m) => (
          <div key={m.label} className="border border-charcoal/12 bg-white p-5">
            <p className="text-[10px] font-medium tracking-[0.16em] uppercase text-charcoal/55">
              {m.label}
            </p>
            <p className="mt-2 font-editorial text-3xl sm:text-4xl text-charcoal tabular-nums">
              {m.value}
            </p>
          </div>
        ))}
      </div>

      <div className="mt-8 border border-charcoal/12 bg-white p-6">
        <div className="flex items-center justify-between pb-4 border-b border-charcoal/10">
          <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-charcoal">
            Recent Orders
          </h2>
          <Link
            href="/admin/orders"
            className="text-[11px] uppercase tracking-[0.14em] text-olive hover:underline"
          >
            Manage All Orders
          </Link>
        </div>

        {recentOrders.length === 0 ? (
          <p className="py-8 text-sm text-charcoal/60">No orders recorded yet.</p>
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
                {recentOrders.map((o) => (
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
                      {formatINR(o.total)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </AdminShell>
  );
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-12">
          <div className="h-96 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <AdminOverviewContent />
    </Suspense>
  );
}

