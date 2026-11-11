import { Suspense } from "react";
import { connection } from "next/server";
import { auth } from "@/auth";
import { getProducts } from "@/lib/catalog";
import { AccountShell } from "@/components/account/AccountShell";
import { WishlistViewClient } from "@/components/account/WishlistViewClient";

async function WishlistContent() {
  await connection();
  const [session, products] = await Promise.all([auth(), getProducts()]);

  return (
    <AccountShell
      title="Saved Wishlist"
      userName={session?.user?.name}
      userEmail={session?.user?.email}
    >
      <WishlistViewClient allProducts={products} />
    </AccountShell>
  );
}

export default function WishlistPage() {
  return (
    <Suspense
      fallback={
        <div className="mx-auto max-w-[1440px] px-4 py-16">
          <div className="h-80 animate-pulse bg-sand/40" />
        </div>
      }
    >
      <WishlistContent />
    </Suspense>
  );
}

