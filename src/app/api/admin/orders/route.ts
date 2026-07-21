// GET /api/admin/orders — list all orders with optional status filter
// Returns orders with their line items attached
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders, orderItems } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse optional status filter from query params (e.g. ?status=pending)
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  // Fetch orders — optionally filtered by order_status
  const allOrders = statusFilter
    ? await db.select().from(orders).where(eq(orders.orderStatus, statusFilter)).orderBy(desc(orders.createdAt))
    : await db.select().from(orders).orderBy(desc(orders.createdAt));

  // Fetch all order items
  const allItems = await db.select().from(orderItems);

  // Attach line items to each order
  const orderList = allOrders.map((o) => ({
    ...o,
    items: allItems.filter((item) => item.orderId === o.id),
  }));

  return NextResponse.json({ orders: orderList });
}
