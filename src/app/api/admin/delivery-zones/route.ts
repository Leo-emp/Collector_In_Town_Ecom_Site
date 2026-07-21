export const dynamic = "force-dynamic";

// GET /api/admin/delivery-zones — list all delivery zones
// Admin can see all zones including inactive ones
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { deliveryZones } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET() {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all delivery zones (admin sees active and inactive)
  const zones = await db.select().from(deliveryZones);
  return NextResponse.json({ zones });
}
