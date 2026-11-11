"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";

interface HeroSectionProps {
  headline: string;
  subheadline: string;
  image: string;
}

export function HeroSection({
  headline,
  subheadline,
  image,
}: HeroSectionProps) {
  return (
    <section className="relative overflow-hidden border-b border-charcoal/10 bg-sand/30">
      <div className="relative min-h-[78vh] lg:min-h-[86vh] w-full">
        <Image
          src={image || "/images/hero-editorial.jpg"}
          alt="THRIFT NATION Editorial Campaign"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center"
        />
        {/* Subtle dark scrim at bottom/left for effortless editorial legibility */}
        <div className="absolute inset-0 bg-gradient-to-t from-charcoal/70 via-charcoal/20 to-transparent" />

        <div className="relative z-10 mx-auto flex min-h-[78vh] lg:min-h-[86vh] max-w-[1440px] flex-col justify-end px-4 pb-12 pt-24 sm:px-8 sm:pb-16 lg:px-12 lg:pb-20">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
            className="max-w-2xl"
          >
            <p className="mb-4 text-[11px] font-medium tracking-[0.24em] uppercase text-ivory/85">
              Curated Archive · Autumn / Winter Edit
            </p>
            <h1 className="font-editorial text-4xl leading-[0.98] tracking-tight text-ivory sm:text-6xl lg:text-7xl">
              {headline}
            </h1>
            <p className="mt-5 max-w-lg text-sm leading-relaxed text-ivory/90 sm:text-base">
              {subheadline}
            </p>

            <div className="mt-8 flex flex-wrap gap-3 sm:gap-4">
              <Link
                href="/men"
                className="inline-flex min-w-[156px] items-center justify-center bg-ivory px-8 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-charcoal transition-colors hover:bg-sand"
              >
                SHOP MEN
              </Link>
              <Link
                href="/women"
                className="inline-flex min-w-[156px] items-center justify-center border border-ivory/80 bg-charcoal/25 px-8 py-3.5 text-xs font-medium tracking-[0.18em] uppercase text-ivory backdrop-blur-xs transition-colors hover:bg-ivory hover:text-charcoal"
              >
                SHOP WOMEN
              </Link>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}

