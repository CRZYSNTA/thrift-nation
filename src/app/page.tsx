import { Suspense } from "react";
import Image from "next/image";
import Link from "next/link";
import { ArrowRight } from "lucide-react";
import {
  getCollections,
  getProducts,
  getSiteSettings,
} from "@/lib/catalog";
import { HeroSection } from "@/components/home/HeroSection";
import { RevealBlock } from "@/components/home/RevealBlock";
import { NewsletterSection } from "@/components/home/NewsletterSection";
import { ProductCard } from "@/components/product/ProductCard";

const CATEGORY_CARDS = [
  {
    title: "Men’s Collection",
    subtitle: "Structured outerwear, heritage denim & tailored layers",
    href: "/men",
    image: "/images/cat-men.jpg",
  },
  {
    title: "Women’s Collection",
    subtitle: "Fluid wool tailoring, vintage silks & sculptural silhouettes",
    href: "/women",
    image: "/images/cat-women.jpg",
  },
  {
    title: "Unisex Collection",
    subtitle: "Genderless archive trench coats, workwear & varsity pieces",
    href: "/new-arrivals?gender=UNISEX",
    image: "/images/prod-trench.jpg",
  },
];

async function NewArrivalsGrid() {
  const products = await getProducts({ sort: "newest", limit: 8 });
  return (
    <div className="mt-10 grid grid-cols-2 gap-x-4 gap-y-10 sm:gap-x-6 lg:grid-cols-4 lg:gap-x-7">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
}

export default async function HomePage() {
  const [settings, collections] = await Promise.all([
    getSiteSettings(),
    getCollections(),
  ]);

  return (
    <div>
      {/* C. Hero Section */}
      <HeroSection
        headline={settings.heroHeadline}
        subheadline={settings.heroSubheadline}
        image={settings.heroImage}
      />

      {/* D. Category Section */}
      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <RevealBlock>
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
                Curated Departments
              </p>
              <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-charcoal">
                Defined by Form, Not Season
              </h2>
            </div>
            <Link
              href="/collections"
              className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] uppercase text-charcoal/80 hover:text-charcoal"
            >
              Explore All Archives <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </RevealBlock>

        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {CATEGORY_CARDS.map((cat, idx) => (
            <RevealBlock key={cat.title} delay={idx * 0.08}>
              <Link href={cat.href} className="group block">
                <div className="relative aspect-[3/4] overflow-hidden border border-charcoal/10 bg-sand/30">
                  <Image
                    src={cat.image}
                    alt={cat.title}
                    fill
                    sizes="(max-width: 768px) 100vw, 33vw"
                    className="object-cover transition-transform duration-700 ease-out group-hover:scale-[1.03]"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-charcoal/65 via-transparent to-transparent" />
                  <div className="absolute inset-x-0 bottom-0 p-6 text-ivory">
                    <h3 className="font-editorial text-3xl">{cat.title}</h3>
                    <p className="mt-1.5 text-xs text-ivory/85">
                      {cat.subtitle}
                    </p>
                    <span className="mt-4 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.18em] uppercase underline underline-offset-4">
                      Shop Collection <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </div>
              </Link>
            </RevealBlock>
          ))}
        </div>
      </section>

      {/* E. New Arrivals */}
      <section className="border-t border-charcoal/10 bg-white/60">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
          <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
            <div>
              <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
                Weekly Archive Drop
              </p>
              <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-charcoal">
                New Arrivals
              </h2>
            </div>
            <Link
              href="/new-arrivals"
              className="inline-flex items-center gap-2 border border-charcoal/25 px-5 py-2.5 text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal hover:border-charcoal transition-colors self-start sm:self-auto"
            >
              View All Arrivals <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>

          <Suspense
            fallback={
              <div className="mt-10 grid grid-cols-2 gap-6 lg:grid-cols-4">
                {Array.from({ length: 4 }).map((_, i) => (
                  <div
                    key={i}
                    className="aspect-[3/4] animate-pulse bg-sand/50"
                  />
                ))}
              </div>
            }
          >
            <NewArrivalsGrid />
          </Suspense>
        </div>
      </section>

      {/* F. Curated Collections */}
      <section className="border-t border-charcoal/10">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
          <RevealBlock>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
                  Thematic Capsules
                </p>
                <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-charcoal">
                  Curated Collections
                </h2>
              </div>
              <Link
                href="/collections"
                className="inline-flex items-center gap-2 text-xs font-medium tracking-[0.16em] uppercase text-charcoal/80 hover:text-charcoal"
              >
                All Collections <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </RevealBlock>

          <div className="mt-10 grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-5">
            {collections.map((col, idx) => (
              <RevealBlock key={col.id} delay={idx * 0.05}>
                <Link
                  href={`/collections/${col.slug}`}
                  className="group flex flex-col border border-charcoal/12 bg-white hover:border-charcoal/40 transition-colors"
                >
                  <div className="relative aspect-[3/4] overflow-hidden bg-sand/30">
                    <Image
                      src={col.image || "/images/prod-trench.jpg"}
                      alt={col.name}
                      fill
                      sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 20vw"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.04]"
                    />
                  </div>
                  <div className="p-4">
                    <p className="text-[10px] tracking-[0.16em] uppercase text-olive">
                      {col.subtitle || "Curated Capsule"}
                    </p>
                    <h3 className="mt-1 font-editorial text-2xl text-charcoal">
                      {col.name}
                    </h3>
                    <span className="mt-3 inline-flex items-center gap-1.5 text-[10px] font-medium tracking-[0.16em] uppercase text-charcoal/70 group-hover:text-charcoal">
                      Explore <ArrowRight className="h-3 w-3" />
                    </span>
                  </div>
                </Link>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* G. Brand Story */}
      <section className="border-t border-charcoal/10 bg-sand/30">
        <div className="mx-auto grid max-w-[1440px] grid-cols-1 items-center gap-10 px-4 py-16 sm:px-8 lg:grid-cols-12 lg:gap-16 lg:px-12 lg:py-24">
          <RevealBlock className="lg:col-span-6">
            <div className="relative aspect-[4/3] w-full overflow-hidden border border-charcoal/12">
              <Image
                src="/images/story-archive.jpg"
                alt="THRIFT NATION Curated Archive Rack"
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </RevealBlock>

          <RevealBlock delay={0.1} className="lg:col-span-6 space-y-6">
            <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-olive">
              Our Philosophy
            </p>
            <h2 className="font-editorial text-4xl leading-[1.04] text-charcoal sm:text-5xl">
              GOOD STYLE DESERVES ANOTHER CHANCE.
            </h2>
            <p className="text-sm leading-relaxed text-charcoal/75 sm:text-base">
              THRIFT NATION was founded on a quiet conviction: the finest
              garments already exist. Rather than chasing disposable trend
              cycles, our curators source enduring natural fibers, precision
              tailoring, and authentic vintage silhouettes across global
              archives.
            </p>
            <p className="text-sm leading-relaxed text-charcoal/75 sm:text-base">
              Every piece is individually inspected, professionally cleaned and
              steamed, measured by hand to the centimetre, and graded with
              complete transparency—so buying pre-loved feels indistinguishable
              from visiting an independent atelier.
            </p>
            <div className="grid grid-cols-3 gap-6 border-t border-charcoal/12 pt-6">
              <div>
                <p className="font-editorial text-3xl text-charcoal">1 of 1</p>
                <p className="mt-1 text-[11px] tracking-[0.12em] uppercase text-charcoal/60">
                  Singular Finds
                </p>
              </div>
              <div>
                <p className="font-editorial text-3xl text-charcoal">100%</p>
                <p className="mt-1 text-[11px] tracking-[0.12em] uppercase text-charcoal/60">
                  Authenticated
                </p>
              </div>
              <div>
                <p className="font-editorial text-3xl text-charcoal">4-Tier</p>
                <p className="mt-1 text-[11px] tracking-[0.12em] uppercase text-charcoal/60">
                  Condition Grade
                </p>
              </div>
            </div>
            <div className="pt-2">
              <Link
                href="/about"
                className="inline-flex items-center gap-2 border border-charcoal px-7 py-3 text-xs font-medium tracking-[0.18em] uppercase text-charcoal hover:bg-charcoal hover:text-ivory transition-colors"
              >
                Read Our Story <ArrowRight className="h-3.5 w-3.5" />
              </Link>
            </div>
          </RevealBlock>
        </div>
      </section>

      {/* H. Editorial Section */}
      <section className="border-t border-charcoal/10">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
          <RevealBlock>
            <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
              <div>
                <p className="text-[11px] font-medium tracking-[0.2em] uppercase text-olive">
                  The Journal
                </p>
                <h2 className="mt-2 font-editorial text-3xl sm:text-4xl text-charcoal">
                  Editorial Perspectives
                </h2>
              </div>
              <Link
                href="/collections"
                className="text-xs font-medium tracking-[0.16em] uppercase text-charcoal/70 hover:text-charcoal"
              >
                Archive Dispatches
              </Link>
            </div>
          </RevealBlock>

          <div className="mt-10 grid grid-cols-1 gap-8 md:grid-cols-2">
            {settings.editorialContent.map((article, idx) => (
              <RevealBlock key={article.id} delay={idx * 0.08}>
                <Link
                  href={article.href}
                  className="group grid grid-cols-1 border border-charcoal/12 bg-white sm:grid-cols-12"
                >
                  <div className="relative aspect-[3/4] sm:col-span-5 overflow-hidden bg-sand/30">
                    <Image
                      src={article.image}
                      alt={article.title}
                      fill
                      sizes="(max-width: 768px) 100vw, 320px"
                      className="object-cover transition-transform duration-700 group-hover:scale-[1.03]"
                    />
                  </div>
                  <div className="flex flex-col justify-between p-6 sm:col-span-7 sm:p-8">
                    <div>
                      <div className="flex items-center justify-between text-[10px] font-medium tracking-[0.18em] uppercase text-olive">
                        <span>{article.issue}</span>
                        <span>{article.readTime}</span>
                      </div>
                      <h3 className="mt-4 font-editorial text-2xl sm:text-3xl leading-snug text-charcoal group-hover:text-olive transition-colors">
                        {article.title}
                      </h3>
                      <p className="mt-3 text-sm leading-relaxed text-charcoal/70">
                        {article.excerpt}
                      </p>
                    </div>
                    <span className="mt-6 inline-flex items-center gap-2 text-[11px] font-medium tracking-[0.16em] uppercase text-charcoal">
                      Read &amp; Shop the Edit <ArrowRight className="h-3.5 w-3.5" />
                    </span>
                  </div>
                </Link>
              </RevealBlock>
            ))}
          </div>
        </div>
      </section>

      {/* I. Newsletter */}
      <NewsletterSection />
    </div>
  );
}
