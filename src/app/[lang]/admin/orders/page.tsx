// Admin Orders page — order list with real data from Drizzle
// Server component — queries Turso directly
import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale } from "../../dictionaries";
import { formatPrice, formatDate } from "@/lib/format";
import { db } from "@/lib/drizzle";
import { orders, orderItems } from "@/lib/schema";
import { desc, eq, count, sql } from "drizzle-orm";

// Force dynamic rendering — orders page queries the database
export const dynamic = "force-dynamic";

export const metadata = { title: "Orders — Admin — Collector In Town" };

// All possible order statuses for the stats bar
const STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"] as const;

export default async function AdminOrdersPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Fetch all orders, newest first
  const allOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt));

  // Get item counts per order in one query (group by orderId)
  const itemCounts = await db
    .select({
      orderId: orderItems.orderId,
      itemCount: count(),
    })
    .from(orderItems)
    .groupBy(orderItems.orderId);

  // Build a lookup map for quick access: orderId → itemCount
  const itemCountMap = new Map(itemCounts.map((r) => [r.orderId, r.itemCount]));

  // Count orders per status for the stats bar
  const statusCounts = await db
    .select({
      status: orders.orderStatus,
      count: count(),
    })
    .from(orders)
    .groupBy(orders.orderStatus);

  // Build status count map
  const statusCountMap = new Map(statusCounts.map((r) => [r.status, r.count]));

  // Helper: badge color per order status
  const statusColor = (s: string) => {
    switch (s) {
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
      <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary mb-6">Orders</h1>

      {/* Status stats bar */}
      <div className="flex gap-4 mb-6 flex-wrap">
        {STATUSES.map((s) => (
          <div key={s} className="bg-surface rounded-lg border border-border px-4 py-2 text-sm">
            <span className="text-text-muted capitalize">{s}: </span>
            <span className="text-text-primary font-medium">{statusCountMap.get(s) || 0}</span>
          </div>
        ))}
      </div>

      {/* Orders table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/30">
                <th className="text-left text-text-muted font-medium px-5 py-3">Order</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Customer</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Payment</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Items</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Status</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Total</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {allOrders.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-5 py-8 text-center text-text-muted">
                    No orders yet
                  </td>
                </tr>
              ) : (
                allOrders.map((order) => (
                  <tr key={order.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3">
                      <p className="text-accent font-medium">{order.orderNumber}</p>
                      <p className="text-text-muted text-xs">{formatDate(order.createdAt)}</p>
                    </td>
                    <td className="px-5 py-3">
                      <p className="text-text-primary">{order.customerName}</p>
                      <p className="text-text-muted text-xs">{order.customerEmail}</p>
                    </td>
                    <td className="px-5 py-3">
                      <span className={`text-xs font-medium px-2 py-0.5 rounded-full capitalize
                        ${order.paymentStatus === "paid" ? "bg-success/10 text-success" : order.paymentStatus === "failed" ? "bg-error/10 text-error" : "bg-orange-500/10 text-orange-400"}`}>
                        {order.paymentStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-center text-text-secondary">
                      {itemCountMap.get(order.id) || 0}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor(order.orderStatus)}`}>
                        {order.orderStatus}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-right text-text-primary font-medium">{formatPrice(order.total)}</td>
                    <td className="px-5 py-3 text-right">
                      <Link
                        href={`/${lang}/admin/orders/${order.id}`}
                        className="text-accent text-xs hover:underline"
                      >
                        View
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
