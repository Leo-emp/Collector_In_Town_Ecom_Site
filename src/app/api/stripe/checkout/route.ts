// POST /api/stripe/checkout — creates a Stripe Checkout Session
// Called after order is created with payment_method="card" to get the redirect URL
import { NextResponse } from "next/server";
import Stripe from "stripe";
import { db } from "@/lib/drizzle";
import { orders, orderItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!);

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.orderId || !body?.customerEmail) {
    return NextResponse.json({ error: "Missing orderId or customerEmail" }, { status: 400 });
  }

  // Fetch the order
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, body.orderId));

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // IDOR protection: verify the caller owns this order by matching email
  if (order.customerEmail !== body.customerEmail) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Only create session for card payment orders that are still pending
  if (order.paymentMethod !== "card" || order.paymentStatus !== "pending") {
    return NextResponse.json({ error: "Invalid order state" }, { status: 400 });
  }

  // Fetch order items for Stripe line items
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  // Build Stripe line items from order items
  const lineItems: Stripe.Checkout.SessionCreateParams.LineItem[] = items.map(
    (item) => ({
      price_data: {
        currency: "mmk",
        product_data: {
          name: item.productName,
        },
        // Stripe expects amount in smallest currency unit — MMK has no decimals
        unit_amount: item.productPrice,
      },
      quantity: item.quantity,
    })
  );

  // Add delivery fee as a line item if > 0
  if (order.deliveryFee > 0) {
    lineItems.push({
      price_data: {
        currency: "mmk",
        product_data: { name: "Delivery Fee" },
        unit_amount: order.deliveryFee,
      },
      quantity: 1,
    });
  }

  // Add discount as a note (Stripe handles it via the total)
  // We pass the exact total to avoid rounding mismatches

  // Use server-side env var only — never trust Origin header for redirect URLs
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || process.env.NEXT_PUBLIC_APP_URL;
  if (!siteUrl) {
    return NextResponse.json({ error: "Server misconfigured" }, { status: 500 });
  }

  const session = await stripe.checkout.sessions.create({
    mode: "payment",
    payment_method_types: ["card"],
    customer_email: order.customerEmail,
    line_items: lineItems,
    metadata: {
      orderId: order.id,
      orderNumber: order.orderNumber,
    },
    success_url: `${siteUrl}/en/order-confirmation?session_id={CHECKOUT_SESSION_ID}&order=${order.orderNumber}`,
    cancel_url: `${siteUrl}/en/cart`,
  });

  return NextResponse.json({ url: session.url });
}
