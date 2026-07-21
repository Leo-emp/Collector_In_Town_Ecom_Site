// Brand logos section — horizontal row of the 4 diecast brands we carry
// Shows actual brand logo images with hover effects
import Link from "next/link";
import { BRANDS } from "@/lib/constants";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface BrandLogosProps {
  lang: string;
  dict: Dictionary;
}

export function BrandLogos({ lang, dict }: BrandLogosProps) {
  return (
    <section className="py-16 px-4 border-t border-border">
      <div className="max-w-5xl mx-auto text-center">
        {/* Section header */}
        <p className="text-accent/60 text-sm uppercase tracking-[0.3em] mb-3">
          {dict.sections.brands}
        </p>
        <h2 className="font-[family-name:var(--font-playfair)] text-2xl md:text-3xl text-text-primary mb-3">
          {dict.sections.brandsDesc}
        </h2>

        {/* Decorative divider */}
        <div className="w-12 h-px bg-accent/40 mx-auto mb-12" />

        {/* Brand grid — 4 columns on desktop, 2 on mobile */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {BRANDS.map((brand) => (
            <Link
              key={brand.slug}
              href={`/${lang}/products/${brand.slug}`}
              className="group flex flex-col items-center justify-center p-6 md:p-8
                         bg-surface/50 rounded-xl border border-border
                         hover:border-accent/30 hover:bg-surface transition-all"
            >
              {/* Brand logo — centered, large */}
              <div className="flex items-center justify-center h-24 sm:h-32 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo}
                  alt={brand.name}
                  className={`w-full object-contain
                             opacity-80 group-hover:opacity-100 transition-all duration-300
                             ${brand.blendMode === "invert" ? "invert" : ""}
                             ${brand.slug === "hot-wheels" ? "max-h-32 sm:max-h-40 scale-110" : ""}
                             ${brand.slug === "pop-race" ? "max-h-16 sm:max-h-20" : ""}
                             ${brand.slug !== "hot-wheels" && brand.slug !== "pop-race" ? "max-h-24 sm:max-h-32" : ""}`}
                />
              </div>

              {/* "View Collection" link */}
              <span className="text-text-muted text-xs mt-4 group-hover:text-accent/70
                               transition-colors uppercase tracking-wider">
                {dict.sections.viewCollection}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
