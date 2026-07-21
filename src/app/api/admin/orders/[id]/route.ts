// PUT /api/admin/orders/[id] — update order status, payment status, tracking number, admin notes
// Used by admin to manage order lifecycle (confirm payment, mark shipped, etc.)
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validation schema for order updates — all fields optional
const orderUpdateSchema = z.object({
  // Order fulfillment status
  order_status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
  // Payment verification status
  payment_status: z.enum(["pending", "paid", "failed"]).optional(),
  // Shipping tracking number — set when order is shipped
  tracking_number: z.string().max(100).optional(),
  // Internal admin notes — not visible to customers
  admin_notes: z.string().max(1000).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Parse and validate body
  const body = await request.json().catch(() => null);
  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Build update object — only include fields that were provided
  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  // Only set fields that are present in the request body
  if (parsed.data.order_status) updates.orderStatus = parsed.data.order_status;
  if (parsed.data.payment_status) updates.paymentStatus = parsed.data.payment_status;
  if (parsed.data.tracking_number !== undefined) updates.trackingNumber = parsed.data.tracking_number;
  if (parsed.data.admin_notes !== undefined) updates.adminNotes = parsed.data.admin_notes;

  // Apply the update
  await db.update(orders).set(updates).where(eq(orders.id, id));

  // Fetch and return the updated order
  const [updated] = await db.select().from(orders).where(eq(orders.id, id));
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: updated });
}
