// GET /api/orders/has-history — check if the authenticated user has previous completed orders
// Used by checkout to decide whether to show COD option (first-timers can't use COD)
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders } from "@/lib/schema";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { eq, and, count } from "drizzle-orm";

export async function GET() {
  // Require authenticated session — use session email, not query param
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.email) {
    return NextResponse.json({ hasHistory: false });
  }

  // Count orders from this email that have been paid
  const [result] = await db
    .select({ total: count() })
    .from(orders)
    .where(
      and(
        eq(orders.customerEmail, session.user.email),
        eq(orders.paymentStatus, "paid")
      )
    );

  return NextResponse.json({ hasHistory: (result?.total || 0) > 0 });
}
