export const dynamic = "force-dynamic";

import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { deliveryZones } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { randomUUID } from "crypto";

// GET /api/admin/delivery-zones — list all delivery zones
export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const zones = await db.select().from(deliveryZones);
  return NextResponse.json({ zones });
}

// POST /api/admin/delivery-zones — create a new delivery zone
export async function POST(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json();
  const { nameEn, fee, feePerKg, estimatedTime } = body;

  if (!nameEn || typeof fee !== "number") {
    return NextResponse.json({ error: "Name and fee are required" }, { status: 400 });
  }

  const id = randomUUID();
  await db.insert(deliveryZones).values({
    id,
    nameEn,
    fee,
    feePerKg: feePerKg || 0,
    estimatedTime: estimatedTime || null,
    isActive: 1,
  });

  return NextResponse.json({ id }, { status: 201 });
}
