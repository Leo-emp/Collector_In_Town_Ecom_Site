export const dynamic = "force-dynamic";

// GET /api/admin/customers — aggregated customer list from orders
// Groups orders by customer email to build a customer list with stats
// (There's no separate customers table — this aggregates from order data)
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { sql, desc } from "drizzle-orm";

export async function GET() {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Aggregate customers from orders — group by email
  // Each row = one unique customer with their order stats
  const customers = await db
    .select({
      email: orders.customerEmail,
      name: orders.customerName,
      phone: orders.customerPhone,
      // How many orders this customer has placed
      orderCount: sql<number>`count(*)`,
      // Total amount spent across all orders (in MMK)
      totalSpent: sql<number>`sum(${orders.total})`,
      // When their first order was placed
      firstOrder: sql<string>`min(${orders.createdAt})`,
      // When their most recent order was placed
      lastOrder: sql<string>`max(${orders.createdAt})`,
    })
    .from(orders)
    .groupBy(orders.customerEmail)
    // Highest spenders first
    .orderBy(desc(sql`sum(${orders.total})`));

  return NextResponse.json({ customers });
}
