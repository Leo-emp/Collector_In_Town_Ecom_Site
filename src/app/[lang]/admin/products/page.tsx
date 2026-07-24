// Admin Products page — product list with brand tabs and per-brand "Add Product"
// Server component — queries Turso directly
import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale } from "../../dictionaries";
import { formatPrice } from "@/lib/format";
import { db } from "@/lib/drizzle";
import { products } from "@/lib/schema";
import { BRANDS } from "@/lib/constants";
import { desc, eq, count } from "drizzle-orm";

// Force dynamic rendering — products page queries the database
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products — Admin — Collector In Town",
};

export default async function AdminProductsPage({
  params,
  searchParams,
}: {
  params: Promise<{ lang: string }>;
  searchParams: Promise<{ brand?: string }>;
}) {
  const { lang } = await params;
  const search = await searchParams;
  if (!hasLocale(lang)) notFound();

  // Active brand filter from query param (e.g. ?brand=mini-gt)
  const activeBrand = search.brand || null;

  // Fetch products — filtered by brand if selected, otherwise all
  const allProducts = activeBrand
    ? await db.select().from(products).where(eq(products.brand, activeBrand)).orderBy(desc(products.createdAt))
    : await db.select().from(products).orderBy(desc(products.createdAt));

  // Count active and sold_out for the stats bar
  const activeWhere = activeBrand
    ? [eq(products.status, "active"), eq(products.brand, activeBrand)]
    : [eq(products.status, "active")];
  const soldOutWhere = activeBrand
    ? [eq(products.status, "sold_out"), eq(products.brand, activeBrand)]
    : [eq(products.status, "sold_out")];

  const [activeCount] = await db.select({ count: count() }).from(products).where(activeWhere.length > 1 ? eq(products.status, "active") : eq(products.status, "active"));
  const [soldOutCount] = await db.select({ count: count() }).from(products).where(eq(products.status, "sold_out"));

  // Count products per brand for tab badges
  const brandCounts: Record<string, number> = {};
  for (const brand of BRANDS) {
    const [row] = await db.select({ count: count() }).from(products).where(eq(products.brand, brand.slug));
    brandCounts[brand.slug] = row?.count || 0;
  }
  const totalCount = Object.values(brandCounts).reduce((a, b) => a + b, 0);

  // Helper: status badge styling
  const statusBadge = (status: string) => {
    switch (status) {
      case "active": return "bg-success/10 text-success";
      case "draft": return "bg-blue-500/10 text-blue-400";
      case "sold_out": return "bg-error/10 text-error";
      case "discontinued": return "bg-surface text-text-muted";
      default: return "bg-surface text-text-muted";
    }
  };

  return (
    <div>
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary">
          Products
        </h1>
      </div>

      {/* Brand filter tabs */}
      <div className="flex flex-wrap items-center gap-2 mb-6">
        {/* "All" tab */}
        <Link
          href={`/${lang}/admin/products`}
          className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
            ${!activeBrand
              ? "bg-accent text-background"
              : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
        >
          All ({totalCount})
        </Link>

        {/* Per-brand tabs */}
        {BRANDS.map((brand) => (
          <Link
            key={brand.slug}
            href={`/${lang}/admin/products?brand=${brand.slug}`}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors
              ${activeBrand === brand.slug
                ? "bg-accent text-background"
                : "bg-surface border border-border text-text-secondary hover:text-text-primary hover:bg-surface-hover"
              }`}
          >
            {brand.name} ({brandCounts[brand.slug] || 0})
          </Link>
        ))}
      </div>

      {/* Add Product button — pre-selects brand if filtered */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex gap-4">
          <div className="bg-surface rounded-lg border border-border px-4 py-2 text-sm">
            <span className="text-text-muted">Showing: </span>
            <span className="text-text-primary font-medium">{allProducts.length}</span>
          </div>
          <div className="bg-surface rounded-lg border border-border px-4 py-2 text-sm">
            <span className="text-text-muted">Active: </span>
            <span className="text-success font-medium">{activeCount?.count || 0}</span>
          </div>
          <div className="bg-surface rounded-lg border border-border px-4 py-2 text-sm">
            <span className="text-text-muted">Sold Out: </span>
            <span className="text-error font-medium">{soldOutCount?.count || 0}</span>
          </div>
        </div>
        <Link
          href={`/${lang}/admin/products/new${activeBrand ? `?brand=${activeBrand}` : ""}`}
          className="px-4 py-2.5 bg-accent text-background rounded-lg font-semibold text-sm
                     hover:bg-accent-hover transition-colors"
        >
          + Add {activeBrand ? BRANDS.find((b) => b.slug === activeBrand)?.name || "Product" : "Product"}
        </Link>
      </div>

      {/* Products table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/30">
                <th className="text-left text-text-muted font-medium px-5 py-3">Product</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Brand</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Scale</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Price</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Stock</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Status</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-muted">
                    No products yet. Click &quot;+ Add Product&quot; to create one.
                  </td>
                </tr>
              ) : (
                allProducts.map((product) => (
                  <tr key={product.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-text-primary font-medium">{product.nameEn}</p>
                    </td>
                    <td className="px-5 py-3 text-text-secondary capitalize">{product.brand.replace("-", " ")}</td>
                    <td className="px-5 py-3 text-text-secondary">{product.scale}</td>
                    <td className="px-5 py-3 text-right text-text-primary">{formatPrice(product.price)}</td>
                    <td className="px-5 py-3 text-right">
                      <span className={`font-medium ${product.stockCount === 0 ? "text-error" : product.stockCount <= 10 ? "text-orange-400" : "text-text-primary"}`}>
                        {product.stockCount}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusBadge(product.status)}`}>
                        {product.status.replace("_", " ")}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/${lang}/admin/products/${product.id}`}
                        className="text-accent text-xs hover:underline"
                      >
                        Edit
                      </Link>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
