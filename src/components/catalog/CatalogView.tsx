"use client";

import { useState, useTransition } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { SlidersHorizontal, X } from "lucide-react";
import { ProductCard } from "@/components/product/ProductCard";
import { CONDITION_LABELS } from "@/lib/utils";
import type { CategorySummary, ProductCardItem } from "@/types/catalog";
import type { ConditionGrade } from "@prisma/client";

interface CatalogViewProps {
  products: ProductCardItem[];
  categories: CategorySummary[];
  brands: string[];
  sizes: string[];
  showGenderFilter?: boolean;
}

const CONDITIONS: ConditionGrade[] = ["LIKE_NEW", "EXCELLENT", "GOOD", "FAIR"];

export function CatalogView({
  products,
  categories,
  brands,
  sizes,
  showGenderFilter = false,
}: CatalogViewProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [isPending, startTransition] = useTransition();
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);

  const activeCategory = searchParams.get("category") ?? "";
  const activeSize = searchParams.get("size") ?? "";
  const activeBrand = searchParams.get("brand") ?? "";
  const activeCondition = searchParams.get("condition") ?? "";
  const activeAvailability = searchParams.get("availability") ?? "all";
  const activeGender = searchParams.get("gender") ?? "";
  const activeSort = searchParams.get("sort") ?? "newest";
  const activeMinPrice = searchParams.get("minPrice") ?? "";
  const activeMaxPrice = searchParams.get("maxPrice") ?? "";
  const activeSearch = searchParams.get("search") ?? "";

  function updateParam(key: string, value: string) {
    const params = new URLSearchParams(searchParams.toString());
    if (!value || value === "all") {
      params.delete(key);
    } else {
      params.set(key, value);
    }
    startTransition(() => {
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    });
  }

  function clearAllFilters() {
    startTransition(() => {
      router.push(pathname, { scroll: false });
    });
  }

  const hasActiveFilters = Boolean(
    activeCategory ||
      activeSize ||
      activeBrand ||
      activeCondition ||
      (activeAvailability && activeAvailability !== "all") ||
      activeGender ||
      activeMinPrice ||
      activeMaxPrice ||
      activeSearch
  );

  const filterPanel = (
    <div className="space-y-7 text-xs">
      {hasActiveFilters && (
        <button
          type="button"
          onClick={clearAllFilters}
          className="w-full border border-charcoal/25 py-2 text-[10px] font-medium tracking-[0.16em] uppercase text-charcoal hover:border-charcoal transition-colors"
        >
          Clear All Filters
        </button>
      )}

      {showGenderFilter && (
        <div>
          <h3 className="text-[10px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
            Department
          </h3>
          <div className="mt-3 flex flex-wrap gap-2">
            {["", "MEN", "WOMEN", "UNISEX"].map((g) => (
              <button
                key={g || "ALL"}
                type="button"
                onClick={() => updateParam("gender", g)}
                className={`border px-3 py-1.5 text-[10px] tracking-[0.14em] uppercase transition-colors ${
                  activeGender === g
                    ? "border-charcoal bg-charcoal text-ivory"
                    : "border-charcoal/20 text-charcoal hover:border-charcoal"
                }`}
              >
                {g || "All"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div>
        <h3 className="text-[10px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
          Category
        </h3>
        <ul className="mt-3 space-y-2">
          <li>
            <button
              type="button"
              onClick={() => updateParam("category", "")}
              className={`text-left transition-colors ${
                !activeCategory
                  ? "font-medium text-charcoal underline underline-offset-4"
                  : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              All Categories
            </button>
          </li>
          {categories.map((cat) => (
            <li key={cat.id}>
              <button
                type="button"
                onClick={() => updateParam("category", cat.slug)}
                className={`text-left transition-colors ${
                  activeCategory === cat.slug
                    ? "font-medium text-charcoal underline underline-offset-4"
                    : "text-charcoal/70 hover:text-charcoal"
                }`}
              >
                {cat.name}
              </button>
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="text-[10px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
          Condition Grade
        </h3>
        <div className="mt-3 space-y-2">
          <button
            type="button"
            onClick={() => updateParam("condition", "")}
            className={`block text-left ${
              !activeCondition
                ? "font-medium text-charcoal underline underline-offset-4"
                : "text-charcoal/70 hover:text-charcoal"
            }`}
          >
            All Conditions
          </button>
          {CONDITIONS.map((cond) => (
            <button
              key={cond}
              type="button"
              onClick={() => updateParam("condition", cond)}
              className={`block text-left ${
                activeCondition === cond
                  ? "font-medium text-charcoal underline underline-offset-4"
                  : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              {CONDITION_LABELS[cond]}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
          Size
        </h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {sizes.map((sz) => (
            <button
              key={sz}
              type="button"
              onClick={() => updateParam("size", activeSize === sz ? "" : sz)}
              className={`border px-2.5 py-1 text-[11px] transition-colors ${
                activeSize === sz
                  ? "border-charcoal bg-charcoal text-ivory"
                  : "border-charcoal/20 text-charcoal/80 hover:border-charcoal"
              }`}
            >
              {sz}
            </button>
          ))}
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
          Brand / Archive House
        </h3>
        <select
          aria-label="Filter by brand"
          value={activeBrand}
          onChange={(e) => updateParam("brand", e.target.value)}
          className="mt-3 w-full border border-charcoal/20 bg-white px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
        >
          <option value="">All Houses</option>
          {brands.map((b) => (
            <option key={b} value={b}>
              {b}
            </option>
          ))}
        </select>
      </div>

      <div>
        <h3 className="text-[10px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
          Price Range (₹)
        </h3>
        <div className="mt-3 grid grid-cols-2 gap-2">
          <input
            type="number"
            min={0}
            placeholder="Min ₹"
            defaultValue={activeMinPrice}
            onBlur={(e) => updateParam("minPrice", e.target.value)}
            className="w-full border border-charcoal/20 bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-charcoal focus:outline-none"
          />
          <input
            type="number"
            min={0}
            placeholder="Max ₹"
            defaultValue={activeMaxPrice}
            onBlur={(e) => updateParam("maxPrice", e.target.value)}
            className="w-full border border-charcoal/20 bg-white px-2.5 py-1.5 text-xs text-charcoal focus:border-charcoal focus:outline-none"
          />
        </div>
      </div>

      <div>
        <h3 className="text-[10px] font-medium tracking-[0.18em] uppercase text-charcoal/60">
          Availability
        </h3>
        <div className="mt-3 space-y-2">
          {[
            { value: "all", label: "All Pieces" },
            { value: "in-stock", label: "Available Only" },
            { value: "sold", label: "Archived / Sold" },
          ].map((opt) => (
            <button
              key={opt.value}
              type="button"
              onClick={() => updateParam("availability", opt.value)}
              className={`block text-left ${
                activeAvailability === opt.value
                  ? "font-medium text-charcoal underline underline-offset-4"
                  : "text-charcoal/70 hover:text-charcoal"
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>
    </div>
  );

  return (
    <div className="mx-auto max-w-[1440px] px-4 py-10 sm:px-8 lg:px-12 lg:py-14">
      {/* Toolbar */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-charcoal/12 pb-5">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => setMobileFiltersOpen(true)}
            className="inline-flex items-center gap-2 border border-charcoal/25 px-4 py-2 text-[11px] font-medium tracking-[0.14em] uppercase text-charcoal lg:hidden"
          >
            <SlidersHorizontal className="h-3.5 w-3.5" />
            Filters
          </button>
          <p className="text-xs tracking-[0.12em] uppercase text-charcoal/65 tabular-nums">
            {isPending ? "Updating..." : `${products.length} Curated Pieces`}
          </p>
        </div>

        <div className="flex items-center gap-3">
          <label
            htmlFor="catalog-sort"
            className="text-[10px] font-medium tracking-[0.16em] uppercase text-charcoal/60"
          >
            Sort
          </label>
          <select
            id="catalog-sort"
            value={activeSort}
            onChange={(e) => updateParam("sort", e.target.value)}
            className="border border-charcoal/20 bg-white px-3 py-2 text-xs text-charcoal focus:border-charcoal focus:outline-none"
          >
            <option value="newest">Newest</option>
            <option value="featured">Featured</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
          </select>
        </div>
      </div>

      {/* Main layout */}
      <div className="mt-10 grid grid-cols-1 gap-10 lg:grid-cols-12">
        <aside className="hidden lg:col-span-3 lg:block xl:col-span-2">
          {filterPanel}
        </aside>

        <div className="lg:col-span-9 xl:col-span-10">
          {products.length === 0 ? (
            <div className="border border-charcoal/12 bg-white px-6 py-20 text-center">
              <p className="font-editorial text-3xl text-charcoal">
                No pieces match these filters
              </p>
              <p className="mt-2 text-sm text-charcoal/65">
                Every archive item is unique—try broadening your size, brand, or
                price selection.
              </p>
              <button
                type="button"
                onClick={clearAllFilters}
                className="mt-6 bg-charcoal px-6 py-3 text-xs font-medium tracking-[0.16em] uppercase text-ivory"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 md:grid-cols-3 xl:grid-cols-4">
              {products.map((product) => (
                <ProductCard key={product.id} product={product} />
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mobile Filter Drawer */}
      {mobileFiltersOpen && (
        <div
          className="fixed inset-0 z-50 flex bg-charcoal/45 backdrop-blur-xs lg:hidden"
          onClick={() => setMobileFiltersOpen(false)}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            className="h-full w-80 max-w-[85vw] overflow-y-auto bg-ivory p-6 border-r border-charcoal/12"
          >
            <div className="flex items-center justify-between border-b border-charcoal/12 pb-4 mb-6">
              <span className="text-xs font-medium tracking-[0.18em] uppercase">
                Filter Archive
              </span>
              <button
                type="button"
                onClick={() => setMobileFiltersOpen(false)}
                aria-label="Close filters"
              >
                <X className="h-5 w-5" />
              </button>
            </div>
            {filterPanel}
          </div>
        </div>
      )}
    </div>
  );
}

