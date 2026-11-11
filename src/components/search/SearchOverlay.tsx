"use client";

import { useEffect, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { AnimatePresence, motion } from "framer-motion";
import { Search, X, ArrowRight } from "lucide-react";
import { useStore } from "@/components/providers/StoreProvider";
import { formatINR } from "@/lib/utils";
import type { ProductCardItem } from "@/types/catalog";

export function SearchOverlay() {
  const { isSearchOpen, closeSearch } = useStore();
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ProductCardItem[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!isSearchOpen) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") closeSearch();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [isSearchOpen, closeSearch]);

  useEffect(() => {
    if (!isSearchOpen) return;
    const trimmed = query.trim();
    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await fetch(
          `/api/products?search=${encodeURIComponent(trimmed)}&limit=6`
        );
        if (res.ok) {
          const data = await res.json();
          setResults(data.products ?? []);
        }
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 220);

    return () => clearTimeout(timer);
  }, [query, isSearchOpen]);

  return (
    <AnimatePresence>
      {isSearchOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 bg-charcoal/45 backdrop-blur-xs"
          onClick={closeSearch}
        >
          <motion.div
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: -20, opacity: 0 }}
            transition={{ duration: 0.22 }}
            onClick={(e) => e.stopPropagation()}
            className="border-b border-charcoal/15 bg-ivory px-4 py-8 sm:px-8 lg:px-12"
          >
            <div className="mx-auto max-w-5xl">
              <div className="flex items-center gap-4 border-b border-charcoal pb-3">
                <Search className="h-5 w-5 text-charcoal/60 stroke-[1.5]" />
                <input
                  type="search"
                  autoFocus
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search trench coats, Japanese selvedge, wool blazers..."
                  className="w-full bg-transparent text-base sm:text-lg text-charcoal placeholder:text-charcoal/40 focus:outline-none"
                />
                <button
                  type="button"
                  onClick={closeSearch}
                  aria-label="Close search"
                  className="p-1 text-charcoal/70 hover:text-charcoal"
                >
                  <X className="h-5 w-5" />
                </button>
              </div>

              <div className="mt-6">
                <div className="flex items-center justify-between text-[11px] tracking-[0.16em] uppercase text-charcoal/55">
                  <span>
                    {loading
                      ? "Searching archive..."
                      : query.trim()
                        ? `Results (${results.length})`
                        : "Featured Archive"}
                  </span>
                  <Link
                    href={
                      query.trim()
                        ? `/new-arrivals?search=${encodeURIComponent(query.trim())}`
                        : "/new-arrivals"
                    }
                    onClick={closeSearch}
                    className="inline-flex items-center gap-1 text-charcoal hover:text-olive"
                  >
                    View all pieces <ArrowRight className="h-3 w-3" />
                  </Link>
                </div>

                {results.length === 0 && !loading ? (
                  <p className="py-10 text-center text-sm text-charcoal/60">
                    No curated garments matched &ldquo;{query}&rdquo;.
                  </p>
                ) : (
                  <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-6">
                    {results.map((item) => (
                      <Link
                        key={item.id}
                        href={`/product/${item.slug}`}
                        onClick={closeSearch}
                        className="group block"
                      >
                        <div className="relative aspect-[3/4] overflow-hidden border border-charcoal/10 bg-sand/30">
                          <Image
                            src={item.images[0]?.url || "/images/prod-trench.jpg"}
                            alt={item.name}
                            fill
                            sizes="180px"
                            className="object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                        </div>
                        <p className="mt-2 truncate text-xs text-charcoal">
                          {item.name}
                        </p>
                        <p className="text-xs font-medium tabular-nums text-charcoal/70">
                          {formatINR(item.price)}
                        </p>
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}

