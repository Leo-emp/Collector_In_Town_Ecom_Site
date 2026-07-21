// Admin Products page — product list with real data from Drizzle
// Server component — queries Turso directly
import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale } from "../../dictionaries";
import { formatPrice } from "@/lib/format";
import { db } from "@/lib/drizzle";
import { products } from "@/lib/schema";
import { desc, eq, count } from "drizzle-orm";

// Force dynamic rendering — products page queries the database
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Products — Admin — Collector In Town",
};

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Fetch all products ordered by newest first (admin sees ALL statuses)
  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  // Count active and sold_out for the stats bar
  const [activeCount] = await db.select({ count: count() }).from(products).where(eq(products.status, "active"));
  const [soldOutCount] = await db.select({ count: count() }).from(products).where(eq(products.status, "sold_out"));

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
      {/* Header with add button */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary">
          Products
        </h1>
        <Link
          href={`/${lang}/admin/products/new`}
          className="px-4 py-2.5 bg-accent text-background rounded-lg font-semibold text-sm
                     hover:bg-accent-hover transition-colors"
        >
          + Add Product
        </Link>
      </div>

      {/* Stats bar */}
      <div className="flex gap-4 mb-6">
        <div className="bg-surface rounded-lg border border-border px-4 py-2 text-sm">
          <span className="text-text-muted">Total: </span>
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
