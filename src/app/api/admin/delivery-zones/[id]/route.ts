// PUT /api/admin/delivery-zones/[id] — update a delivery zone
// Admin can change name, fee, estimated time, and active status
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { deliveryZones } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { deliveryZoneSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Validate body with Zod deliveryZoneSchema (partial — only update provided fields)
  const body = await request.json().catch(() => null);
  const parsed = deliveryZoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Build update object — only set fields that were provided
  const updates: Record<string, unknown> = {};
  if (parsed.data.name_en !== undefined) updates.nameEn = parsed.data.name_en;
  if (parsed.data.name_my !== undefined) updates.nameMy = parsed.data.name_my || null;
  if (parsed.data.city !== undefined) updates.city = parsed.data.city;
  if (parsed.data.township !== undefined) updates.township = parsed.data.township;
  if (parsed.data.fee !== undefined) updates.fee = parsed.data.fee;
  if (parsed.data.fee_per_kg !== undefined) updates.feePerKg = parsed.data.fee_per_kg;
  if (parsed.data.eta !== undefined) updates.estimatedTime = parsed.data.eta || null;
  if (parsed.data.is_active !== undefined) updates.isActive = parsed.data.is_active ? 1 : 0;

  // Update the delivery zone
  await db
    .update(deliveryZones)
    .set(updates)
    .where(eq(deliveryZones.id, id));

  // Fetch and return the updated zone
  const [updated] = await db
    .select()
    .from(deliveryZones)
    .where(eq(deliveryZones.id, id));

  if (!updated) {
    return NextResponse.json({ error: "Zone not found" }, { status: 404 });
  }

  return NextResponse.json({ zone: updated });
}

// DELETE /api/admin/delivery-zones/[id] — permanently remove a delivery zone
export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Check zone exists before deleting
  const [zone] = await db
    .select()
    .from(deliveryZones)
    .where(eq(deliveryZones.id, id));

  if (!zone) {
    return NextResponse.json({ error: "Zone not found" }, { status: 404 });
  }

  // Delete the delivery zone
  await db.delete(deliveryZones).where(eq(deliveryZones.id, id));

  return NextResponse.json({ success: true });
}
