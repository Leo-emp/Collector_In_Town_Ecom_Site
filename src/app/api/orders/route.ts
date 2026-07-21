// POST /api/orders — place a new order
// Validates input, checks stock, applies promo code, creates order + items, decrements stock
// Rate limited: 3 orders per minute per IP to prevent abuse
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders, orderItems, products, deliveryZones, promoCodes } from "@/lib/schema";
import { orderSchema } from "@/lib/validation";
import { checkRateLimit, ORDER_RATE_LIMIT } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

// Generate human-readable order number: CIT-XXXXX (5 random alphanumeric chars)
function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CIT-${code}`;
}

export async function POST(request: Request) {
  // Rate limit by IP — 3 orders per minute
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`order:${ip}`, ORDER_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // Parse and validate body with Zod orderSchema
  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { contact, delivery, items, payment_method, promo_code } = parsed.data;

  // ─── Look up delivery zone ────────────────────────────
  const [zone] = await db
    .select()
    .from(deliveryZones)
    .where(eq(deliveryZones.id, delivery.zone));

  // Zone must exist and be active
  if (!zone || !zone.isActive) {
    return NextResponse.json({ error: "Invalid delivery zone" }, { status: 400 });
  }

  // ─── Verify stock and calculate subtotal ──────────────
  let subtotal = 0;
  const resolvedItems: Array<{
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
  }> = [];

  for (const item of items) {
    // Fetch the product from DB
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId));

    // Product must exist and be active
    if (!product || product.status !== "active") {
      return NextResponse.json(
        { error: `Product ${item.productId} is not available` },
        { status: 400 }
      );
    }

    // Check sufficient stock
    if (product.stockCount < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.nameEn}` },
        { status: 400 }
      );
    }

    // Add to subtotal and snapshot the product details
    subtotal += product.price * item.quantity;
    resolvedItems.push({
      productId: product.id,
      productName: product.nameEn,
      productPrice: product.price,
      quantity: item.quantity,
    });
  }

  // ─── Apply promo code if provided ─────────────────────
  let discountAmount = 0;
  let promoCodeId: string | null = null;

  if (promo_code) {
    // Look up the promo code (case-insensitive by converting to uppercase)
    const [promo] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, promo_code.toUpperCase()));

    if (promo && promo.active) {
      // Validate promo code conditions
      const notExpired = !promo.expiresAt || new Date(promo.expiresAt) > new Date();
      const underLimit = !promo.maxUses || promo.usageCount < promo.maxUses;
      const meetsMin = subtotal >= promo.minOrderAmount;

      if (notExpired && underLimit && meetsMin) {
        promoCodeId = promo.id;
        // Calculate discount based on type
        if (promo.discountType === "percentage") {
          // Percentage: e.g. 10 = 10% off subtotal
          discountAmount = Math.floor(subtotal * promo.discountValue / 100);
        } else {
          // Fixed: e.g. 5000 = 5000 Ks off
          discountAmount = promo.discountValue;
        }
        // Increment the usage count
        await db
          .update(promoCodes)
          .set({ usageCount: promo.usageCount + 1 })
          .where(eq(promoCodes.id, promo.id));
      }
    }
  }

  // ─── Calculate total ──────────────────────────────────
  const deliveryFee = zone.fee;
  const total = subtotal - discountAmount + deliveryFee;

  // ─── Create the order ─────────────────────────────────
  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
  // Guest tracking token — allows guest customers to track their order
  const guestTrackingToken = crypto.randomUUID();

  await db.insert(orders).values({
    id: orderId,
    orderNumber,
    customerName: contact.name,
    customerEmail: contact.email,
    customerPhone: contact.phone,
    addressLine: delivery.address,
    township: delivery.township,
    cityRegion: delivery.city,
    deliveryZoneId: zone.id,
    deliveryFee,
    deliveryNotes: delivery.notes || null,
    paymentMethod: payment_method,
    promoCodeId,
    discountAmount,
    subtotal,
    total,
    guestTrackingToken,
  });

  // ─── Create order items and decrement stock ───────────
  for (const item of resolvedItems) {
    // Create the line item (snapshots price and name at order time)
    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId,
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      quantity: item.quantity,
    });

    // Decrement stock count for the product
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId));

    if (product) {
      const newStock = product.stockCount - item.quantity;
      await db
        .update(products)
        .set({
          stockCount: Math.max(0, newStock),
          // Auto-mark as sold_out if stock reaches zero
          status: newStock <= 0 ? "sold_out" : product.status,
        })
        .where(eq(products.id, item.productId));
    }
  }

  // ─── Return the created order ─────────────────────────
  const [createdOrder] = await db
    .select()
    .from(orders)
    .where(eq(orders.id, orderId));

  return NextResponse.json(
    {
      order: createdOrder,
      trackingToken: guestTrackingToken,
    },
    { status: 201 }
  );
}
