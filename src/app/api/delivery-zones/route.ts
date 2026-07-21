export const dynamic = "force-dynamic";

// GET /api/delivery-zones — public listing of active delivery zones
// Used by checkout form to show available zones and fees
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { deliveryZones } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET() {
  // Only return active zones — inactive zones are hidden from checkout
  const zones = await db
    .select()
    .from(deliveryZones)
    .where(eq(deliveryZones.isActive, 1));

  return NextResponse.json({ zones });
}
