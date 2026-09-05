// POST /api/stripe/webhook — handles Stripe webhook events
// Confirms payment when checkout.session.completed fires
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/drizzle";
import { orders } from "@/lib/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.text();
  const sig = request.headers.get("stripe-signature");

  if (!sig) {
    return NextResponse.json({ error: "Missing signature" }, { status: 400 });
  }

  let event: Stripe.Event;
  try {
    event = stripe.webhooks.constructEvent(
      body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET!
    );
  } catch {
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 });
  }

  // Handle checkout completion — mark order as paid
  if (event.type === "checkout.session.completed") {
    const session = event.data.object as Stripe.Checkout.Session;
    const orderId = session.metadata?.orderId;

    if (orderId && session.payment_status === "paid") {
      await db
        .update(orders)
        .set({
          paymentStatus: "paid",
          orderStatus: "confirmed",
          updatedAt: new Date().toISOString(),
        })
        .where(eq(orders.id, orderId));
    }
  }

  return NextResponse.json({ received: true });
}
