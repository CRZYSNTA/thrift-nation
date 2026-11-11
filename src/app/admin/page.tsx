import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import {
  trySealAdminOrdersQuery,
  type LiveAdminOrderRow,
} from "@/lib/realtime";
import { AdminShell } from "@/components/admin/AdminShell";
import { LiveAdminOrdersFeed } from "@/components/admin/LiveAdminOrdersFeed";
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
    sealedOrdersQuery,
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
      take: 10,
      select: {
        id: true,
        orderNumber: true,
        status: true,
        paymentMethod: true,
        paymentStatus: true,
        total: true,
        customerName: true,
        createdAt: true,
      },
    }),
    trySealAdminOrdersQuery(),
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

  const initialOrders: LiveAdminOrderRow[] = recentOrders.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    total: o.total,
    customerName: o.customerName,
    createdAt: o.createdAt.toISOString(),
  }));

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

      <LiveAdminOrdersFeed
        initialOrders={initialOrders}
        sealedQuery={sealedOrdersQuery}
      />
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
