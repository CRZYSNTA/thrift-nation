import { Suspense } from "react";
import { ConditionGrade, Gender } from "@prisma/client";
import { getFilterFacets, getProducts } from "@/lib/catalog";
import { CatalogView } from "@/components/catalog/CatalogView";

export interface CatalogSearchParams {
  category?: string;
  size?: string;
  brand?: string;
  condition?: string;
  availability?: string;
  gender?: string;
  minPrice?: string;
  maxPrice?: string;
  search?: string;
  sort?: string;
}

interface CatalogPageShellProps {
  title: string;
  eyebrow: string;
  description: string;
  fixedGender?: Gender;
  fixedCollectionSlug?: string;
  showGenderFilter?: boolean;
  searchParams: Promise<CatalogSearchParams>;
}

async function CatalogContent({
  fixedGender,
  fixedCollectionSlug,
  showGenderFilter,
  searchParams,
}: Omit<CatalogPageShellProps, "title" | "eyebrow" | "description">) {
  const sp = await searchParams;

  const validConditions: ConditionGrade[] = [
    "LIKE_NEW",
    "EXCELLENT",
    "GOOD",
    "FAIR",
  ];
  const condition = validConditions.includes(sp.condition as ConditionGrade)
    ? (sp.condition as ConditionGrade)
    : undefined;

  const validGenders: Gender[] = ["MEN", "WOMEN", "UNISEX"];
  const gender =
    fixedGender ??
    (validGenders.includes(sp.gender as Gender)
      ? (sp.gender as Gender)
      : undefined);

  const sortMap = new Set(["newest", "price-asc", "price-desc", "featured"]);
  const sort = sortMap.has(sp.sort ?? "")
    ? (sp.sort as "newest" | "price-asc" | "price-desc" | "featured")
    : "newest";

  const availability =
    sp.availability === "in-stock" || sp.availability === "sold"
      ? sp.availability
      : "all";

  const minPrice = sp.minPrice ? Number(sp.minPrice) : undefined;
  const maxPrice = sp.maxPrice ? Number(sp.maxPrice) : undefined;

  const [products, facets] = await Promise.all([
    getProducts({
      gender,
      collectionSlug: fixedCollectionSlug,
      categorySlug: sp.category,
      size: sp.size,
      brand: sp.brand,
      condition,
      availability,
      minPrice: Number.isFinite(minPrice) ? minPrice : undefined,
      maxPrice: Number.isFinite(maxPrice) ? maxPrice : undefined,
      search: sp.search,
      sort,
    }),
    getFilterFacets(),
  ]);

  return (
    <CatalogView
      products={products}
      categories={facets.categories}
      brands={facets.brands}
      sizes={facets.sizes}
      showGenderFilter={showGenderFilter}
    />
  );
}

export function CatalogPageShell(props: CatalogPageShellProps) {
  return (
    <div>
      <section className="border-b border-charcoal/12 bg-sand/30">
        <div className="mx-auto max-w-[1440px] px-4 py-12 sm:px-8 lg:px-12 lg:py-16">
          <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-olive">
            {props.eyebrow}
          </p>
          <h1 className="mt-2 font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal">
            {props.title}
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/75 sm:text-base">
            {props.description}
          </p>
        </div>
      </section>

      <Suspense
        fallback={
          <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12">
            <div className="grid grid-cols-2 gap-6 lg:grid-cols-4">
              {Array.from({ length: 8 }).map((_, i) => (
                <div
                  key={i}
                  className="aspect-[3/4] animate-pulse bg-sand/50"
                />
              ))}
            </div>
          </div>
        }
      >
        <CatalogContent
          fixedGender={props.fixedGender}
          fixedCollectionSlug={props.fixedCollectionSlug}
          showGenderFilter={props.showGenderFilter}
          searchParams={props.searchParams}
        />
      </Suspense>
    </div>
  );
}

