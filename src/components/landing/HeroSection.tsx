// Hero section — full-viewport diorama photo with headline and CTA overlay
// Theme-aware: different hero image and gradient for dark vs light mode
"use client";

import Link from "next/link";
import { useTheme } from "@/context/ThemeContext";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface HeroSectionProps {
  lang: string;
  dict: Dictionary;
}

export function HeroSection({ lang, dict }: HeroSectionProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className="relative min-h-[90vh] flex items-end justify-center overflow-hidden">
      {/* Hero background image — swapped based on theme */}
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img
        src={isDark ? "/showcase/hero-diorama.png" : "/showcase/hero-diorama-light.png"}
        alt="Diecast car diorama showroom"
        className="absolute inset-0 w-full h-full object-cover object-center z-0"
        draggable={false}
      />

      {/* Gradient overlay — adapts to theme */}
      <div className={`absolute inset-0 z-[1] bg-gradient-to-t ${isDark
        ? "from-background via-background/60 to-transparent"
        : "from-background via-background/50 to-transparent"
      }`} />

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
            className={`border px-8 py-3.5 rounded-lg font-semibold
                       transition-colors text-lg min-w-[200px] backdrop-blur-sm
                       ${isDark
                         ? "border-white/30 text-white hover:bg-white/10"
                         : "border-text-primary/20 text-text-primary hover:bg-text-primary/5"
                       }`}
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
