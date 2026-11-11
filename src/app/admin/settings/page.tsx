import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-guards";
import { getSiteSettings } from "@/lib/catalog";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminSettingsClient } from "@/components/admin/AdminSettingsClient";

async function AdminSettingsLoader() {
  try {
    await requireAdminSession();
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") redirect("/");
    redirect("/login?callbackUrl=/admin/settings");
  }

  const settings = await getSiteSettings();

  return (
    <AdminShell
      title="Store Settings"
      subtitle="Configure store identity, shipping fees, payment gateways, and social channels."
    >
      <AdminSettingsClient settings={settings} />
    </AdminShell>
  );
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-12">
          <div className="h-96 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <AdminSettingsLoader />
    </Suspense>
  );
}

