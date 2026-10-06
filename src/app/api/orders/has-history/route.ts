// GET /api/orders/has-history?email=xxx — check if a customer has previous completed orders
// Used by checkout to decide whether to show COD option (first-timers can't use COD)
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders } from "@/lib/schema";
import { eq, and, count } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const email = searchParams.get("email");

  if (!email) {
    return NextResponse.json({ hasHistory: false });
  }

  // Count orders from this email that reached "confirmed" or "done" status
  const [result] = await db
    .select({ total: count() })
    .from(orders)
    .where(
      and(
        eq(orders.customerEmail, email),
        eq(orders.paymentStatus, "paid")
      )
    );

  return NextResponse.json({ hasHistory: (result?.total || 0) > 0 });
}
