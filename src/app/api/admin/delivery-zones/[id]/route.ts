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

  // Validate body with Zod deliveryZoneSchema
  const body = await request.json().catch(() => null);
  const parsed = deliveryZoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Update the delivery zone
  await db
    .update(deliveryZones)
    .set({
      nameEn: parsed.data.name_en,
      nameMy: parsed.data.name_my || null,
      fee: parsed.data.fee,
      estimatedTime: parsed.data.eta || null,
      // Convert boolean to SQLite integer (1/0)
      isActive: parsed.data.is_active ? 1 : 0,
    })
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
