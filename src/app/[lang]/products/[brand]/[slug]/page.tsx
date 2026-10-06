// Product detail page — full product info with gallery, specs, and related items
// Server component — queries Turso directly via Drizzle
// Route: /en/products/mini-gt/nissan-gtr-r35-liberty-walk
import { notFound } from "next/navigation";
import Link from "next/link";
import { getDictionary, hasLocale } from "../../../dictionaries";
import { formatPrice } from "@/lib/format";
import { PhotoGallery } from "@/components/product/PhotoGallery";
import { AddToCartButton } from "@/components/product/AddToCartButton";
import { ProductCard } from "@/components/catalog/ProductCard";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { eq, and, ne, or, inArray } from "drizzle-orm";
import type { Metadata } from "next";

// Revalidate every 60 seconds — serves cached page, refreshes in background
export const revalidate = 60;

// Dynamic metadata from real product data
export async function generateMetadata({
  params,
}: {
  params: Promise<{ lang: string; brand: string; slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  // Look up product by slug for title/description
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug));

  if (!product) return { title: "Product Not Found" };
  return {
    title: `${product.nameEn} — Collector In Town`,
    description: product.descriptionEn || undefined,
  };
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ lang: string; brand: string; slug: string }>;
}) {
  const { lang, slug } = await params;

  if (!hasLocale(lang)) notFound();

  const dict = await getDictionary(lang);

  // Fetch the product by URL slug
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug));

  // 404 if product doesn't exist
  if (!product) notFound();

  // Fetch images for this product, ordered by display_order
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.displayOrder);

  // Extract image URLs for the photo gallery
  const photoUrls = images.map((img) => img.url);

  const name = product.nameEn;
  const description = product.descriptionEn;
  const isInStock = product.stockCount > 0 && product.status === "active";

  // Related products — up to 4 from the same brand, excluding current product
  const relatedRaw = await db
    .select()
    .from(products)
    .where(
      and(
        eq(products.brand, product.brand),
        ne(products.id, product.id),
        or(eq(products.status, "active"), eq(products.status, "sold_out"))
      )
    )
    .limit(4);

  // Fetch images only for related products (not ALL images in the DB)
  const relatedIds = relatedRaw.map((p) => p.id);
  const relatedImages = relatedIds.length > 0
    ? await db.select().from(productImages)
        .where(inArray(productImages.productId, relatedIds))
        .orderBy(productImages.displayOrder)
    : [];

  // Map related products to ProductCard format
  const relatedProducts = relatedRaw.map((p) => {
    const imgs = relatedImages.filter((img) => img.productId === p.id);
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
      {/* Breadcrumb */}
      <nav className="flex items-center gap-2 text-sm text-text-muted mb-6">
        <Link href={`/${lang}`} className="hover:text-accent transition-colors">
          {dict.nav.home}
        </Link>
        <span>/</span>
        <Link
          href={`/${lang}/products/${product.brand}`}
          className="hover:text-accent transition-colors capitalize"
        >
          {product.brand.replace("-", " ")}
        </Link>
        <span>/</span>
        <span className="text-text-secondary truncate max-w-[200px]">{name}</span>
      </nav>

      {/* Product layout — 2 columns on desktop */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-12">
        {/* Left column: Photo gallery */}
        <PhotoGallery photos={photoUrls} productName={name} />

        {/* Right column: Product info */}
        <div>
          {/* Brand label */}
          <p className="text-accent text-sm uppercase tracking-wider mb-2">
            {product.brand.replace("-", " ")}
          </p>

          {/* Product name */}
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl md:text-4xl text-text-primary mb-4">
            {name}
          </h1>

          {/* Price */}
          <p className="text-accent text-2xl font-bold mb-6">
            {formatPrice(product.price)}
          </p>

          {/* Stock status */}
          <div className="flex items-center gap-2 mb-6">
            <span
              className={`inline-flex items-center gap-1.5 text-sm font-medium px-3 py-1 rounded-full
                ${isInStock ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
            >
              <span className={`w-2 h-2 rounded-full ${isInStock ? "bg-success" : "bg-error"}`} />
              {isInStock ? dict.product.inStock : dict.product.outOfStock}
            </span>
          </div>

          {/* Specs table */}
          <div className="border-t border-border pt-4 mb-6 space-y-3">
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{dict.product.brand}</span>
              <span className="text-text-primary capitalize">{product.brand.replace("-", " ")}</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-text-secondary">{dict.product.scale}</span>
              <span className="text-text-primary">{product.scale}</span>
            </div>
          </div>

          {/* Details box — extra product info from admin */}
          {product.details && (
            <div className="border-t border-border pt-4 mb-6">
              <h2 className="text-text-primary font-semibold text-sm mb-2">Details</h2>
              <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                {product.details}
              </p>
            </div>
          )}

          {/* Terms & Conditions box — collapsible, controlled by admin toggle */}
          {product.showTerms === 1 && product.terms && (
            <div className="border-t border-border pt-4 mb-6">
              <h2 className="text-text-primary font-semibold text-sm mb-2">Terms & Conditions</h2>
              <div className="bg-surface rounded-lg border border-border p-3">
                <p className="text-text-secondary text-sm leading-relaxed whitespace-pre-line">
                  {product.terms}
                </p>
              </div>
            </div>
          )}

          {/* Add to cart */}
          <div className="mb-8">
            <AddToCartButton
              productId={product.id}
              isInStock={isInStock}
              dict={dict}
            />
          </div>

          {/* Description */}
          {description && (
            <div className="border-t border-border pt-6">
              <h2 className="text-text-primary font-semibold mb-3">
                {dict.product.description}
              </h2>
              <p className="text-text-secondary leading-relaxed">
                {description}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Related products */}
      {relatedProducts.length > 0 && (
        <section className="mt-16 border-t border-border pt-12">
          <h2 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary mb-8">
            {dict.product.relatedProducts}
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {relatedProducts.map((p) => (
              <ProductCard key={p.id} product={p} lang={lang} dict={dict} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
