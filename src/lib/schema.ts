// Drizzle ORM schema — all tables for Collector In Town
// 8 app tables; Better Auth auto-manages user/session/account/verification
import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
import { sql } from "drizzle-orm";

// Helper: UUID default for primary keys
const uuidPk = () =>
  text("id")
    .primaryKey()
    .$defaultFn(() => crypto.randomUUID());

// ─── Products ───────────────────────────────────────────
// Diecast car catalog — each row is one SKU
export const products = sqliteTable("products", {
  id: uuidPk(),
  // URL-friendly identifier — e.g. "nissan-gtr-r35-liberty-walk"
  slug: text("slug").notNull().unique(),
  // English name (required) — shown to all users
  nameEn: text("name_en").notNull(),
  // Myanmar (Burmese) name — shown when locale is "my"
  nameMy: text("name_my"),
  // English description — product detail page
  descriptionEn: text("description_en"),
  // Myanmar description — product detail page (locale "my")
  descriptionMy: text("description_my"),
  // Brand slug must match BRANDS constant (mini-gt, hot-wheels, inno64, pop-race)
  brand: text("brand").notNull(),
  // Diecast scale — e.g. "1:64", "1:43"
  scale: text("scale").notNull().default("1:64"),
  // Price in Myanmar Kyat — integer, no decimals
  price: integer("price").notNull(),
  // How many units are in stock
  stockCount: integer("stock_count").notNull().default(0),
  // active | draft | sold_out | discontinued
  status: text("status").notNull().default("active"),
  // ISO timestamp — when the product was created
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  // ISO timestamp — when the product was last updated
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Product Images ─────────────────────────────────────
// Photos stored in Vercel Blob, URLs saved here
export const productImages = sqliteTable("product_images", {
  id: uuidPk(),
  // FK to products table — cascade delete removes images when product is deleted
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  // Full Vercel Blob URL — e.g. "https://xxx.public.blob.vercel-storage.com/..."
  url: text("url").notNull(),
  // Controls display order in the photo gallery (0 = primary/hero image)
  displayOrder: integer("display_order").notNull().default(0),
  // ISO timestamp — when the image was uploaded
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Delivery Zones ─────────────────────────────────────
// Shipping regions with fees — Yangon, Mandalay, etc.
export const deliveryZones = sqliteTable("delivery_zones", {
  id: uuidPk(),
  // English zone name — shown in checkout dropdown
  nameEn: text("name_en").notNull(),
  // Myanmar zone name — shown when locale is "my"
  nameMy: text("name_my"),
  // Delivery fee in MMK (Myanmar Kyat) — added to order total
  fee: integer("fee").notNull(),
  // Human-readable delivery estimate — e.g. "1-2 days"
  estimatedTime: text("estimated_time"),
  // SQLite boolean: 1 = active, 0 = inactive (hidden from checkout)
  isActive: integer("is_active").notNull().default(1),
  // ISO timestamp — when the zone was created
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Promo Codes ────────────────────────────────────────
// Discount codes: percentage or fixed amount off
export const promoCodes = sqliteTable("promo_codes", {
  id: uuidPk(),
  // Uppercase alphanumeric code — e.g. WELCOME10, FLAT5K
  code: text("code").notNull().unique(),
  // "percentage" (10 = 10% off) or "fixed" (5000 = 5000 Ks off)
  discountType: text("discount_type").notNull(),
  // The discount amount — meaning depends on discountType
  discountValue: integer("discount_value").notNull(),
  // Minimum order subtotal to qualify (MMK) — 0 means no minimum
  minOrderAmount: integer("min_order_amount").notNull().default(0),
  // Maximum number of times this code can be used — null = unlimited
  maxUses: integer("max_uses"),
  // How many times this code has been used so far
  usageCount: integer("usage_count").notNull().default(0),
  // SQLite boolean: 1 = active, 0 = deactivated
  active: integer("active").notNull().default(1),
  // ISO date string — when the code expires, null = never expires
  expiresAt: text("expires_at"),
  // ISO timestamp — when the promo code was created
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Orders ─────────────────────────────────────────────
// Customer orders — supports both registered and guest checkout
export const orders = sqliteTable("orders", {
  id: uuidPk(),
  // Human-readable order number — e.g. CIT-XK91M (shown to customer)
  orderNumber: text("order_number").notNull().unique(),
  // Nullable — null for guest checkout, Better Auth user ID for logged-in users
  authUserId: text("auth_user_id"),
  // Customer contact info (always captured, even for registered users)
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  // Delivery address fields
  addressLine: text("address_line").notNull(),
  township: text("township").notNull(),
  cityRegion: text("city_region").notNull(),
  // FK to delivery_zones table — determines shipping fee
  deliveryZoneId: text("delivery_zone_id")
    .notNull()
    .references(() => deliveryZones.id),
  // Snapshot of delivery fee at order time (in MMK)
  deliveryFee: integer("delivery_fee").notNull(),
  // Optional delivery instructions from customer
  deliveryNotes: text("delivery_notes"),
  // Payment method — "kbzpay" only at launch
  paymentMethod: text("payment_method").notNull(),
  // Payment status: pending | paid | failed
  paymentStatus: text("payment_status").notNull().default("pending"),
  // Order fulfillment status: pending | confirmed | shipped | delivered | cancelled
  orderStatus: text("order_status").notNull().default("pending"),
  // Nullable FK — set when a promo code was applied at checkout
  promoCodeId: text("promo_code_id").references(() => promoCodes.id),
  // How much the promo code saved (in MMK) — 0 if no promo
  discountAmount: integer("discount_amount").notNull().default(0),
  // Sum of all item prices * quantities (before discount and delivery)
  subtotal: integer("subtotal").notNull(),
  // Final amount: subtotal - discount + delivery fee
  total: integer("total").notNull(),
  // Shipping tracking number — set by admin when order is shipped
  trackingNumber: text("tracking_number"),
  // Internal notes from admin — not visible to customer
  adminNotes: text("admin_notes"),
  // Token for guest order tracking — generated at order creation
  guestTrackingToken: text("guest_tracking_token"),
  // ISO timestamp — when the order was placed
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  // ISO timestamp — last status change
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Order Items ────────────────────────────────────────
// Line items within an order — snapshots price at time of purchase
export const orderItems = sqliteTable("order_items", {
  id: uuidPk(),
  // FK to orders table — cascade delete removes items when order is deleted
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  // FK to products table — kept for reference (product may be discontinued later)
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  // Snapshot: product name at time of order (price changes don't affect past orders)
  productName: text("product_name").notNull(),
  // Snapshot: price per unit at time of order (MMK)
  productPrice: integer("product_price").notNull(),
  // How many units of this product were ordered
  quantity: integer("quantity").notNull(),
});

// ─── Site Settings ──────────────────────────────────────
// Key-value config: store name, email, phone, KBZPay QR, etc.
export const siteSettings = sqliteTable("site_settings", {
  // Setting key — e.g. "store_name", "kbzpay_phone"
  key: text("key").primaryKey(),
  // JSON-encoded value — parse with JSON.parse() when reading
  value: text("value").notNull(),
});

// ─── Newsletter Subscribers ─────────────────────────────
// Email list for marketing campaigns
export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: uuidPk(),
  // Subscriber email — unique constraint prevents duplicate signups
  email: text("email").notNull().unique(),
  // Optional name — captured if provided
  name: text("name"),
  // ISO timestamp — when the user subscribed
  subscribedAt: text("subscribed_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Type exports ───────────────────────────────────────
// Inferred row types for use across the app (avoids manual type definitions)
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
