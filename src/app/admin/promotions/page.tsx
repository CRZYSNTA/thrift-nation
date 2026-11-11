import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-guards";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { AdminShell } from "@/components/admin/AdminShell";
import {
  AdminPromotionsClient,
  type AdminCouponRow,
} from "@/components/admin/AdminPromotionsClient";

async function AdminPromotionsContent() {
  try {
    await requireAdminSession();
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") redirect("/");
    redirect("/login?callbackUrl=/admin/promotions");
  }

  if (!isDatabaseConfigured) {
    return (
      <AdminShell title="Promotions & Coupons">
        <div className="border border-charcoal/15 bg-white p-8 text-sm text-charcoal/75">
          Configure `DATABASE_URL` to manage coupon codes.
        </div>
      </AdminShell>
    );
  }

  const rows = await prisma.coupon.findMany({
    orderBy: { createdAt: "desc" },
  });

  const initialCoupons: AdminCouponRow[] = rows.map((c) => ({
    id: c.id,
    code: c.code,
    description: c.description,
    discountType: c.discountType,
    discountValue: c.discountValue,
    minOrderAmount: c.minOrderAmount,
    maxDiscount: c.maxDiscount,
    usageLimit: c.usageLimit,
    usedCount: c.usedCount,
    active: c.active,
    expiresAt: c.expiresAt ? c.expiresAt.toISOString() : null,
  }));

  return (
    <AdminShell
      title="Promotions & Coupons"
      subtitle="Configure discount codes, minimum thresholds, and expiry windows."
    >
      <AdminPromotionsClient initialCoupons={initialCoupons} />
    </AdminShell>
  );
}

export default function AdminPromotionsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-12">
          <div className="h-96 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <AdminPromotionsContent />
    </Suspense>
  );
}

