// Brand products section — horizontal scrollable row of products for a specific brand
// Always renders with placeholder cards when no products exist yet
// Server component — queries Turso directly via Drizzle
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { eq, and, or, desc } from "drizzle-orm";

interface BrandProductsSectionProps {
  lang: string;
  // Brand slug — e.g. "mini-gt", "hot-wheels"
  brandSlug: string;
  // Display name — e.g. "Mini GT", "Hot Wheels"
  brandName: string;
  // Path to the brand logo image (optional — falls back to text name)
  brandLogo?: string;
}

// Placeholder card component — shown when no real products exist
function PlaceholderCard() {
  return (
    <div className="flex-shrink-0 w-[200px] sm:w-[240px] snap-start">
      {/* Placeholder image area */}
      <div className="aspect-square bg-surface rounded-xl overflow-hidden mb-3
                      border border-border flex items-center justify-center">
        <svg className="w-16 h-16 text-text-muted/30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      </div>
      {/* Placeholder text lines */}
      <div className="h-3 bg-surface rounded w-3/4 mb-2" />
      <div className="h-3 bg-surface rounded w-1/2" />
    </div>
  );
}

export async function BrandProductsSection({ lang, brandSlug, brandName, brandLogo }: BrandProductsSectionProps) {
  // Fetch products for this brand
  let displayProducts: {
    id: string;
    name_en: string;
    slug: string;
    brand: string;
    price: number;
    photo: string | null;
  }[] = [];

  try {
    // Fetch up to 8 active/sold_out products for this brand, newest first
    const productList = await db
      .select()
      .from(products)
      .where(
        and(
          eq(products.brand, brandSlug),
          or(eq(products.status, "active"), eq(products.status, "sold_out"))
        )
      )
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
        slug: p.slug,
        brand: p.brand,
        price: p.price,
        photo: imgs[0]?.url || null,
      };
    });
  } catch {
    // DB error — still show the section with placeholders
  }

  // How many placeholder cards to show to fill the row
  const placeholderCount = displayProducts.length === 0
    ? 6
    : Math.max(0, 6 - displayProducts.length);

  return (
    <section className="py-10 px-4">
      <div className="max-w-7xl mx-auto">
        {/* Section header — brand logo + name + "View All" link */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-3">
            {brandLogo && (
              <img
                src={brandLogo}
                alt={brandName}
                className={`object-contain
                  ${brandSlug === "hot-wheels" ? "h-16 sm:h-24" : ""}
                  ${brandSlug === "mini-gt" ? "h-10 sm:h-14" : ""}
                  ${brandSlug === "inno64" ? "h-8 sm:h-10 w-auto" : ""}
                  ${brandSlug === "pop-race" ? "h-8 sm:h-11" : ""}
                  ${brandSlug === "tomica" ? "h-10 sm:h-14" : ""}
                  ${brandSlug === "trends-hobby" ? "h-10 sm:h-14" : ""}
                  ${!["hot-wheels","mini-gt","inno64","pop-race","tomica","trends-hobby"].includes(brandSlug) ? "h-8 sm:h-12" : ""}
                `}
              />
            )}
            <h3 className="font-[family-name:var(--font-cinzel)] text-2xl md:text-3xl text-text-primary">
              {brandName}
            </h3>
          </div>
          <Link
            href={`/${lang}/products/${brandSlug}`}
            className="text-accent hover:text-accent-hover transition-colors text-sm font-medium
                       flex items-center gap-1"
          >
            View All
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </Link>
        </div>

        {/* Horizontal scrollable product strip */}
        <div className="flex gap-4 overflow-x-auto pb-4 snap-x snap-mandatory scrollbar-hide
                        -mx-4 px-4">
          {/* Real products */}
          {displayProducts.map((product) => (
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
                    alt={product.name_en}
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
              <h3 className="text-text-primary text-sm font-medium line-clamp-2 mb-1
                             group-hover:text-accent transition-colors">
                {product.name_en}
              </h3>
              <p className="text-accent font-semibold text-sm">
                {formatPrice(product.price)}
              </p>
            </Link>
          ))}

          {/* Placeholder cards to fill the row */}
          {Array.from({ length: placeholderCount }).map((_, i) => (
            <PlaceholderCard key={`placeholder-${i}`} />
          ))}
        </div>
      </div>
    </section>
  );
}
