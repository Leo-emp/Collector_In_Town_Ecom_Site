// Hero section — full-viewport diorama photo with headline and CTA overlay
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface HeroSectionProps {
  lang: string;
  dict: Dictionary;
}

export function HeroSection({ lang, dict }: HeroSectionProps) {
  return (
    <section className="relative min-h-[90vh] flex items-end justify-center overflow-hidden">
      {/* Diorama background image — full bleed */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src="/showcase/hero-diorama.png"
        alt="Diecast car diorama showroom"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
        draggable={false}
      />

      {/* Dark gradient overlay — makes text readable over the image */}
      <div className="absolute inset-0 z-[1] bg-gradient-to-t from-background via-background/60 to-transparent" />

      {/* CTA buttons — positioned at the bottom */}
      <div className="relative z-10 px-4 pb-16 pt-32">
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <Link
            href={`/${lang}/products/new-arrivals`}
            className="bg-accent text-background px-8 py-3.5 rounded-lg font-semibold
                       hover:bg-accent-hover transition-colors text-lg min-w-[200px]
                       shadow-[0_4px_20px_rgba(201,168,76,0.3)]"
          >
            {dict.hero.cta}
          </Link>
          <Link
            href={`/${lang}/products/new-arrivals`}
            className="border border-white/30 text-white px-8 py-3.5 rounded-lg font-semibold
                       hover:bg-white/10 transition-colors text-lg min-w-[200px]
                       backdrop-blur-sm"
          >
            {dict.hero.ctaSecondary}
          </Link>
        </div>
      </div>

      {/* Bottom fade — smooth transition to next section */}
      <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-background to-transparent z-[2]" />
    </section>
  );
}
