// Hero section — full-viewport diorama-style showcase with headline and CTA
// Uses a gradient background as placeholder until a real diorama photo is uploaded
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface HeroSectionProps {
  lang: string;
  dict: Dictionary;
}

export function HeroSection({ lang, dict }: HeroSectionProps) {
  return (
    <section className="relative min-h-[85vh] flex items-end justify-center overflow-hidden">
      {/* Background — gradient placeholder for the diorama photograph */}
      {/* Replace this div with an <Image> of the actual diorama photo */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 50% 30%, rgba(201, 168, 76, 0.15) 0%, transparent 60%),
            radial-gradient(ellipse at 20% 80%, rgba(201, 168, 76, 0.08) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 70%, rgba(201, 168, 76, 0.06) 0%, transparent 50%),
            linear-gradient(180deg, #0a0a0a 0%, #111111 40%, #0d0d0d 100%)
          `,
        }}
      />

      {/* Decorative grid lines — subtle showroom floor effect */}
      <div
        className="absolute inset-0 z-0 opacity-[0.03]"
        style={{
          backgroundImage: `
            linear-gradient(rgba(201, 168, 76, 0.5) 1px, transparent 1px),
            linear-gradient(90deg, rgba(201, 168, 76, 0.5) 1px, transparent 1px)
          `,
          backgroundSize: "80px 80px",
        }}
      />

      {/* Content overlay — positioned at the bottom of the hero */}
      <div className="relative z-10 text-center px-4 pb-16 pt-32 max-w-4xl mx-auto">
        {/* Small tag above headline */}
        <p className="text-accent/80 text-sm uppercase tracking-[0.3em] mb-6 font-medium">
          Myanmar&apos;s Premier Diecast Destination
        </p>

        {/* Main headline — Playfair Display serif */}
        <h1 className="font-[family-name:var(--font-playfair)] text-5xl sm:text-6xl md:text-7xl lg:text-8xl text-text-primary mb-6 leading-tight">
          {dict.hero.title}
        </h1>

        {/* Subtitle */}
        <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10 leading-relaxed">
          {dict.hero.subtitle}
        </p>

        {/* CTA buttons — primary + secondary */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${lang}/products/new-arrivals`}
            className="bg-accent text-background px-8 py-3.5 rounded-lg font-semibold
                       hover:bg-accent-hover transition-colors text-lg min-w-[200px]"
          >
            {dict.hero.cta}
          </Link>
          <Link
            href={`/${lang}/products/new-arrivals`}
            className="border border-accent/50 text-accent px-8 py-3.5 rounded-lg font-semibold
                       hover:bg-accent/10 transition-colors text-lg min-w-[200px]"
          >
            {dict.hero.ctaSecondary}
          </Link>
        </div>
      </div>

      {/* Bottom fade — smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-background to-transparent z-10" />
    </section>
  );
}
