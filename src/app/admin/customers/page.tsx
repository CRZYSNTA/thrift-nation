import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import { formatINR } from "@/lib/utils";

async function AdminCustomersContent() {
  try {
    await requireAdminSession();
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") redirect("/");
    redirect("/login?callbackUrl=/admin/customers");
  }

  if (!isDatabaseConfigured) {
    return (
      <AdminShell title="Customer Management">
        <div className="border border-charcoal/15 bg-white p-8 text-sm text-charcoal/75">
          Configure `DATABASE_URL` to view customer profiles.
        </div>
      </AdminShell>
    );
  }

  const customers = await prisma.user.findMany({
    where: { role: "CUSTOMER" },
    include: {
      orders: {
        select: {
          id: true,
          orderNumber: true,
          total: true,
          status: true,
          createdAt: true,
        },
        orderBy: { createdAt: "desc" },
      },
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <AdminShell
      title="Customer Management"
      subtitle="Client directory, contact records, and historical order value."
    >
      <div className="overflow-x-auto border border-charcoal/12 bg-white">
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="border-b border-charcoal/12 bg-sand/30 text-[10px] tracking-[0.14em] uppercase text-charcoal/65">
              <th className="p-3.5">Customer</th>
              <th className="p-3.5">Contact</th>
              <th className="p-3.5">Orders</th>
              <th className="p-3.5">Total Spend</th>
              <th className="p-3.5">Joined</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-charcoal/10">
            {customers.length === 0 ? (
              <tr>
                <td colSpan={5} className="p-8 text-center text-charcoal/60">
                  No registered customers found.
                </td>
              </tr>
            ) : (
              customers.map((c) => {
                const spend = c.orders
                  .filter((o) => o.status !== "CANCELLED")
                  .reduce((sum, o) => sum + o.total, 0);
                return (
                  <tr key={c.id}>
                    <td className="p-3.5 font-medium text-charcoal">
                      {c.name || "Member"}
                    </td>
                    <td className="p-3.5 text-charcoal/70">
                      <div>{c.email}</div>
                      {c.phone && (
                        <div className="text-[11px] text-charcoal/55">
                          {c.phone}
                        </div>
                      )}
                    </td>
                    <td className="p-3.5 tabular-nums">{c.orders.length}</td>
                    <td className="p-3.5 font-medium tabular-nums">
                      {formatINR(spend)}
                    </td>
                    <td className="p-3.5 text-charcoal/60">
                      {new Date(c.createdAt).toLocaleDateString("en-IN")}
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </AdminShell>
  );
}

export default function AdminCustomersPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-12">
          <div className="h-96 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <AdminCustomersContent />
    </Suspense>
  );
}

