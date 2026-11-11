"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  ArrowLeft,
  LayoutDashboard,
  Package,
  ShoppingCart,
  Users,
  Tag,
  FileText,
  Settings,
} from "lucide-react";
import { cn } from "@/lib/utils";

const ADMIN_NAV = [
  { label: "Overview", href: "/admin", icon: LayoutDashboard },
  { label: "Products", href: "/admin/products", icon: Package },
  { label: "Orders", href: "/admin/orders", icon: ShoppingCart },
  { label: "Customers", href: "/admin/customers", icon: Users },
  { label: "Promotions", href: "/admin/promotions", icon: Tag },
  { label: "Content", href: "/admin/content", icon: FileText },
  { label: "Settings", href: "/admin/settings", icon: Settings },
];

export function AdminShell({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/12 pb-6">
        <div>
          <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
            THRIFT NATION · Admin Studio
          </p>
          <h1 className="mt-1 font-editorial text-4xl text-charcoal">{title}</h1>
          {subtitle && (
            <p className="mt-1 text-xs text-charcoal/65">{subtitle}</p>
          )}
        </div>
        <Link
          href="/"
          className="inline-flex items-center gap-2 border border-charcoal/25 px-4 py-2 text-[11px] font-medium tracking-[0.15em] uppercase text-charcoal hover:border-charcoal"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Storefront
        </Link>
      </div>

      <div className="mt-8 grid grid-cols-1 gap-8 lg:grid-cols-12">
        <aside className="lg:col-span-2">
          <nav className="flex flex-row flex-wrap gap-1.5 lg:flex-col">
            {ADMIN_NAV.map((item) => {
              const Icon = item.icon;
              const active = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={cn(
                    "flex items-center gap-2.5 border px-3.5 py-2.5 text-xs tracking-[0.1em] uppercase transition-colors",
                    active
                      ? "border-charcoal bg-charcoal text-ivory"
                      : "border-charcoal/15 bg-white text-charcoal/80 hover:border-charcoal hover:text-charcoal"
                  )}
                >
                  <Icon className="h-3.5 w-3.5" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </aside>

        <div className="lg:col-span-10">{children}</div>
      </div>
    </div>
  );
}

