// Admin Products page — product list with search, filters, and actions
// Will connect to Supabase for real CRUD operations
import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale } from "../../dictionaries";
import { formatPrice } from "@/lib/format";

export const metadata = {
  title: "Products — Admin — Collector In Town",
};

// Placeholder products
const PRODUCTS = [
  { id: "1", name: "Nissan GT-R R35 Liberty Walk", brand: "Mini GT", scale: "1:64", price: 45000, stock: 15, status: "active" },
  { id: "2", name: "Porsche 911 GT3 RS", brand: "Mini GT", scale: "1:64", price: 52000, stock: 8, status: "active" },
  { id: "3", name: "Toyota AE86 Sprinter Trueno", brand: "Hot Wheels", scale: "1:64", price: 12000, stock: 25, status: "active" },
  { id: "4", name: "Mazda RX-7 FD3S Spirit R", brand: "Hot Wheels", scale: "1:64", price: 15000, stock: 20, status: "active" },
  { id: "5", name: "Honda Civic Type-R EK9", brand: "Inno64", scale: "1:64", price: 38000, stock: 10, status: "active" },
  { id: "6", name: "Mitsubishi Lancer Evolution III", brand: "Inno64", scale: "1:64", price: 42000, stock: 6, status: "active" },
  { id: "7", name: "Nissan Skyline GT-R R34 V-Spec II", brand: "Pop Race", scale: "1:64", price: 35000, stock: 12, status: "active" },
  { id: "8", name: "Toyota Supra A80 TRD", brand: "Pop Race", scale: "1:64", price: 32000, stock: 0, status: "sold_out" },
];

export default async function AdminProductsPage({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

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
          <span className="text-text-primary font-medium">{PRODUCTS.length}</span>
        </div>
        <div className="bg-surface rounded-lg border border-border px-4 py-2 text-sm">
          <span className="text-text-muted">Active: </span>
          <span className="text-success font-medium">{PRODUCTS.filter(p => p.status === "active").length}</span>
        </div>
        <div className="bg-surface rounded-lg border border-border px-4 py-2 text-sm">
          <span className="text-text-muted">Sold Out: </span>
          <span className="text-error font-medium">{PRODUCTS.filter(p => p.status === "sold_out").length}</span>
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
              {PRODUCTS.map((product) => (
                <tr key={product.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                  <td className="px-5 py-3">
                    <p className="text-text-primary font-medium">{product.name}</p>
                  </td>
                  <td className="px-5 py-3 text-text-secondary">{product.brand}</td>
                  <td className="px-5 py-3 text-text-secondary">{product.scale}</td>
                  <td className="px-5 py-3 text-right text-text-primary">{formatPrice(product.price)}</td>
                  <td className="px-5 py-3 text-right">
                    <span className={`font-medium ${product.stock === 0 ? "text-error" : product.stock <= 10 ? "text-orange-400" : "text-text-primary"}`}>
                      {product.stock}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full
                      ${product.status === "active" ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                      {product.status === "active" ? "Active" : "Sold Out"}
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
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
