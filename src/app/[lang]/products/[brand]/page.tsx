// Catalog page — product grid for a specific brand or "new-arrivals"
// Supports sorting, search, and pagination via URL search params
// Routes: /en/products/mini-gt, /en/products/hot-wheels, etc.
import { notFound } from "next/navigation";
import { Suspense } from "react";
import { getDictionary, hasLocale } from "../../dictionaries";
import { BRANDS, BRAND_SLUGS, PRODUCTS_PER_PAGE } from "@/lib/constants";
import { ProductCard } from "@/components/catalog/ProductCard";
import { CatalogToolbar } from "@/components/catalog/CatalogToolbar";
import { Pagination } from "@/components/catalog/Pagination";
import type { Metadata } from "next";

// Valid catalog slugs: brand slugs + "new-arrivals"
const VALID_SLUGS = [...BRAND_SLUGS, "new-arrivals"];

// Pre-generate static params for all brand pages
export async function generateStaticParams() {
  return VALID_SLUGS.map((brand) => ({ brand }));
}

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

// Placeholder product data — will be replaced with Supabase queries
// when the database is connected
const PLACEHOLDER_PRODUCTS = [
  { id: "1", name_en: "Nissan GT-R R35 Liberty Walk", name_my: "နစ်ဆန် GT-R R35 Liberty Walk", slug: "nissan-gtr-r35-liberty-walk", brand: "mini-gt", scale: "1:64", price: 45000, photos: [] as string[], stock_count: 15, status: "active", created_at: "2026-07-15" },
  { id: "2", name_en: "Porsche 911 GT3 RS", name_my: "ပေါ့ရှ 911 GT3 RS", slug: "porsche-911-gt3-rs", brand: "mini-gt", scale: "1:64", price: 52000, photos: [] as string[], stock_count: 8, status: "active", created_at: "2026-07-14" },
  { id: "3", name_en: "Toyota AE86 Sprinter Trueno", name_my: "တိုယိုတာ AE86 Sprinter Trueno", slug: "toyota-ae86-sprinter-trueno", brand: "hot-wheels", scale: "1:64", price: 12000, photos: [] as string[], stock_count: 25, status: "active", created_at: "2026-07-13" },
  { id: "4", name_en: "Mazda RX-7 FD3S Spirit R", name_my: "မဇ်ဒါ RX-7 FD3S Spirit R", slug: "mazda-rx7-fd3s-spirit-r", brand: "hot-wheels", scale: "1:64", price: 15000, photos: [] as string[], stock_count: 20, status: "active", created_at: "2026-07-12" },
  { id: "5", name_en: "Honda Civic Type-R EK9", name_my: "ဟွန်ဒါ Civic Type-R EK9", slug: "honda-civic-type-r-ek9", brand: "inno64", scale: "1:64", price: 38000, photos: [] as string[], stock_count: 10, status: "active", created_at: "2026-07-11" },
  { id: "6", name_en: "Mitsubishi Lancer Evolution III", name_my: "မစ်ဆူဘီရှီ Lancer Evolution III", slug: "mitsubishi-lancer-evo-iii", brand: "inno64", scale: "1:64", price: 42000, photos: [] as string[], stock_count: 6, status: "active", created_at: "2026-07-10" },
  { id: "7", name_en: "Nissan Skyline GT-R R34 V-Spec II", name_my: "နစ်ဆန် Skyline GT-R R34 V-Spec II", slug: "nissan-skyline-gtr-r34-vspec-ii", brand: "pop-race", scale: "1:64", price: 35000, photos: [] as string[], stock_count: 12, status: "active", created_at: "2026-07-09" },
  { id: "8", name_en: "Toyota Supra A80 TRD", name_my: "တိုယိုတာ Supra A80 TRD", slug: "toyota-supra-a80-trd", brand: "pop-race", scale: "1:64", price: 32000, photos: [] as string[], stock_count: 0, status: "sold_out", created_at: "2026-07-08" },
];

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

  // Filter products by brand (or show all for new-arrivals)
  let products = brand === "new-arrivals"
    ? [...PLACEHOLDER_PRODUCTS]
    : PLACEHOLDER_PRODUCTS.filter((p) => p.brand === brand);

  // Apply search filter
  if (search.q) {
    const query = search.q.toLowerCase();
    products = products.filter(
      (p) =>
        p.name_en.toLowerCase().includes(query) ||
        p.name_my.includes(query)
    );
  }

  // Apply sorting
  switch (search.sort) {
    case "price-asc":
      products.sort((a, b) => a.price - b.price);
      break;
    case "price-desc":
      products.sort((a, b) => b.price - a.price);
      break;
    case "name":
      products.sort((a, b) => a.name_en.localeCompare(b.name_en));
      break;
    default: // "newest"
      products.sort((a, b) => b.created_at.localeCompare(a.created_at));
  }

  // Pagination
  const currentPage = Math.max(1, parseInt(search.page || "1", 10));
  const totalPages = Math.ceil(products.length / PRODUCTS_PER_PAGE);
  const paginatedProducts = products.slice(
    (currentPage - 1) * PRODUCTS_PER_PAGE,
    currentPage * PRODUCTS_PER_PAGE
  );

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Page header — brand name */}
      <div className="mb-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary">
          {pageTitle}
        </h1>
        <p className="text-text-secondary mt-2 text-sm">
          {products.length} {products.length === 1 ? "model" : "models"}
        </p>
      </div>

      {/* Search + sort toolbar — wrapped in Suspense for searchParams */}
      <Suspense fallback={null}>
        <CatalogToolbar dict={dict} />
      </Suspense>

      {/* Product grid — 4 columns desktop, 2 columns mobile */}
      {paginatedProducts.length > 0 ? (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
          {paginatedProducts.map((product) => (
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
