// New arrivals strip — horizontal scrollable row of latest products
// Fetches from Supabase in production; uses placeholder cards for now
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { formatPrice } from "@/lib/format";

interface NewArrivalsStripProps {
  lang: string;
  dict: Dictionary;
}

// Placeholder product data — will be replaced with Supabase query
// when the database is connected
const PLACEHOLDER_PRODUCTS = [
  { id: "1", name_en: "Nissan GT-R R35 Liberty Walk", name_my: "နစ်ဆန် GT-R R35", slug: "nissan-gtr-r35-liberty-walk", brand: "mini-gt", price: 45000 },
  { id: "2", name_en: "Porsche 911 GT3 RS", name_my: "ပေါ့ရှ 911 GT3 RS", slug: "porsche-911-gt3-rs", brand: "mini-gt", price: 52000 },
  { id: "3", name_en: "Toyota AE86 Sprinter Trueno", name_my: "တိုယိုတာ AE86", slug: "toyota-ae86-sprinter-trueno", brand: "hot-wheels", price: 12000 },
  { id: "4", name_en: "Mazda RX-7 FD3S Spirit R", name_my: "မဇ်ဒါ RX-7", slug: "mazda-rx7-fd3s-spirit-r", brand: "hot-wheels", price: 15000 },
  { id: "5", name_en: "Honda Civic Type-R EK9", name_my: "ဟွန်ဒါ Civic EK9", slug: "honda-civic-type-r-ek9", brand: "inno64", price: 38000 },
  { id: "6", name_en: "Mitsubishi Lancer Evo III", name_my: "မစ်ဆူဘီရှီ Evo III", slug: "mitsubishi-lancer-evo-iii", brand: "inno64", price: 42000 },
  { id: "7", name_en: "Nissan Skyline GT-R R34", name_my: "နစ်ဆန် R34", slug: "nissan-skyline-gtr-r34-vspec-ii", brand: "pop-race", price: 35000 },
  { id: "8", name_en: "Toyota Supra A80 TRD", name_my: "တိုယိုတာ Supra A80", slug: "toyota-supra-a80-trd", brand: "pop-race", price: 32000 },
];

export function NewArrivalsStrip({ lang, dict }: NewArrivalsStripProps) {
  const products = PLACEHOLDER_PRODUCTS;

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header — title + "View All" link */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-[family-name:var(--font-playfair)] text-3xl md:text-4xl text-text-primary">
              {dict.sections.newArrivals}
            </h2>
            <p className="text-text-secondary mt-2">
              {dict.sections.newArrivalsDesc}
            </p>
          </div>
          <Link
            href={`/${lang}/products/new-arrivals`}
            className="text-accent hover:text-accent-hover transition-colors text-sm font-medium
                       hidden sm:flex items-center gap-1"
          >
            {dict.sections.viewAll}
            {/* Arrow icon */}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Horizontal scrollable product strip */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide
                        -mx-4 px-4">
          {products.map((product) => (
            <Link
              key={product.id}
              href={`/${lang}/products/${product.slug}`}
              className="group flex-shrink-0 w-[200px] sm:w-[240px] snap-start"
            >
              {/* Product image placeholder — grey box */}
              <div className="aspect-square bg-surface rounded-xl overflow-hidden mb-3
                              border border-border group-hover:border-accent/30 transition-colors">
                <div className="w-full h-full flex items-center justify-center">
                  {/* Placeholder car icon — replaced with actual product images later */}
                  <svg className="w-16 h-16 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                      d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                  </svg>
                </div>
              </div>

              {/* Product info */}
              <p className="text-text-secondary text-xs uppercase tracking-wider mb-1">
                {product.brand.replace("-", " ")}
              </p>
              <h3 className="text-text-primary text-sm font-medium line-clamp-2 mb-1
                             group-hover:text-accent transition-colors">
                {lang === "my" ? product.name_my : product.name_en}
              </h3>
              <p className="text-accent font-semibold text-sm">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}
        </div>

        {/* Mobile "View All" link — shown below the strip on small screens */}
        <div className="sm:hidden mt-4 text-center">
          <Link
            href={`/${lang}/products/new-arrivals`}
            className="text-accent hover:text-accent-hover transition-colors text-sm font-medium
                       inline-flex items-center gap-1"
          >
            {dict.sections.viewAll}
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>
    </section>
  );
}
