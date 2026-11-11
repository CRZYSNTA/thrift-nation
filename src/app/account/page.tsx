import { Suspense } from "react";
import Link from "next/link";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/account/AccountShell";
import { ProfileFormClient } from "@/components/account/ProfileFormClient";
import { formatINR } from "@/lib/utils";

async function AccountOverviewContent() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account");
  }

  const [userRecord, ordersCount, addressesCount, recentOrders] =
    isDatabaseConfigured
      ? await Promise.all([
          prisma.user
            .findUnique({
              where: { id: session.user.id },
              select: { name: true, phone: true, email: true },
            })
            .catch(() => null),
          prisma.order
            .count({ where: { userId: session.user.id } })
            .catch(() => 0),
          prisma.address
            .count({ where: { userId: session.user.id } })
            .catch(() => 0),
          prisma.order
            .findMany({
              where: { userId: session.user.id },
              orderBy: { createdAt: "desc" },
              take: 3,
            })
            .catch(() => []),
        ])
      : [null, 0, 0, []];

  return (
    <AccountShell
      title="Account Overview"
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="border border-charcoal/12 bg-white p-6">
          <p className="text-[10px] tracking-[0.16em] uppercase text-charcoal/55">
            Orders Placed
          </p>
          <p className="mt-2 font-editorial text-4xl text-charcoal tabular-nums">
            {ordersCount}
          </p>
          <Link
            href="/account/orders"
            className="mt-4 inline-block text-[11px] uppercase tracking-[0.14em] underline underline-offset-4"
          >
            View History
          </Link>
        </div>

        <div className="border border-charcoal/12 bg-white p-6">
          <p className="text-[10px] tracking-[0.16em] uppercase text-charcoal/55">
            Saved Addresses
          </p>
          <p className="mt-2 font-editorial text-4xl text-charcoal tabular-nums">
            {addressesCount}
          </p>
          <Link
            href="/account/addresses"
            className="mt-4 inline-block text-[11px] uppercase tracking-[0.14em] underline underline-offset-4"
          >
            Manage Addresses
          </Link>
        </div>

        <div className="border border-charcoal/12 bg-white p-6">
          <p className="text-[10px] tracking-[0.16em] uppercase text-charcoal/55">
            Membership Tier
          </p>
          <p className="mt-2 font-editorial text-4xl text-olive">Archive</p>
          <Link
            href="/new-arrivals"
            className="mt-4 inline-block text-[11px] uppercase tracking-[0.14em] underline underline-offset-4"
          >
            Shop New Drop
          </Link>
        </div>
      </div>

      <div className="mt-8">
        <ProfileFormClient
          initialName={userRecord?.name ?? session.user.name ?? ""}
          initialPhone={userRecord?.phone ?? ""}
          email={userRecord?.email ?? session.user.email ?? ""}
        />
      </div>

      <div className="mt-8 border border-charcoal/12 bg-white p-6">
        <h2 className="text-xs font-medium tracking-[0.18em] uppercase text-charcoal">
          Recent Orders
        </h2>
        {recentOrders.length === 0 ? (
          <p className="mt-4 text-sm text-charcoal/65">
            You have not placed any archive orders yet.
          </p>
        ) : (
          <div className="mt-4 divide-y divide-charcoal/10">
            {recentOrders.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-4 py-4 text-xs"
              >
                <div>
                  <p className="font-medium text-charcoal">
                    {order.orderNumber}
                  </p>
                  <p className="mt-0.5 text-charcoal/60">
                    {new Date(order.createdAt).toLocaleDateString("en-IN", {
                      day: "numeric",
                      month: "short",
                      year: "numeric",
                    })}
                  </p>
                </div>
                <div className="flex items-center gap-6">
                  <span className="border border-charcoal/20 px-2.5 py-1 text-[10px] tracking-[0.14em] uppercase">
                    {order.status}
                  </span>
                  <span className="font-medium tabular-nums text-charcoal">
                    {formatINR(order.total)}
                  </span>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </AccountShell>
  );
}

export default function AccountPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-16">
          <div className="h-80 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <AccountOverviewContent />
    </Suspense>
  );
}

