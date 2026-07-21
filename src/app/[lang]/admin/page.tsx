// Admin Dashboard — overview with key metrics and recent activity
// Queries real data from Turso via Drizzle ORM
import { notFound } from "next/navigation";
import { hasLocale } from "../dictionaries";
import { formatPrice, formatDate } from "@/lib/format";
import { db } from "@/lib/drizzle";
import { orders, products } from "@/lib/schema";
import { count, sum, eq, desc, lte, and, sql } from "drizzle-orm";

// Force dynamic rendering — dashboard queries the database
export const dynamic = "force-dynamic";

export const metadata = {
  title: "Admin Dashboard — Collector In Town",
};

// Stat card icon paths — each maps to a dashboard metric
const STAT_ICONS = {
  revenue: "M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z",
  orders: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z",
  products: "M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4",
  customers: "M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z",
};

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ lang: string }>;
}) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // ─── Query real stats from database ───────────────────
  // Total revenue from paid orders only
  const [revenueRow] = await db
    .select({ total: sum(orders.total) })
    .from(orders)
    .where(eq(orders.paymentStatus, "paid"));
  const totalRevenue = Number(revenueRow?.total) || 0;

  // Total order count (all statuses)
  const [orderCountRow] = await db.select({ count: count() }).from(orders);
  const totalOrders = orderCountRow?.count || 0;

  // Active product count
  const [productCountRow] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.status, "active"));
  const totalProducts = productCountRow?.count || 0;

  // Unique customer count (distinct emails from orders)
  const [customerCountRow] = await db
    .select({ count: sql<number>`count(distinct ${orders.customerEmail})` })
    .from(orders);
  const totalCustomers = customerCountRow?.count || 0;

  // Build stats array for rendering
  const stats = [
    { label: "Total Revenue", value: formatPrice(totalRevenue), icon: STAT_ICONS.revenue },
    { label: "Orders", value: totalOrders.toString(), icon: STAT_ICONS.orders },
    { label: "Products", value: totalProducts.toString(), icon: STAT_ICONS.products },
    { label: "Customers", value: totalCustomers.toString(), icon: STAT_ICONS.customers },
  ];

  // Recent orders — last 10 for the dashboard feed
  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(10);

  // Low stock products — active products with stock <= 10
  const lowStock = await db
    .select()
    .from(products)
    .where(and(eq(products.status, "active"), lte(products.stockCount, 10)))
    .orderBy(products.stockCount)
    .limit(10);

  // Helper: status badge color
  const statusColor = (status: string) => {
    switch (status) {
      case "delivered": return "bg-success/10 text-success";
      case "shipped": return "bg-blue-500/10 text-blue-400";
      case "confirmed": return "bg-accent/10 text-accent";
      case "pending": return "bg-orange-500/10 text-orange-400";
      case "cancelled": return "bg-error/10 text-error";
      default: return "bg-surface text-text-muted";
    }
  };

  return (
    <div>
      <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary mb-6">
        Dashboard
      </h1>

      {/* Stat cards — 4 columns on desktop */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-start justify-between">
              <div>
                <p className="text-text-muted text-sm">{stat.label}</p>
                <p className="text-text-primary text-2xl font-bold mt-1">{stat.value}</p>
              </div>
              <div className="p-2 bg-accent/10 rounded-lg">
                <svg className="w-5 h-5 text-accent" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d={stat.icon} />
                </svg>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent orders — takes 2 columns */}
        <div className="lg:col-span-2 bg-surface rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-text-primary font-semibold">Recent Orders</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-text-muted font-medium px-5 py-3">Order</th>
                  <th className="text-left text-text-muted font-medium px-5 py-3">Customer</th>
                  <th className="text-left text-text-muted font-medium px-5 py-3">Status</th>
                  <th className="text-right text-text-muted font-medium px-5 py-3">Total</th>
                </tr>
              </thead>
              <tbody>
                {recentOrders.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-5 py-8 text-center text-text-muted">
                      No orders yet
                    </td>
                  </tr>
                ) : (
                  recentOrders.map((order) => (
                    <tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface-hover transition-colors">
                      <td className="px-5 py-3">
                        <p className="text-accent font-medium">{order.orderNumber}</p>
                        <p className="text-text-muted text-xs">{formatDate(order.createdAt)}</p>
                      </td>
                      <td className="px-5 py-3 text-text-secondary">{order.customerName}</td>
                      <td className="px-5 py-3">
                        <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor(order.orderStatus)}`}>
                          {order.orderStatus}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right text-text-primary font-medium">
                        {formatPrice(order.total)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Low stock alerts — takes 1 column */}
        <div className="bg-surface rounded-xl border border-border">
          <div className="p-5 border-b border-border">
            <h2 className="text-text-primary font-semibold">Low Stock Alerts</h2>
          </div>
          <div className="p-5 space-y-4">
            {lowStock.length === 0 ? (
              <p className="text-text-muted text-sm">All products are well stocked</p>
            ) : (
              lowStock.map((item) => (
                <div key={item.id} className="flex items-center justify-between">
                  <div>
                    <p className="text-text-primary text-sm font-medium">{item.nameEn}</p>
                    <p className="text-text-muted text-xs capitalize">{item.brand.replace("-", " ")}</p>
                  </div>
                  <span className={`text-xs font-bold px-2.5 py-1 rounded-full
                    ${item.stockCount === 0
                      ? "bg-error/10 text-error"
                      : item.stockCount <= 5
                        ? "bg-orange-500/10 text-orange-400"
                        : "bg-accent/10 text-accent"
                    }`}
                  >
                    {item.stockCount === 0 ? "OUT" : item.stockCount}
                  </span>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
