"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "next-auth/react";
import { cn } from "@/lib/utils";

const ACCOUNT_LINKS = [
  { label: "Profile Overview", href: "/account" },
  { label: "Order History", href: "/account/orders" },
  { label: "Saved Wishlist", href: "/account/wishlist" },
  { label: "Delivery Addresses", href: "/account/addresses" },
];

export function AccountShell({
  title,
  userName,
  userEmail,
  children,
}: {
  title: string;
  userName?: string | null;
  userEmail?: string | null;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
      <div className="border-b border-charcoal/12 pb-6">
        <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
          Member Studio
        </p>
        <h1 className="mt-2 font-editorial text-4xl text-charcoal">{title}</h1>
        {userEmail && (
          <p className="mt-1 text-xs text-charcoal/60">
            {userName ? `${userName} · ` : ""}
            {userEmail}
          </p>
        )}
      </div>

      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="lg:col-span-3 space-y-2">
          {ACCOUNT_LINKS.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "block border px-4 py-3 text-xs tracking-[0.14em] uppercase transition-colors",
                  active
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-charcoal/15 bg-white text-charcoal hover:border-charcoal"
                )}
              >
                {item.label}
              </Link>
            );
          })}
          <button
            type="button"
            onClick={() => signOut({ callbackUrl: "/" })}
            className="w-full border border-charcoal/20 bg-ivory px-4 py-3 text-left text-xs tracking-[0.14em] uppercase text-charcoal/70 hover:border-charcoal hover:text-charcoal transition-colors"
          >
            Sign Out
          </button>
        </aside>

        <div className="lg:col-span-9">{children}</div>
      </div>
    </div>
  );
}

