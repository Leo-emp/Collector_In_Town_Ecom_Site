"use client";

import Link from "next/link";
import { BRANDS } from "@/lib/constants";
import { useTheme } from "@/context/ThemeContext";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface BrandLogosProps {
  lang: string;
  dict: Dictionary;
}

export function BrandLogos({ lang, dict }: BrandLogosProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className={`py-16 px-4 border-t ${isDark ? "border-[#262626]" : "border-[#e7e5e4]"}`}>
      <div className="max-w-5xl mx-auto text-center">
        <p className={`text-sm uppercase tracking-[0.3em] mb-3 ${isDark ? "text-[#c9a84c]/60" : "text-[#7a5c1f]"}`}>
          {dict.sections.brands}
        </p>
        <h2 className={`font-[family-name:var(--font-cinzel)] text-2xl md:text-3xl mb-3 ${isDark ? "text-[#f5f5f5]" : "text-[#000000]"}`}>
          {dict.sections.brandsDesc}
        </h2>

        <div className={`w-12 h-px mx-auto mb-12 ${isDark ? "bg-[#c9a84c]/40" : "bg-[#7a5c1f]/40"}`} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 md:gap-8">
          {BRANDS.filter((brand) => brand.slug !== "other").map((brand) => (
            <Link
              key={brand.slug}
              href={`/${lang}/products/${brand.slug}`}
              className={`group flex flex-col items-center justify-center p-6 md:p-8
                         rounded-xl border transition-all
                         ${isDark
                           ? "bg-[#141414]/50 border-[#262626] hover:border-[#c9a84c]/30 hover:bg-[#141414]"
                           : "bg-white/50 border-[#e7e5e4] hover:border-[#7a5c1f]/30 hover:bg-white"}`}
            >
              <div className="flex items-center justify-center h-24 sm:h-32 w-full">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={brand.logo!}
                  alt={brand.name}
                  className={`w-full object-contain
                             opacity-80 group-hover:opacity-100 transition-all duration-300
                             ${brand.blendMode === "invert" && isDark ? "invert" : ""}
                             ${brand.slug === "inno64" && !isDark ? "invert" : ""}
                             ${brand.slug === "hot-wheels" ? "max-h-32 sm:max-h-40 scale-110" : ""}
                             ${brand.slug === "pop-race" ? "max-h-16 sm:max-h-20" : ""}
                             ${brand.slug !== "hot-wheels" && brand.slug !== "pop-race" ? "max-h-24 sm:max-h-32" : ""}`}
                />
              </div>

              <span className={`text-xs mt-4 transition-colors uppercase tracking-wider
                               ${isDark ? "text-[#737373] group-hover:text-[#c9a84c]/70" : "text-[#78716c] group-hover:text-[#7a5c1f]/70"}`}>
                {dict.sections.viewCollection}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
