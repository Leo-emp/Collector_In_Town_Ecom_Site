export const dynamic = "force-dynamic";

// GET /api/orders/track?token=xxx — guest order tracking
// Allows customers to check their order status using the tracking token
// Returns limited info (no admin notes, no internal IDs)
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders, orderItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  // Get tracking token from query params
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  // Token is required
  if (!token) {
    return NextResponse.json({ error: "Tracking token is required" }, { status: 400 });
  }

  // Look up order by guest tracking token
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.guestTrackingToken, token));

  // Return 404 if no order found with this token
  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Fetch order items for this order
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  // Return limited info for guest tracking — no internal IDs or admin notes
  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      total: order.total,
      subtotal: order.subtotal,
      deliveryFee: order.deliveryFee,
      discountAmount: order.discountAmount,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      // Return item details but strip internal IDs
      items: items.map((i) => ({
        name: i.productName,
        price: i.productPrice,
        quantity: i.quantity,
      })),
    },
  });
}
