// GET /api/admin/dashboard — aggregated stats for the admin dashboard
// Returns: revenue, order count, product count, customer count, recent orders, low stock
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders, products } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { count, sum, eq, desc, lte, and, sql } from "drizzle-orm";

export async function GET() {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Total revenue — sum of order totals where payment is confirmed
  const [revenueRow] = await db
    .select({ total: sum(orders.total) })
    .from(orders)
    .where(eq(orders.paymentStatus, "paid"));
  const totalRevenue = Number(revenueRow?.total) || 0;

  // Total order count (all statuses)
  const [orderCountRow] = await db
    .select({ count: count() })
    .from(orders);
  const totalOrders = orderCountRow?.count || 0;

  // Active product count (only products currently for sale)
  const [productCountRow] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.status, "active"));
  const totalProducts = productCountRow?.count || 0;

  // Unique customer count (distinct emails from all orders)
  const [customerCountRow] = await db
    .select({ count: sql<number>`count(distinct ${orders.customerEmail})` })
    .from(orders);
  const totalCustomers = customerCountRow?.count || 0;

  // Recent orders — last 10 for the dashboard feed
  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(10);

  // Low stock products — active products with stock_count <= 10
  const lowStock = await db
    .select()
    .from(products)
    .where(and(eq(products.status, "active"), lte(products.stockCount, 10)))
    .orderBy(products.stockCount)
    .limit(10);

  return NextResponse.json({
    stats: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
    },
    recentOrders,
    lowStock,
  });
}
