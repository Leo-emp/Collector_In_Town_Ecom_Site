// 3D Featured Showcase placeholder — will be replaced with React Three Fiber in Task 5
// Shows a styled placeholder section to maintain the landing page flow
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface FeaturedShowcasePlaceholderProps {
  dict: Dictionary;
}

export function FeaturedShowcasePlaceholder({ dict }: FeaturedShowcasePlaceholderProps) {
  return (
    <section className="py-16 px-4 border-t border-border">
      <div className="max-w-7xl mx-auto">
        {/* Section header */}
        <div className="text-center mb-10">
          <p className="text-accent/60 text-sm uppercase tracking-[0.3em] mb-3">
            {dict.sections.featuredShowcase}
          </p>
          <h2 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary">
            {dict.sections.featuredShowcaseDesc}
          </h2>
        </div>

        {/* Placeholder cards — will be replaced with 3D interactive models */}
        <div className="flex gap-6 overflow-x-auto pb-4 snap-x snap-mandatory
                        -mx-4 px-4 scrollbar-hide">
          {[1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="flex-shrink-0 w-[280px] snap-center"
            >
              {/* 3D viewer placeholder — dark box with rotating icon */}
              <div className="aspect-[4/3] bg-surface rounded-xl border border-border
                              flex items-center justify-center relative overflow-hidden">
                {/* Subtle animated gradient */}
                <div
                  className="absolute inset-0 opacity-30"
                  style={{
                    background: `radial-gradient(circle at 50% 50%, rgba(201, 168, 76, 0.1) 0%, transparent 70%)`,
                  }}
                />
                {/* 3D rotation icon */}
                <svg className="w-12 h-12 text-text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M21 12a9 9 0 01-9 9m9-9a9 9 0 00-9-9m9 9H3m9 9a9 9 0 01-9-9m9 9c1.657 0 3-4.03 3-9s-1.343-9-3-9m0 18c-1.657 0-3-4.03-3-9s1.343-9 3-9m-9 9a9 9 0 019-9" />
                </svg>
              </div>
              {/* Model name placeholder */}
              <div className="mt-3 text-center">
                <div className="h-4 w-32 bg-surface rounded mx-auto mb-2" />
                <div className="h-3 w-20 bg-surface rounded mx-auto" />
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
