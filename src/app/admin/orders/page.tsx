import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminOrdersClient,
  type AdminOrderRow,
} from "@/components/admin/AdminOrdersClient";

async function AdminOrdersContent() {
  try {
    await requireAdminSession();
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") redirect("/");
    redirect("/login?callbackUrl=/admin/orders");
  }

  if (!isDatabaseConfigured) {
    return (
      <AdminShell title="Order Management">
        <div className="border border-charcoal/15 bg-white p-8 text-sm text-charcoal/75">
          Configure `DATABASE_URL` to manage customer orders.
        </div>
      </AdminShell>
    );
  }

  const rows = await prisma.order.findMany({
    include: { items: true },
    orderBy: { createdAt: "desc" },
  });

  const initialOrders: AdminOrderRow[] = rows.map((o) => ({
    id: o.id,
    orderNumber: o.orderNumber,
    status: o.status,
    paymentMethod: o.paymentMethod,
    paymentStatus: o.paymentStatus,
    total: o.total,
    customerName: o.customerName,
    customerEmail: o.customerEmail,
    customerPhone: o.customerPhone,
    shippingAddress: o.shippingAddress,
    shippingCity: o.shippingCity,
    shippingState: o.shippingState,
    shippingPincode: o.shippingPincode,
    trackingCarrier: o.trackingCarrier,
    trackingNumber: o.trackingNumber,
    createdAt: o.createdAt.toISOString(),
    items: o.items.map((i) => ({
      id: i.id,
      productName: i.productName,
      size: i.size,
      quantity: i.quantity,
      price: i.price,
    })),
  }));

  return (
    <AdminShell
      title="Order Management"
      subtitle="Verify payments, update fulfillment stages, add courier tracking, or cancel & restock."
    >
      <AdminOrdersClient initialOrders={initialOrders} />
    </AdminShell>
  );
}

export default function AdminOrdersPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-12">
          <div className="h-96 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <AdminOrdersContent />
    </Suspense>
  );
}

