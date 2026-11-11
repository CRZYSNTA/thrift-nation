import { Suspense } from "react";
import type { Metadata } from "next";
import { connection } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { getSiteSettings } from "@/lib/catalog";
import { CheckoutClient } from "@/components/checkout/CheckoutClient";

export const metadata: Metadata = {
  title: "Checkout",
  description: "Complete your THRIFT NATION archive order.",
};

async function CheckoutLoader() {
  await connection();
  const [settings, session] = await Promise.all([getSiteSettings(), auth()]);
  const savedAddresses =
    session?.user?.id && isDatabaseConfigured
      ? await prisma.address
          .findMany({
            where: { userId: session.user.id },
            orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
          })
          .catch(() => [])
      : [];

  return (
    <CheckoutClient
      settings={settings}
      savedAddresses={savedAddresses}
      userEmail={session?.user?.email || ""}
      userName={session?.user?.name || ""}
    />
  );
}

export default function CheckoutPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12">
          <div className="h-96 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <CheckoutLoader />
    </Suspense>
  );
}
