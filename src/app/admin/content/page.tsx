import { Suspense } from "react";
import { redirect } from "next/navigation";
import { requireAdminSession } from "@/lib/auth-guards";
import { getCollections, getSiteSettings } from "@/lib/catalog";
import { AdminShell } from "@/components/admin/AdminShell";
import { AdminContentClient } from "@/components/admin/AdminContentClient";

async function AdminContentLoader() {
  try {
    await requireAdminSession();
  } catch (err) {
    if (err instanceof Error && err.message === "FORBIDDEN") redirect("/");
    redirect("/login?callbackUrl=/admin/content");
  }

  const [settings, collections] = await Promise.all([
    getSiteSettings(),
    getCollections(),
  ]);

  return (
    <AdminShell
      title="Content Management"
      subtitle="Control homepage banners, announcements, featured capsules, and journal essays."
    >
      <AdminContentClient settings={settings} collections={collections} />
    </AdminShell>
  );
}

export default function AdminContentPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-12">
          <div className="h-96 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <AdminContentLoader />
    </Suspense>
  );
}

