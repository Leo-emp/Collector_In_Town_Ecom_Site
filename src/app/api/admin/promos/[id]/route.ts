// PUT /api/admin/promos/[id] — update a promo code
// DELETE /api/admin/promos/[id] — permanently delete a promo code
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { promoCodes } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { promoSchema } from "@/lib/validation";
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

  // Validate body with Zod promoSchema
  const body = await request.json().catch(() => null);
  const parsed = promoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Update the promo code
  await db
    .update(promoCodes)
    .set({
      code: parsed.data.code,
      discountType: parsed.data.discount_type,
      discountValue: parsed.data.discount_value,
      minOrderAmount: parsed.data.min_order_amount || 0,
      maxUses: parsed.data.max_uses || null,
      expiresAt: parsed.data.expires_at || null,
    })
    .where(eq(promoCodes.id, id));

  // Fetch and return updated promo code
  const [updated] = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.id, id));

  if (!updated) {
    return NextResponse.json({ error: "Promo not found" }, { status: 404 });
  }

  return NextResponse.json({ promo: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  // Hard delete — promo codes can be safely deleted (orders snapshot the discount)
  await db.delete(promoCodes).where(eq(promoCodes.id, id));
  return NextResponse.json({ success: true });
}
