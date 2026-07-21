// Admin Customers page — aggregated customer list from orders
// Server component — queries Turso directly
// Customers are derived from orders (no separate customer table)
import { notFound } from "next/navigation";
import { hasLocale } from "../../dictionaries";
import { formatPrice, formatDate } from "@/lib/format";
import { db } from "@/lib/drizzle";
import { orders } from "@/lib/schema";
import { count, sum, min, sql } from "drizzle-orm";

// Force dynamic rendering — customers page queries the database
export const dynamic = "force-dynamic";

export const metadata = { title: "Customers — Admin — Collector In Town" };

export default async function AdminCustomersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Aggregate customer data from orders — group by email
  // Each unique email = one customer, with their total orders and spend
  const customers = await db
    .select({
      email: orders.customerEmail,
      name: orders.customerName,
      phone: orders.customerPhone,
      orderCount: count(),
      totalSpent: sum(orders.total),
      // First order date = when they "joined"
      firstOrder: min(orders.createdAt),
    })
    .from(orders)
    .groupBy(orders.customerEmail)
    .orderBy(sql`count(*) desc`);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary mb-6">Customers</h1>

      <p className="text-text-muted text-sm mb-6">{customers.length} unique customer{customers.length !== 1 ? "s" : ""}</p>

      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/30">
                <th className="text-left text-text-muted font-medium px-5 py-3">Customer</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Phone</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Orders</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Total Spent</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">First Order</th>
              </tr>
            </thead>
            <tbody>
              {customers.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-5 py-8 text-center text-text-muted">
                    No customers yet — they&apos;ll appear here after the first order
                  </td>
                </tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.email} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-text-primary font-medium">{c.name}</p>
                      <p className="text-text-muted text-xs">{c.email}</p>
                    </td>
                    <td className="px-5 py-3 text-text-secondary">{c.phone}</td>
                    <td className="px-5 py-3 text-center text-text-primary">{c.orderCount}</td>
                    <td className="px-5 py-3 text-right text-accent font-medium">{formatPrice(Number(c.totalSpent) || 0)}</td>
                    <td className="px-5 py-3 text-right text-text-muted">{c.firstOrder ? formatDate(c.firstOrder) : "—"}</td>
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
