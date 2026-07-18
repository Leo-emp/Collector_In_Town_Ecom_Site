// Brand story section — cinematic section about the brand's passion
// Dark aesthetic with minimal text and premium feel
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface BrandStoryProps {
  dict: Dictionary;
}

export function BrandStory({ dict }: BrandStoryProps) {
  return (
    <section className="py-24 px-4 relative overflow-hidden">
      {/* Subtle background accent glow */}
      <div
        className="absolute inset-0 z-0"
        style={{
          background: `
            radial-gradient(ellipse at 30% 50%, rgba(201, 168, 76, 0.05) 0%, transparent 60%),
            radial-gradient(ellipse at 70% 50%, rgba(201, 168, 76, 0.03) 0%, transparent 50%)
          `,
        }}
      />

      <div className="max-w-4xl mx-auto text-center relative z-10">
        {/* Section label */}
        <p className="text-accent/60 text-sm uppercase tracking-[0.3em] mb-4">
          {dict.sections.brandStory}
        </p>

        {/* Main headline */}
        <h2 className="font-[family-name:var(--font-playfair)] text-3xl sm:text-4xl md:text-5xl text-text-primary mb-8 leading-tight">
          {dict.sections.brandStoryTitle}
        </h2>

        {/* Decorative divider — thin gold line */}
        <div className="w-16 h-px bg-accent/50 mx-auto mb-8" />

        {/* Story text */}
        <p className="text-text-secondary text-lg md:text-xl leading-relaxed max-w-3xl mx-auto">
          {dict.sections.brandStoryText}
        </p>
      </div>
    </section>
  );
}
