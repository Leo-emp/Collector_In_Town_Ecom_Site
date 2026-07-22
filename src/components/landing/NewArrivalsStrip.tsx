// New arrivals strip — horizontal scrollable row of latest products
// Server component — queries Turso directly via Drizzle
import Link from "next/link";
import type { Dictionary } from "@/app/[lang]/dictionaries";
import { formatPrice } from "@/lib/format";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { eq, or, desc } from "drizzle-orm";

interface NewArrivalsStripProps {
  lang: string;
  dict: Dictionary;
}

export async function NewArrivalsStrip({ lang, dict }: NewArrivalsStripProps) {
  // Try to fetch products — gracefully show empty state if DB isn't configured yet
  let displayProducts: {
    id: string;
    name_en: string;
    name_my: string;
    slug: string;
    brand: string;
    price: number;
    photo: string | null;
  }[] = [];

  try {
    // Fetch the 8 newest active/sold_out products
    const productList = await db
      .select()
      .from(products)
      .where(or(eq(products.status, "active"), eq(products.status, "sold_out")))
      .orderBy(desc(products.createdAt))
      .limit(8);

    // Fetch images for these products
    const allImages = productList.length > 0
      ? await db.select().from(productImages).orderBy(productImages.displayOrder)
      : [];

    // Map products with their first image URL
    displayProducts = productList.map((p) => {
      const imgs = allImages.filter((img) => img.productId === p.id);
      return {
        id: p.id,
        name_en: p.nameEn,
        name_my: p.nameMy || p.nameEn,
        slug: p.slug,
        brand: p.brand,
        price: p.price,
        photo: imgs[0]?.url || null,
      };
    });
  } catch {
    // DB not configured yet — show empty state instead of crashing the page
  }

  return (
    <section className="py-16 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header — title + "View All" link */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h2 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary">
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
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Horizontal scrollable product strip */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide
                        -mx-4 px-4">
          {displayProducts.length === 0 ? (
            <p className="text-text-muted text-sm py-8">No products yet — check back soon!</p>
          ) : (
            displayProducts.map((product) => (
              <Link
                key={product.id}
                href={`/${lang}/products/${product.brand}/${product.slug}`}
                className="group flex-shrink-0 w-[200px] sm:w-[240px] snap-start"
              >
                {/* Product image */}
                <div className="aspect-square bg-surface rounded-xl overflow-hidden mb-3
                                border border-border group-hover:border-accent/30 transition-colors">
                  {product.photo ? (
                    <img
                      src={product.photo}
                      alt={lang === "my" ? product.name_my : product.name_en}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
                      loading="lazy"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center">
                      <svg className="w-16 h-16 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                          d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
                      </svg>
                    </div>
                  )}
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
            ))
          )}
        </div>

        {/* Mobile "View All" link */}
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
