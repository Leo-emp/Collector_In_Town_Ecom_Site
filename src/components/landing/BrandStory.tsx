"use client";

import { useTheme } from "@/context/ThemeContext";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface BrandStoryProps {
  dict: Dictionary;
}

export function BrandStory({ dict }: BrandStoryProps) {
  const { theme } = useTheme();
  const isDark = theme === "dark";

  return (
    <section className={`py-24 px-4 relative overflow-hidden ${isDark ? "bg-[#0a0a0a]" : "bg-[#fafaf9]"}`}>
      <div
        className="absolute inset-0 z-0"
        style={{
          background: isDark
            ? `radial-gradient(ellipse at 30% 50%, rgba(201,168,76,0.05) 0%, transparent 60%),
               radial-gradient(ellipse at 70% 50%, rgba(201,168,76,0.03) 0%, transparent 50%)`
            : `radial-gradient(ellipse at 30% 50%, rgba(122,92,31,0.04) 0%, transparent 60%),
               radial-gradient(ellipse at 70% 50%, rgba(122,92,31,0.03) 0%, transparent 50%)`,
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        <p className={`text-sm uppercase tracking-[0.3em] mb-4 ${isDark ? "text-[#c9a84c]/60" : "text-[#7a5c1f]"}`}>
          {dict.sections.brandStory}
        </p>

        <h2 className={`font-[family-name:var(--font-cinzel)] text-3xl sm:text-4xl md:text-5xl mb-8 leading-tight ${isDark ? "text-[#f5f5f5]" : "text-[#000000]"}`}>
          {dict.sections.brandStoryTitle}
        </h2>

        <div className={`w-16 h-px mx-auto mb-8 ${isDark ? "bg-[#c9a84c]/50" : "bg-[#7a5c1f]/50"}`} />

        <p className={`text-lg md:text-xl leading-relaxed max-w-3xl mx-auto ${isDark ? "text-[#a3a3a3]" : "text-[#44403c]"}`}>
          {dict.sections.brandStoryText}
        </p>
      </div>
    </section>
  );
}
