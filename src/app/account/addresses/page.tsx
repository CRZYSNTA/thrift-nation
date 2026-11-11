import { Suspense } from "react";
import { redirect } from "next/navigation";
import { connection } from "next/server";
import { auth } from "@/auth";
import { isDatabaseConfigured, prisma } from "@/lib/prisma";
import { AccountShell } from "@/components/account/AccountShell";
import { AddressManagerClient } from "@/components/account/AddressManagerClient";

async function AddressesContent() {
  await connection();
  const session = await auth();
  if (!session?.user?.id) {
    redirect("/login?callbackUrl=/account/addresses");
  }

  const addresses = isDatabaseConfigured
    ? await prisma.address
        .findMany({
          where: { userId: session.user.id },
          orderBy: [{ isDefault: "desc" }, { createdAt: "desc" }],
        })
        .catch(() => [])
    : [];

  return (
    <AccountShell
      title="Delivery Addresses"
      userName={session.user.name}
      userEmail={session.user.email}
    >
      <AddressManagerClient initialAddresses={addresses} />
    </AccountShell>
  );
}

export default function AddressesPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-16">
          <div className="h-80 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <AddressesContent />
    </Suspense>
  );
}

