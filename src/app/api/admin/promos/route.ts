// GET /api/admin/promos — list all promo codes
// POST /api/admin/promos — create a new promo code
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { promoCodes } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { promoSchema } from "@/lib/validation";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all promo codes ordered by newest first
  const allPromos = await db
    .select()
    .from(promoCodes)
    .orderBy(desc(promoCodes.createdAt));

  return NextResponse.json({ promos: allPromos });
}

export async function POST(request: Request) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate body with Zod promoSchema
  const body = await request.json().catch(() => null);
  const parsed = promoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Insert new promo code
  const id = crypto.randomUUID();
  await db.insert(promoCodes).values({
    id,
    code: parsed.data.code,
    discountType: parsed.data.discount_type,
    discountValue: parsed.data.discount_value,
    minOrderAmount: parsed.data.min_order_amount || 0,
    maxUses: parsed.data.max_uses || null,
    expiresAt: parsed.data.expires_at || null,
  });

  // Fetch and return the created promo code
  const [created] = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.id, id));

  return NextResponse.json({ promo: created }, { status: 201 });
}
