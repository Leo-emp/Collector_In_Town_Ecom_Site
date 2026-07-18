// Landing page — the main entry point for the site
// Will be expanded in Task 4 with Hero, New Arrivals, Brand Story, and Brand Logos
import { notFound } from "next/navigation";
import { getDictionary, hasLocale } from "./dictionaries";

export default async function HomePage({
  params,
}: {
  params: Promise<{ lang: string }>; // params is a Promise in Next.js 15+
}) {
  const { lang } = await params;

  // Validate locale — show 404 for unsupported locales
  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  return (
    <div className="flex flex-col items-center justify-center py-20 px-4">
      {/* Placeholder hero — will be replaced with full hero in Task 4 */}
      <h1 className="font-[family-name:var(--font-playfair)] text-5xl md:text-7xl text-accent mb-6 text-center">
        Collector In Town
      </h1>
      <p className="text-text-secondary text-lg md:text-xl text-center max-w-2xl mb-8">
        {dict.hero.subtitle}
      </p>
      <a
        href={`/${lang}/products`}
        className="bg-accent text-background px-8 py-3 rounded-lg font-semibold
                   hover:bg-accent-hover transition-colors text-lg"
      >
        {dict.hero.cta}
      </a>
    </div>
  );
}
