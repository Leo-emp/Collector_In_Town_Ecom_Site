// Admin Order History — completed (done) and cancelled orders
// Separated from active orders for a clean workflow
// Server component — queries Turso directly
import { notFound } from "next/navigation";
import Link from "next/link";
import { hasLocale } from "../../../dictionaries";
import { formatPrice, formatDate } from "@/lib/format";
import { db } from "@/lib/drizzle";
import { orders, orderItems } from "@/lib/schema";
import { desc, eq, count } from "drizzle-orm";

export const dynamic = "force-dynamic";

export const metadata = { title: "Order History — Admin — Collector In Town" };

export default async function OrderHistoryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params;
  if (!hasLocale(lang)) notFound();

  // Fetch completed orders (status = done)
  const completedOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.orderStatus, "done"))
    .orderBy(desc(orders.createdAt));

  // Fetch cancelled orders
  const cancelledOrders = await db
    .select()
    .from(orders)
    .where(eq(orders.orderStatus, "cancelled"))
    .orderBy(desc(orders.createdAt));

  // Get item counts per order
  const itemCounts = await db
    .select({
      orderId: orderItems.orderId,
      itemCount: count(),
    })
    .from(orderItems)
    .groupBy(orderItems.orderId);

  const itemCountMap = new Map(itemCounts.map((r) => [r.orderId, r.itemCount]));

  // Renders a table/cards for a list of orders
  const renderOrders = (orderList: typeof completedOrders, emptyMsg: string, statusColor: string) => (
    <>
      {/* Mobile cards */}
      <div className="md:hidden space-y-3">
        {orderList.length === 0 ? (
          <p className="text-text-muted text-center py-6 text-sm">{emptyMsg}</p>
        ) : (
          orderList.map((order) => (
            <Link key={order.id} href={`/${lang}/admin/orders/${order.id}`}
              className="block bg-surface rounded-xl border border-border p-4 hover:bg-surface-hover/50 transition-colors">
              <div className="flex items-center justify-between mb-2">
                <span className="text-accent font-medium text-sm">{order.orderNumber}</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor}`}>
                  {order.orderStatus}
                </span>
              </div>
              <p className="text-text-primary text-sm">{order.customerName}</p>
              <div className="flex items-center justify-between mt-2">
                <span className="text-text-muted text-xs">{formatDate(order.createdAt)}</span>
                <span className="text-text-primary font-medium text-sm">{formatPrice(order.total)}</span>
              </div>
            </Link>
          ))
        )}
      </div>

      {/* Desktop table */}
      <div className="hidden md:block bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/30">
                <th className="text-left text-text-muted font-medium px-5 py-3">Order</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Customer</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Payment</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Items</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Total</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {orderList.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-6 text-center text-text-muted">
                    {emptyMsg}
                  </td>
                </tr>
              ) : (
                orderList.map((order) => (
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
    </>
  );

  return (
    <div>
      {/* Header with back link */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary">Order History</h1>
        <Link
          href={`/${lang}/admin/orders`}
          className="text-accent text-sm hover:underline flex items-center gap-1"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
          Active Orders
        </Link>
      </div>

      {/* Completed Orders section */}
      <div className="mb-10">
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-text-primary font-semibold text-lg">Completed Orders</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-success/10 text-success">
            {completedOrders.length}
          </span>
        </div>
        {renderOrders(completedOrders, "No completed orders yet", "bg-success/10 text-success")}
      </div>

      {/* Cancelled Orders section */}
      <div>
        <div className="flex items-center gap-3 mb-4">
          <h2 className="text-text-primary font-semibold text-lg">Cancelled Orders</h2>
          <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-error/10 text-error">
            {cancelledOrders.length}
          </span>
        </div>
        {renderOrders(cancelledOrders, "No cancelled orders", "bg-error/10 text-error")}
      </div>
    </div>
  );
}
