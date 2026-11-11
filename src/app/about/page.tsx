import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
  title: "About THRIFT NATION",
  description:
    "Pre-loved. Reimagined. Yours. Discover the curation standards, restoration process, and circular luxury philosophy behind THRIFT NATION.",
  alternates: { canonical: "/about" },
};

export default function AboutPage() {
  return (
    <div>
      <section className="border-b border-charcoal/12 bg-sand/30">
        <div className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
          <p className="text-[11px] font-medium tracking-[0.22em] uppercase text-olive">
            House Philosophy
          </p>
          <h1 className="mt-3 max-w-3xl font-editorial text-4xl sm:text-6xl text-charcoal leading-[1.02]">
            GOOD STYLE DESERVES ANOTHER CHANCE.
          </h1>
          <p className="mt-5 max-w-2xl text-sm leading-relaxed text-charcoal/75 sm:text-base">
            Pre-loved. Reimagined. Yours. THRIFT NATION exists to give enduring
            garments the quiet reverence of an independent luxury house.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-[1440px] px-4 py-16 sm:px-8 lg:px-12 lg:py-24">
        <div className="grid grid-cols-1 gap-12 lg:grid-cols-12 items-center">
          <div className="lg:col-span-6 relative aspect-[4/3] border border-charcoal/12 overflow-hidden">
            <Image
              src="/images/story-archive.jpg"
              alt="THRIFT NATION Mumbai Archive"
              fill
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </div>
          <div className="lg:col-span-6 space-y-6 text-sm leading-relaxed text-charcoal/80 sm:text-base">
            <h2 className="font-editorial text-3xl text-charcoal">
              Our Four-Step Archive Standard
            </h2>
            <p>
              1. <strong>Provenance &amp; Selection:</strong> Less than four
              percent of garments we inspect enter the THRIFT NATION archive. We
              prioritize natural fibers—virgin wool, cashmere, raw silk,
              Japanese selvedge cotton, and full-grain leather.
            </p>
            <p>
              2. <strong>Atelier Restoration:</strong> Every piece undergoes
              sanitizing steam treatment, gentle dry-cleaning, hardware checks,
              and leather conditioning before photography.
            </p>
            <p>
              3. <strong>Honest Grading &amp; Measurements:</strong> Vintage
              sizing varies across decades. We publish exact flat-lay
              measurements and grade every piece transparently from Fair to Like
              New.
            </p>
            <p>
              4. <strong>Singular Ownership:</strong> Almost every item in our
              store is one-of-one. Once claimed, it moves out of circulation
              immediately.
            </p>
            <div className="pt-4">
              <Link
                href="/new-arrivals"
                className="inline-block bg-charcoal px-7 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-ivory"
              >
                Explore the Archive
              </Link>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

