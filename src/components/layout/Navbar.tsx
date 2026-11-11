"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession } from "next-auth/react";
import { AnimatePresence, motion } from "framer-motion";
import {
  Heart,
  Menu,
  Search,
  ShoppingBag,
  User,
  X,
  ShieldCheck,
} from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { cn } from "@/lib/utils";

const NAV_LINKS = [
  { label: "Men", href: "/men" },
  { label: "Women", href: "/women" },
  { label: "New Arrivals", href: "/new-arrivals" },
  { label: "Collections", href: "/collections" },
];

export function Navbar() {
  const pathname = usePathname();
  const { data: session } = useSession();
  const { cartCount, wishlistIds, openCart, openSearch } = useStore();
  const [mobileOpen, setMobileOpen] = useState(false);

  const isAdmin =
    session?.user?.role === "ADMIN" || session?.user?.role === "SUPER_ADMIN";

  return (
    <header className="sticky top-0 z-40 border-b border-charcoal/10 bg-ivory/95 backdrop-blur-md">
      <nav
        aria-label="Primary"
        className="mx-auto flex h-16 max-w-[1440px] items-center justify-between px-4 sm:px-8 lg:px-12"
      >
        {/* Left: Mobile Menu + Desktop Links */}
        <div className="flex items-center gap-6 lg:flex-1">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            aria-label="Open navigation menu"
            className="p-1.5 text-charcoal lg:hidden"
          >
            <Menu className="h-5 w-5 stroke-[1.5]" />
          </button>

          <div className="hidden lg:flex lg:items-center lg:gap-8">
            {NAV_LINKS.map((item) => {
              const active =
                pathname === item.href ||
                (item.href !== "/" && pathname.startsWith(item.href + "/"));
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "text-[11px] font-medium tracking-[0.16em] uppercase transition-colors",
                    active
                      ? "text-charcoal underline underline-offset-8 decoration-charcoal"
                      : "text-charcoal/70 hover:text-charcoal"
                  )}
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </div>

        {/* Center: Brand Logo */}
        <Link
          href="/"
          className="font-editorial text-2xl sm:text-[28px] tracking-[0.06em] text-charcoal whitespace-nowrap"
        >
          THRIFT NATION
        </Link>

        {/* Right: Utility Icons */}
        <div className="flex items-center justify-end gap-3 sm:gap-5 lg:flex-1">
          {isAdmin && (
            <Link
              href="/admin"
              className="hidden sm:inline-flex items-center gap-1.5 border border-charcoal/20 px-2.5 py-1 text-[10px] font-medium tracking-[0.16em] uppercase text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
            >
              <ShieldCheck className="h-3 w-3" />
              Admin
            </Link>
          )}

          <button
            type="button"
            onClick={openSearch}
            aria-label="Search archive"
            className="p-1.5 text-charcoal/80 hover:text-charcoal transition-colors"
          >
            <Search className="h-[18px] w-[18px] stroke-[1.5]" />
          </button>

          <Link
            href={session?.user ? "/account" : "/login"}
            aria-label={session?.user ? "Account" : "Sign in"}
            className="hidden sm:inline-flex p-1.5 text-charcoal/80 hover:text-charcoal transition-colors"
          >
            <User className="h-[18px] w-[18px] stroke-[1.5]" />
          </Link>

          <Link
            href="/account/wishlist"
            aria-label="Wishlist"
            className="relative p-1.5 text-charcoal/80 hover:text-charcoal transition-colors"
          >
            <Heart className="h-[18px] w-[18px] stroke-[1.5]" />
            {wishlistIds.length > 0 && (
              <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center bg-olive px-1 text-[9px] font-medium text-white tabular-nums">
                {wishlistIds.length}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={openCart}
            aria-label="Shopping bag"
            className="relative flex items-center gap-1.5 p-1.5 text-charcoal/80 hover:text-charcoal transition-colors"
          >
            <ShoppingBag className="h-[18px] w-[18px] stroke-[1.5]" />
            <span className="text-[11px] font-medium tracking-[0.1em] tabular-nums">
              ({cartCount})
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile Drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-charcoal/40 backdrop-blur-xs lg:hidden"
            onClick={() => setMobileOpen(false)}
          >
            <motion.div
              initial={{ x: "-100%" }}
              animate={{ x: 0 }}
              exit={{ x: "-100%" }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              onClick={(e) => e.stopPropagation()}
              className="flex h-full w-[82vw] max-w-sm flex-col justify-between bg-ivory p-6 border-r border-charcoal/10"
            >
              <div>
                <div className="flex items-center justify-between pb-6 border-b border-charcoal/10">
                  <span className="font-editorial text-2xl tracking-[0.06em]">
                    THRIFT NATION
                  </span>
                  <button
                    type="button"
                    onClick={() => setMobileOpen(false)}
                    aria-label="Close navigation menu"
                    className="p-1 text-charcoal"
                  >
                    <X className="h-5 w-5 stroke-[1.5]" />
                  </button>
                </div>

                <div className="mt-8 flex flex-col gap-5">
                  {NAV_LINKS.map((item) => (
                    <Link
                      key={item.href}
                      href={item.href}
                      onClick={() => setMobileOpen(false)}
                      className="font-editorial text-3xl text-charcoal hover:text-olive transition-colors"
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>

                <div className="mt-10 pt-8 border-t border-charcoal/10 flex flex-col gap-4">
                  <Link
                    href={session?.user ? "/account" : "/login"}
                    onClick={() => setMobileOpen(false)}
                    className="text-xs font-medium tracking-[0.16em] uppercase text-charcoal/80"
                  >
                    {session?.user ? "My Account" : "Sign In / Register"}
                  </Link>
                  <Link
                    href="/account/wishlist"
                    onClick={() => setMobileOpen(false)}
                    className="text-xs font-medium tracking-[0.16em] uppercase text-charcoal/80"
                  >
                    Wishlist ({wishlistIds.length})
                  </Link>
                  {isAdmin && (
                    <Link
                      href="/admin"
                      onClick={() => setMobileOpen(false)}
                      className="text-xs font-medium tracking-[0.16em] uppercase text-olive"
                    >
                      Admin Dashboard
                    </Link>
                  )}
                </div>
              </div>

              <p className="text-[11px] tracking-[0.12em] uppercase text-charcoal/50">
                Pre-loved. Reimagined. Yours.
              </p>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}

