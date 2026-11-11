import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import { getCollections } from "@/lib/catalog";

export const metadata: Metadata = {
  title: "Curated Collections",
  description:
    "Browse THRIFT NATION thematic capsules: Vintage Essentials, Streetwear, Everyday Classics, Statement Pieces, and Denim Collection.",
  alternates: { canonical: "/collections" },
};

export default async function CollectionsIndexPage() {
  const collections = await getCollections();

  return (
    <div>
      <section className="border-b border-charcoal/12 bg-sand/30">
        <div className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
          <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-olive">
            Thematic Capsules
          </p>
          <h1 className="mt-2 font-editorial text-4xl sm:text-5xl lg:text-6xl text-charcoal">
            Curated Collections
          </h1>
          <p className="mt-3 max-w-2xl text-sm leading-relaxed text-charcoal/75 sm:text-base">
            Each capsule gathers rare finds united by fabrication, era, and
            silhouette.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-14 sm:px-8 lg:px-12 lg:py-20">
        <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3">
          {collections.map((col) => (
            <Link
              key={col.id}
              href={`/collections/${col.slug}`}
              className="group flex flex-col border border-charcoal/12 bg-white hover:border-charcoal transition-colors"
            >
              <div className="relative aspect-[3/4] w-full overflow-hidden bg-sand/30">
                <Image
                  src={col.image || "/images/prod-trench.jpg"}
                  alt={col.name}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
                  className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                />
              </div>
              <div className="flex flex-1 flex-col justify-between p-6 sm:p-7">
                <div>
                  <p className="text-[10px] font-medium tracking-[0.18em] uppercase text-olive">
                    {col.subtitle || "Archive Capsule"}
                  </p>
                  <h2 className="mt-2 font-editorial text-3xl text-charcoal">
                    {col.name}
                  </h2>
                  {col.description && (
                    <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                      {col.description}
                    </p>
                  )}
                </div>
                <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal">
                  View Collection <ArrowRight className="h-3.5 w-3.5" />
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
}

