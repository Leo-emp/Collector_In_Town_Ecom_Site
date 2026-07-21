// Catalog page — product grid for a specific brand or "new-arrivals"
// Server component — queries Turso directly via Drizzle
// Routes: /en/products/mini-gt, /en/products/hot-wheels, etc.
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDictionary, hasLocale } from "../../dictionaries";
import { BRANDS, BRAND_SLUGS, PRODUCTS_PER_PAGE } from "@/lib/constants";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { Pagination } from "@/components/catalog/Pagination";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { eq, like, desc, asc, and, or, count } from "drizzle-orm";
import type { Metadata } from "next";

// Force dynamic rendering — catalog queries the database
export const dynamic = "force-dynamic";

// Valid catalog slugs: brand slugs + "new-arrivals"
const VALID_SLUGS = [...BRAND_SLUGS, "new-arrivals"];

// Dynamic metadata based on brand
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; brand: string }>;
}): Promise<Metadata> {
  const { brand } = await params;
  const brandInfo = BRANDS.find((b) => b.slug === brand);
  const title = brandInfo
    ? `${brandInfo.name} — Collector In Town`
    : "New Arrivals — Collector In Town";

  return { title };
}

export default async function CatalogPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string; brand: string }>;
  searchParams: Promise<{ sort?: string; q?: string; page?: string }>;
}) {
  const { lang, brand } = await params;
  const search = await searchParams;

  // Validate locale
  if (!hasLocale(lang)) notFound();

  // Validate brand slug
  if (!VALID_SLUGS.includes(brand)) notFound();

  const dict = await getDictionary(lang);

  // Get brand display info
  const brandInfo = BRANDS.find((b) => b.slug === brand);
  const pageTitle = brand === "new-arrivals"
    ? dict.sections.newArrivals
    : brandInfo?.name || brand;

  // Build WHERE conditions — show active + sold_out products
  const conditions = [or(eq(products.status, "active"), eq(products.status, "sold_out"))!];
  // Filter by brand (unless "new-arrivals" which shows all)
  if (brand !== "new-arrivals") {
    conditions.push(eq(products.brand, brand));
  }
  // Apply search filter if provided
  if (search.q) {
    conditions.push(like(products.nameEn, `%${search.q}%`));
  }

  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  // Determine sort order
  const sortOrder = search.sort;
  const orderBy =
    sortOrder === "price-asc" ? asc(products.price) :
    sortOrder === "price-desc" ? desc(products.price) :
    sortOrder === "name" ? asc(products.nameEn) :
    desc(products.createdAt); // "newest" default

  // Count total matching products for pagination
  const [countRow] = await db.select({ total: count() }).from(products).where(where);
  const totalProducts = countRow?.total || 0;

  // Pagination
  const currentPage = Math.max(1, parseInt(search.page || "1", 10));
  const totalPages = Math.ceil(totalProducts / PRODUCTS_PER_PAGE);
  const offset = (currentPage - 1) * PRODUCTS_PER_PAGE;

  // Fetch products for current page
  const productList = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(orderBy)
    .limit(PRODUCTS_PER_PAGE)
    .offset(offset);

  // Fetch images for these products
  const allImages = productList.length > 0
    ? await db.select().from(productImages).orderBy(productImages.displayOrder)
    : [];

  // Map to ProductCard format — match the expected interface
  const displayProducts = productList.map((p) => {
    const imgs = allImages.filter((img) => img.productId === p.id);
    return {
      id: p.id,
      name_en: p.nameEn,
      name_my: p.nameMy || p.nameEn,
      slug: p.slug,
      brand: p.brand,
      price: p.price,
      photos: imgs.map((img) => img.url),
      stock_count: p.stockCount,
      status: p.status,
    };
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header — brand name */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary">
          {pageTitle}
        </h1>
        <p className="text-text-secondary mt-2 text-sm">
          {totalProducts} {totalProducts === 1 ? "model" : "models"}
        </p>
      </div>

      {/* Search + sort toolbar — wrapped in Suspense for searchParams */}
      <Suspense fallback={null}>
        <CatalogToolbar dict={dict} />
      </Suspense>

      {/* Product grid — 4 columns desktop, 2 columns mobile */}
      {displayProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {displayProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              lang={lang}
              dict={dict}
            />
          ))}
        </div>
      ) : (
        // Empty state
        <div className="text-center py-20">
          <svg className="w-16 h-16 text-text-muted/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
              d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <p className="text-text-secondary text-lg">{dict.product.noProducts}</p>
        </div>
      )}

      {/* Pagination — wrapped in Suspense for searchParams */}
      <Suspense fallback={null}>
        <Pagination totalPages={totalPages} currentPage={currentPage} />
      </Suspense>
    </div>
  );
}
