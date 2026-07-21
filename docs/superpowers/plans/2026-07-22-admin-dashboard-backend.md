# Admin Dashboard & Backend Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Wire the existing Collector In Town UI shells to a real Turso database via Drizzle ORM, add admin password auth, product image upload via Vercel Blob, KBZPay manual payment flow, and remove dead Supabase code.

**Architecture:** Drizzle ORM schema defines 8 tables pushed to Turso. Next.js API routes handle public (products, orders, newsletter) and admin (CRUD, image upload, dashboard stats) operations. Admin access is gated by a simple password cookie. Existing UI shells are rewired to fetch real data via Drizzle queries and API calls.

**Tech Stack:** Next.js 16, Turso (libSQL), Drizzle ORM 0.45.x, drizzle-kit 0.31.x, Better Auth 1.6.x, @vercel/blob, Zod 4.x, Tailwind v4

## Global Constraints

- All code comments must be heavily commented with `//` throughout for learning (user preference)
- All prices are integers in MMK (no decimals)
- SQLite booleans use integer 0/1
- All UUIDs are text columns with `crypto.randomUUID()` defaults
- Path alias `@/*` maps to `./src/*`
- Existing Zod schemas in `src/lib/validation.ts` must be used for all input validation
- Rate limiting via existing `src/lib/rate-limit.ts` for auth and order endpoints
- Next.js 16 — check `node_modules/next/dist/docs/` before writing any Next.js code if unsure about APIs

---

## File Map

### New files to create
| File | Responsibility |
|---|---|
| `src/lib/schema.ts` | Drizzle ORM table definitions for all 8 tables |
| `src/lib/drizzle.ts` | Drizzle client instance wrapping the Turso client |
| `drizzle.config.ts` | drizzle-kit config pointing to Turso |
| `src/lib/seed.ts` | Seed script for delivery zones, sample products, promos, settings |
| `src/lib/admin-auth.ts` | Admin password verification, cookie sign/verify helpers |
| `src/app/[lang]/admin/login/page.tsx` | Admin login page (password field) |
| `src/app/api/admin/login/route.ts` | POST: verify password, set admin cookie |
| `src/app/api/admin/logout/route.ts` | POST: clear admin cookie |
| `src/app/api/admin/products/route.ts` | GET: list products, POST: create product |
| `src/app/api/admin/products/[id]/route.ts` | PUT: update product, DELETE: soft-delete |
| `src/app/api/admin/products/[id]/images/route.ts` | POST: upload image to Vercel Blob |
| `src/app/api/admin/products/[id]/images/[imageId]/route.ts` | DELETE: remove image |
| `src/app/api/admin/orders/route.ts` | GET: list orders |
| `src/app/api/admin/orders/[id]/route.ts` | PUT: update order status/tracking/notes |
| `src/app/api/admin/promos/route.ts` | GET: list, POST: create promo |
| `src/app/api/admin/promos/[id]/route.ts` | PUT: update, DELETE: delete promo |
| `src/app/api/admin/delivery-zones/route.ts` | GET: list zones |
| `src/app/api/admin/delivery-zones/[id]/route.ts` | PUT: update zone |
| `src/app/api/admin/settings/route.ts` | GET: get settings, PUT: update settings |
| `src/app/api/admin/dashboard/route.ts` | GET: aggregated stats |
| `src/app/api/admin/customers/route.ts` | GET: aggregated customer list |
| `src/app/api/products/route.ts` | GET: public product listing |
| `src/app/api/products/[slug]/route.ts` | GET: public single product |
| `src/app/api/orders/route.ts` | POST: place order |
| `src/app/api/orders/track/route.ts` | GET: guest order tracking |
| `src/app/api/newsletter/route.ts` | POST: subscribe |

### Files to modify
| File | Change |
|---|---|
| `src/lib/db.ts` | Add Drizzle ORM export alongside raw Turso client |
| `src/app/[lang]/admin/layout.tsx` | Add admin cookie check, redirect to login |
| `src/app/[lang]/admin/page.tsx` | Replace hardcoded stats with DB queries |
| `src/app/[lang]/admin/products/page.tsx` | Replace hardcoded products with DB query |
| `src/app/[lang]/admin/products/[id]/page.tsx` | Load real product, wire save to API, add image upload |
| `src/app/[lang]/admin/orders/page.tsx` | Replace hardcoded orders, add status update actions |
| `src/app/[lang]/admin/customers/page.tsx` | Replace hardcoded customers with aggregated query |
| `src/app/[lang]/admin/promos/page.tsx` | Wire to API for real CRUD |
| `src/app/[lang]/admin/delivery/page.tsx` | Wire to API for real updates |
| `src/app/[lang]/admin/settings/page.tsx` | Wire to API for real persistence |
| `src/app/[lang]/products/[brand]/page.tsx` | Replace hardcoded catalog with DB query |
| `src/app/[lang]/products/[brand]/[slug]/page.tsx` | Replace hardcoded product with DB query |
| `src/components/checkout/CheckoutForm.tsx` | Wire to real order placement API |
| `src/app/[lang]/order-confirmation/page.tsx` | Show KBZPay manual payment instructions |
| `src/lib/validation.ts` | Add admin login schema |
| `package.json` | Add @vercel/blob, remove @supabase/* |

### Files to delete
| File | Reason |
|---|---|
| `src/lib/supabase/client.ts` | Replaced by Drizzle |
| `src/lib/supabase/server.ts` | Replaced by Drizzle |
| `src/lib/supabase/types.ts` | Replaced by Drizzle schema |

---

### Task 1: Drizzle Schema, Config, and Seed Data

**Files:**
- Create: `src/lib/schema.ts`
- Create: `src/lib/drizzle.ts`
- Create: `drizzle.config.ts`
- Create: `src/lib/seed.ts`
- Modify: `package.json` (add scripts, add @vercel/blob, remove @supabase/*)
- Delete: `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/lib/supabase/types.ts`

**Produces:**
- `db` (Drizzle instance): `import { db } from "@/lib/drizzle"` — used by every subsequent task
- All table exports: `import { products, productImages, orders, orderItems, deliveryZones, promoCodes, siteSettings, newsletterSubscribers } from "@/lib/schema"`
- Type exports: `Product`, `ProductImage`, `Order`, `OrderItem`, `DeliveryZone`, `PromoCode`, `SiteSetting`, `NewsletterSubscriber` (inferred row types)
- `npm run db:push` script to push schema to Turso
- `npm run db:seed` script to populate sample data

- [ ] **Step 1: Install @vercel/blob, uninstall Supabase packages**

```bash
cd C:/Users/User/collector-in-town
npm install @vercel/blob
npm uninstall @supabase/ssr @supabase/supabase-js
```

- [ ] **Step 2: Delete Supabase files**

```bash
rm -rf src/lib/supabase
```

- [ ] **Step 3: Create `src/lib/schema.ts`**

```typescript
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
  slug: text("slug").notNull().unique(),
  nameEn: text("name_en").notNull(),
  nameMy: text("name_my"),
  descriptionEn: text("description_en"),
  descriptionMy: text("description_my"),
  // Brand slug must match BRANDS constant (mini-gt, hot-wheels, inno64, pop-race)
  brand: text("brand").notNull(),
  scale: text("scale").notNull().default("1:64"),
  // Price in Myanmar Kyat — integer, no decimals
  price: integer("price").notNull(),
  stockCount: integer("stock_count").notNull().default(0),
  // active | draft | sold_out | discontinued
  status: text("status").notNull().default("active"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Product Images ─────────────────────────────────────
// Photos stored in Vercel Blob, URLs saved here
export const productImages = sqliteTable("product_images", {
  id: uuidPk(),
  productId: text("product_id")
    .notNull()
    .references(() => products.id, { onDelete: "cascade" }),
  // Full Vercel Blob URL
  url: text("url").notNull(),
  // Controls display order in the photo gallery (0 = primary)
  displayOrder: integer("display_order").notNull().default(0),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Delivery Zones ─────────────────────────────────────
// Shipping regions with fees — Yangon, Mandalay, etc.
export const deliveryZones = sqliteTable("delivery_zones", {
  id: uuidPk(),
  nameEn: text("name_en").notNull(),
  nameMy: text("name_my"),
  // Delivery fee in MMK
  fee: integer("fee").notNull(),
  estimatedTime: text("estimated_time"),
  // SQLite boolean: 1 = active, 0 = inactive
  isActive: integer("is_active").notNull().default(1),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Promo Codes ────────────────────────────────────────
// Discount codes: percentage or fixed amount off
export const promoCodes = sqliteTable("promo_codes", {
  id: uuidPk(),
  // Uppercase alphanumeric code — e.g. WELCOME10
  code: text("code").notNull().unique(),
  // "percentage" or "fixed"
  discountType: text("discount_type").notNull(),
  // If percentage: 10 = 10%. If fixed: 5000 = 5000 Ks off
  discountValue: integer("discount_value").notNull(),
  // Minimum order subtotal to qualify (MMK)
  minOrderAmount: integer("min_order_amount").notNull().default(0),
  // null = unlimited uses
  maxUses: integer("max_uses"),
  usageCount: integer("usage_count").notNull().default(0),
  // SQLite boolean: 1 = active
  active: integer("active").notNull().default(1),
  // ISO date string or null for no expiry
  expiresAt: text("expires_at"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Orders ─────────────────────────────────────────────
// Customer orders — supports both registered and guest checkout
export const orders = sqliteTable("orders", {
  id: uuidPk(),
  // Human-readable order number — e.g. CIT-XK91M
  orderNumber: text("order_number").notNull().unique(),
  // Nullable — null for guest checkout, set for logged-in users
  authUserId: text("auth_user_id"),
  // Customer info (always captured, even for registered users)
  customerName: text("customer_name").notNull(),
  customerEmail: text("customer_email").notNull(),
  customerPhone: text("customer_phone").notNull(),
  // Delivery address fields
  addressLine: text("address_line").notNull(),
  township: text("township").notNull(),
  cityRegion: text("city_region").notNull(),
  deliveryZoneId: text("delivery_zone_id")
    .notNull()
    .references(() => deliveryZones.id),
  deliveryFee: integer("delivery_fee").notNull(),
  deliveryNotes: text("delivery_notes"),
  // Payment — "kbzpay" only at launch
  paymentMethod: text("payment_method").notNull(),
  // pending | paid | failed
  paymentStatus: text("payment_status").notNull().default("pending"),
  // pending | confirmed | shipped | delivered | cancelled
  orderStatus: text("order_status").notNull().default("pending"),
  // Nullable FK — set when a promo code was applied
  promoCodeId: text("promo_code_id").references(() => promoCodes.id),
  discountAmount: integer("discount_amount").notNull().default(0),
  subtotal: integer("subtotal").notNull(),
  total: integer("total").notNull(),
  // Shipping tracking number — set by admin when shipped
  trackingNumber: text("tracking_number"),
  // Admin-only notes on the order
  adminNotes: text("admin_notes"),
  // Token for guest order tracking (crypto.randomUUID())
  guestTrackingToken: text("guest_tracking_token"),
  createdAt: text("created_at")
    .notNull()
    .default(sql`(current_timestamp)`),
  updatedAt: text("updated_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Order Items ────────────────────────────────────────
// Line items within an order — snapshots price at time of purchase
export const orderItems = sqliteTable("order_items", {
  id: uuidPk(),
  orderId: text("order_id")
    .notNull()
    .references(() => orders.id, { onDelete: "cascade" }),
  productId: text("product_id")
    .notNull()
    .references(() => products.id),
  // Snapshot: product name at time of order (price changes don't affect past orders)
  productName: text("product_name").notNull(),
  // Snapshot: price per unit at time of order (MMK)
  productPrice: integer("product_price").notNull(),
  quantity: integer("quantity").notNull(),
});

// ─── Site Settings ──────────────────────────────────────
// Key-value config: store name, email, phone, KBZPay QR, etc.
export const siteSettings = sqliteTable("site_settings", {
  // Setting key — e.g. "store_name", "kbzpay_qr_phone"
  key: text("key").primaryKey(),
  // JSON-encoded value
  value: text("value").notNull(),
});

// ─── Newsletter Subscribers ─────────────────────────────
// Email list for marketing
export const newsletterSubscribers = sqliteTable("newsletter_subscribers", {
  id: uuidPk(),
  email: text("email").notNull().unique(),
  name: text("name"),
  subscribedAt: text("subscribed_at")
    .notNull()
    .default(sql`(current_timestamp)`),
});

// ─── Type exports ───────────────────────────────────────
// Inferred row types for use across the app
export type Product = typeof products.$inferSelect;
export type ProductImage = typeof productImages.$inferSelect;
export type Order = typeof orders.$inferSelect;
export type OrderItem = typeof orderItems.$inferSelect;
export type DeliveryZone = typeof deliveryZones.$inferSelect;
export type PromoCode = typeof promoCodes.$inferSelect;
export type SiteSetting = typeof siteSettings.$inferSelect;
export type NewsletterSubscriber = typeof newsletterSubscribers.$inferSelect;
```

- [ ] **Step 4: Create `src/lib/drizzle.ts`**

```typescript
// Drizzle ORM client — wraps the Turso connection from db.ts
// Import this everywhere you need typed database queries
import { drizzle } from "drizzle-orm/libsql";
import { turso } from "./db";
import * as schema from "./schema";

// Single Drizzle instance — reused across all requests
// Passing schema enables relational query builder
export const db = drizzle(turso, { schema });
```

- [ ] **Step 5: Create `drizzle.config.ts`** (project root)

```typescript
// drizzle-kit config — connects to Turso for migrations and schema push
// Run: npx drizzle-kit push (pushes schema to Turso)
// Run: npx drizzle-kit studio (opens Drizzle Studio GUI)
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Path to the schema file with all table definitions
  schema: "./src/lib/schema.ts",
  // Output directory for generated migration SQL files
  out: "./drizzle",
  // Turso uses the libSQL dialect (SQLite-compatible)
  dialect: "turso",
  dbCredentials: {
    // Local dev: file:local.db, production: libsql://xxx.turso.io
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
```

- [ ] **Step 6: Add npm scripts to `package.json`**

Add these to the `"scripts"` section:
```json
"db:push": "drizzle-kit push",
"db:studio": "drizzle-kit studio",
"db:seed": "npx tsx src/lib/seed.ts"
```

- [ ] **Step 7: Create `src/lib/seed.ts`**

```typescript
// Seed script — populates the database with initial data
// Run: npm run db:seed
// Safe to run multiple times — uses INSERT OR IGNORE for idempotency
import { db } from "./drizzle";
import { deliveryZones, products, promoCodes, siteSettings } from "./schema";
import { slugify } from "./format";
import { sql } from "drizzle-orm";

async function seed() {
  console.log("Seeding database...");

  // ─── Delivery Zones ───────────────────────────────────
  const zones = [
    { nameEn: "Yangon", nameMy: "ရန်ကုန်", fee: 2000, estimatedTime: "1-2 days" },
    { nameEn: "Mandalay", nameMy: "မန္တလေး", fee: 3500, estimatedTime: "2-3 days" },
    { nameEn: "Naypyidaw", nameMy: "နေပြည်တော်", fee: 3000, estimatedTime: "2-3 days" },
    { nameEn: "Other Regions", nameMy: "အခြားဒေသများ", fee: 5000, estimatedTime: "3-5 days" },
  ];

  for (const zone of zones) {
    // Insert only if not already present (idempotent)
    await db.insert(deliveryZones).values({
      id: crypto.randomUUID(),
      ...zone,
    }).onConflictDoNothing();
  }
  console.log(`  Delivery zones: ${zones.length} seeded`);

  // ─── Products ─────────────────────────────────────────
  const productData = [
    { nameEn: "Nissan GT-R R35 Liberty Walk", nameMy: "နစ်ဆန် GT-R R35 Liberty Walk", brand: "mini-gt", price: 45000, stockCount: 15, descriptionEn: "Mini GT 1:64 scale Nissan GT-R R35 with Liberty Walk body kit. Metallic blue finish with detailed interior and opening doors.", descriptionMy: "Mini GT 1:64 စကေး နစ်ဆန် GT-R R35 Liberty Walk ကိုယ်ထည်ကစ်ပါ။" },
    { nameEn: "Porsche 911 GT3 RS", nameMy: "ပေါ့ရှ 911 GT3 RS", brand: "mini-gt", price: 52000, stockCount: 8, descriptionEn: "Mini GT 1:64 Porsche 911 GT3 RS in Guards Red. Opening hood reveals detailed flat-six engine.", descriptionMy: "Mini GT 1:64 ပေါ့ရှ 911 GT3 RS Guards Red အနီရောင်။" },
    { nameEn: "Toyota AE86 Sprinter Trueno", nameMy: "တိုယိုတာ AE86 Sprinter Trueno", brand: "hot-wheels", price: 12000, stockCount: 25, descriptionEn: "Hot Wheels premium Toyota AE86 from the Japan Historics series.", descriptionMy: "Hot Wheels ပရီမီယံ တိုယိုတာ AE86 Japan Historics စီးရီး။" },
    { nameEn: "Mazda RX-7 FD3S Spirit R", nameMy: "မဇ်ဒါ RX-7 FD3S Spirit R", brand: "hot-wheels", price: 15000, stockCount: 20, descriptionEn: "Hot Wheels premium Mazda RX-7 FD3S Spirit R in brilliant red.", descriptionMy: "Hot Wheels ပရီမီယံ မဇ်ဒါ RX-7 FD3S Spirit R အနီရောင်။" },
    { nameEn: "Honda Civic Type-R EK9", nameMy: "ဟွန်ဒါ Civic Type-R EK9", brand: "inno64", price: 38000, stockCount: 10, descriptionEn: "Inno64 Honda Civic Type-R EK9 in Championship White.", descriptionMy: "Inno64 ဟွန်ဒါ Civic Type-R EK9 Championship White အဖြူရောင်။" },
    { nameEn: "Mitsubishi Lancer Evolution III", nameMy: "မစ်ဆူဘီရှီ Lancer Evolution III", brand: "inno64", price: 42000, stockCount: 6, descriptionEn: "Inno64 Mitsubishi Lancer Evolution III in Dandelion Yellow.", descriptionMy: "Inno64 မစ်ဆူဘီရှီ Lancer Evolution III Dandelion Yellow အဝါရောင်။" },
    { nameEn: "Nissan Skyline GT-R R34 V-Spec II", nameMy: "နစ်ဆန် Skyline GT-R R34 V-Spec II", brand: "pop-race", price: 35000, stockCount: 12, descriptionEn: "Pop Race Nissan Skyline GT-R R34 V-Spec II in Bayside Blue.", descriptionMy: "Pop Race နစ်ဆန် Skyline GT-R R34 V-Spec II Bayside Blue အပြာရောင်။" },
    { nameEn: "Toyota Supra A80 TRD", nameMy: "တိုယိုတာ Supra A80 TRD", brand: "pop-race", price: 32000, stockCount: 0, descriptionEn: "Pop Race Toyota Supra A80 with TRD 3000GT wing in Super White II.", descriptionMy: "Pop Race တိုယိုတာ Supra A80 TRD 3000GT wing Super White II အဖြူရောင်။", status: "sold_out" as const },
  ];

  for (const p of productData) {
    await db.insert(products).values({
      id: crypto.randomUUID(),
      slug: slugify(p.nameEn),
      scale: "1:64",
      status: "active",
      ...p,
    }).onConflictDoNothing();
  }
  console.log(`  Products: ${productData.length} seeded`);

  // ─── Promo Codes ──────────────────────────────────────
  const promoData = [
    { code: "WELCOME10", discountType: "percentage", discountValue: 10, minOrderAmount: 30000, maxUses: 100, expiresAt: "2026-08-31" },
    { code: "COLLECTOR20", discountType: "percentage", discountValue: 20, minOrderAmount: 80000, maxUses: 50, expiresAt: "2026-09-15" },
    { code: "FLAT5K", discountType: "fixed", discountValue: 5000, minOrderAmount: 50000, maxUses: 30, expiresAt: "2026-12-31" },
  ];

  for (const promo of promoData) {
    await db.insert(promoCodes).values({
      id: crypto.randomUUID(),
      ...promo,
    }).onConflictDoNothing();
  }
  console.log(`  Promo codes: ${promoData.length} seeded`);

  // ─── Site Settings ────────────────────────────────────
  const settingsData = [
    { key: "store_name", value: JSON.stringify("Collector In Town") },
    { key: "store_email", value: JSON.stringify("hello@collectorintown.com") },
    { key: "store_phone", value: JSON.stringify("09-xxx-xxx-xxx") },
    { key: "currency", value: JSON.stringify("MMK") },
    { key: "default_locale", value: JSON.stringify("en") },
    // KBZPay manual payment info — shown at checkout until API is integrated
    { key: "kbzpay_phone", value: JSON.stringify("09-xxx-xxx-xxx") },
    { key: "kbzpay_name", value: JSON.stringify("Collector In Town") },
  ];

  for (const setting of settingsData) {
    await db.insert(siteSettings).values(setting).onConflictDoNothing();
  }
  console.log(`  Site settings: ${settingsData.length} seeded`);

  console.log("Seed complete!");
  process.exit(0);
}

seed().catch((err) => {
  console.error("Seed failed:", err);
  process.exit(1);
});
```

- [ ] **Step 8: Push schema to local DB and seed**

```bash
npm run db:push
npm run db:seed
```

Expected: Tables created, seed data inserted, no errors.

- [ ] **Step 9: Verify the build still passes**

```bash
npm run build
```

Expected: Build succeeds. The Supabase packages are gone and nothing imports them (we verified earlier that only the deleted files imported them).

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add Drizzle schema, seed data, remove Supabase

- Define 8 tables in src/lib/schema.ts (products, product_images,
  orders, order_items, delivery_zones, promo_codes, site_settings,
  newsletter_subscribers)
- Add Drizzle client wrapper in src/lib/drizzle.ts
- Add drizzle-kit config for Turso
- Add seed script with 4 zones, 8 products, 3 promos, 7 settings
- Remove @supabase/ssr, @supabase/supabase-js and src/lib/supabase/
- Install @vercel/blob for product image upload"
```

---

### Task 2: Admin Authentication (Password Gate)

**Files:**
- Create: `src/lib/admin-auth.ts`
- Create: `src/app/[lang]/admin/login/page.tsx`
- Create: `src/app/api/admin/login/route.ts`
- Create: `src/app/api/admin/logout/route.ts`
- Modify: `src/app/[lang]/admin/layout.tsx` (add cookie check + redirect)
- Modify: `src/lib/validation.ts` (add adminLoginSchema)

**Produces:**
- `verifyAdminSession(cookies)`: returns `boolean` — used by all admin API routes
- `ADMIN_COOKIE_NAME`: constant `"admin_session"` — used by login/logout routes
- Admin login page at `/[lang]/admin/login`
- Admin layout redirects to login if no valid cookie

**Consumes:**
- `checkRateLimit`, `AUTH_RATE_LIMIT` from `src/lib/rate-limit.ts`

- [ ] **Step 1: Add admin login schema to `src/lib/validation.ts`**

Append to the file:
```typescript
// Admin login — simple password check
export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});
```

- [ ] **Step 2: Create `src/lib/admin-auth.ts`**

```typescript
// Admin authentication — simple password gate using signed cookies
// No user accounts — just a single ADMIN_PASSWORD env var
import { cookies } from "next/headers";
import crypto from "crypto";

// Cookie name for admin session
export const ADMIN_COOKIE_NAME = "admin_session";

// 24-hour TTL for admin session
const SESSION_TTL_SECONDS = 60 * 60 * 24;

// Secret used to sign the cookie — reuses BETTER_AUTH_SECRET
function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required");
  return secret;
}

// Sign a value with HMAC-SHA256 to prevent cookie tampering
function sign(value: string): string {
  const secret = getSecret();
  const signature = crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("hex");
  return `${value}.${signature}`;
}

// Verify a signed value — returns the original value or null if invalid
function verifySignature(signed: string): string | null {
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;
  const value = signed.slice(0, lastDot);
  const expected = sign(value);
  // Timing-safe comparison to prevent timing attacks
  if (
    expected.length !== signed.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signed))
  ) {
    return null;
  }
  return value;
}

// Check if the admin password matches — timing-safe comparison
export function verifyPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD env var is required");
  // Timing-safe comparison to prevent timing attacks
  const inputBuf = Buffer.from(input);
  const passwordBuf = Buffer.from(password);
  if (inputBuf.length !== passwordBuf.length) return false;
  return crypto.timingSafeEqual(inputBuf, passwordBuf);
}

// Set the admin session cookie — called after successful login
export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  // Payload: timestamp when the session was created
  const payload = Date.now().toString();
  const signed = sign(payload);
  cookieStore.set(ADMIN_COOKIE_NAME, signed, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: SESSION_TTL_SECONDS,
    path: "/",
  });
}

// Clear the admin session cookie — called on logout
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

// Verify admin session from cookies — returns true if valid
// Used by admin API routes and the admin layout
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME);
  if (!cookie?.value) return false;

  // Verify the signature hasn't been tampered with
  const payload = verifySignature(cookie.value);
  if (!payload) return false;

  // Check TTL — reject if older than 24 hours
  const created = parseInt(payload, 10);
  if (isNaN(created)) return false;
  const age = Date.now() - created;
  return age < SESSION_TTL_SECONDS * 1000;
}
```

- [ ] **Step 3: Create `src/app/api/admin/login/route.ts`**

```typescript
// POST /api/admin/login — verify admin password and set session cookie
import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation";
import { verifyPassword, setAdminCookie } from "@/lib/admin-auth";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit: 5 attempts per 15 minutes by IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`admin-login:${ip}`, AUTH_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }

  // Parse and validate the request body
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  // Check the password against ADMIN_PASSWORD env var
  if (!verifyPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Password correct — set the admin session cookie
  await setAdminCookie();
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 4: Create `src/app/api/admin/logout/route.ts`**

```typescript
// POST /api/admin/logout — clear admin session cookie
import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin-auth";

export async function POST() {
  await clearAdminCookie();
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Create `src/app/[lang]/admin/login/page.tsx`**

```typescript
// Admin login page — single password field to access the admin dashboard
"use client";

import { useState } from "react";
import { useParams, useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const { lang } = useParams<{ lang: string }>();
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  // Submit the password to the login API
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const res = await fetch("/api/admin/login", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ password }),
    });

    if (res.ok) {
      // Redirect to admin dashboard on success
      router.push(`/${lang}/admin`);
      router.refresh();
    } else {
      const data = await res.json().catch(() => ({}));
      setError(data.error || "Login failed");
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[70vh] flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        <div className="text-center mb-8">
          <h1 className="font-[family-name:var(--font-cinzel)] text-3xl text-text-primary mb-2">
            Admin Access
          </h1>
          <p className="text-text-muted text-sm">
            Enter the admin password to continue
          </p>
        </div>

        <form onSubmit={handleSubmit} className="bg-surface rounded-xl border border-border p-6 space-y-5">
          {error && (
            <div className="bg-error/10 border border-error/20 text-error text-sm rounded-lg px-4 py-3">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="password" className="block text-text-secondary text-sm font-medium mb-1.5">
              Password
            </label>
            <input
              id="password"
              type="password"
              required
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-background border border-border rounded-lg px-4 py-2.5 text-text-primary
                         placeholder:text-text-muted/50 focus:outline-none focus:border-accent/50 transition-colors"
              placeholder="Enter admin password"
              autoFocus
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-accent text-background py-3 rounded-lg font-semibold text-sm
                       hover:bg-accent-hover transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? "Verifying..." : "Access Dashboard"}
          </button>
        </form>
      </div>
    </div>
  );
}
```

- [ ] **Step 6: Modify `src/app/[lang]/admin/layout.tsx` — add auth check**

Add the admin session check at the top of the `AdminLayout` function, before the existing JSX. Import `verifyAdminSession` and `redirect`:

```typescript
// Add these imports at the top:
import { redirect } from "next/navigation";
import { verifyAdminSession } from "@/lib/admin-auth";

// Add this check as the first lines inside AdminLayout, after hasLocale check:
  const isAdmin = await verifyAdminSession();
  if (!isAdmin) {
    redirect(`/${lang}/admin/login`);
  }
```

The login page itself is NOT nested under the admin layout (it's a separate route), so it won't trigger the redirect loop.

Note: The login page IS actually nested under `[lang]/admin/login` which means it IS under the admin layout. To fix this, the layout must detect the login route and skip the redirect. Modify the check to:

```typescript
  // Don't redirect on the login page itself — would cause infinite loop
  const isLoginPage = (await headers()).get("x-next-url")?.includes("/admin/login");
```

Actually, a simpler approach: move the login page outside the admin layout. Create it at `src/app/[lang]/admin-login/page.tsx` instead. Update the redirect to point to `/${lang}/admin-login`. This avoids the login page being wrapped in the admin layout with its sidebar.

**Revised:** Create login page at `src/app/[lang]/admin-login/page.tsx` (outside admin layout). Redirect in layout goes to `/${lang}/admin-login`.

- [ ] **Step 7: Verify admin flow manually**

```bash
npm run dev
```

1. Visit `http://localhost:3001/en/admin` — should redirect to `/en/admin-login`
2. Enter wrong password — should show error
3. Enter correct password (matching `ADMIN_PASSWORD` env var in `.env.local`) — should redirect to `/en/admin`
4. Visit `/en/admin/products` — should load (cookie is valid)

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: add admin password authentication

- Admin layout checks for signed admin_session cookie
- Login page at /[lang]/admin-login with password field
- POST /api/admin/login verifies password, sets HttpOnly cookie (24h TTL)
- POST /api/admin/logout clears cookie
- HMAC-SHA256 signed cookie prevents tampering
- Rate limited: 5 attempts per 15 minutes"
```

---

### Task 3: Admin Product CRUD + Image Upload API Routes

**Files:**
- Create: `src/app/api/admin/products/route.ts`
- Create: `src/app/api/admin/products/[id]/route.ts`
- Create: `src/app/api/admin/products/[id]/images/route.ts`
- Create: `src/app/api/admin/products/[id]/images/[imageId]/route.ts`

**Consumes:**
- `db` from `@/lib/drizzle`
- `products`, `productImages` from `@/lib/schema`
- `verifyAdminSession` from `@/lib/admin-auth`
- `productSchema` from `@/lib/validation`
- `slugify` from `@/lib/format`
- `MAX_PHOTOS_PER_PRODUCT`, `MAX_PHOTO_SIZE_MB`, `ACCEPTED_IMAGE_TYPES` from `@/lib/constants`

**Produces:**
- `GET /api/admin/products` — returns `{ products: Product[] }`
- `POST /api/admin/products` — returns `{ product: Product }`
- `PUT /api/admin/products/[id]` — returns `{ product: Product }`
- `DELETE /api/admin/products/[id]` — returns `{ success: true }`
- `POST /api/admin/products/[id]/images` — returns `{ image: ProductImage }`
- `DELETE /api/admin/products/[id]/images/[imageId]` — returns `{ success: true }`

- [ ] **Step 1: Create `src/app/api/admin/products/route.ts`**

```typescript
// GET /api/admin/products — list all products for admin
// POST /api/admin/products — create a new product
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { productSchema } from "@/lib/validation";
import { slugify } from "@/lib/format";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  // Verify admin session
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all products with their images, ordered by newest first
  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  // Fetch images for all products
  const allImages = await db
    .select()
    .from(productImages)
    .orderBy(productImages.displayOrder);

  // Group images by product
  const productList = allProducts.map((p) => ({
    ...p,
    images: allImages.filter((img) => img.productId === p.id),
  }));

  return NextResponse.json({ products: productList });
}

export async function POST(request: Request) {
  // Verify admin session
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate body
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Generate slug from English name
  const slug = slugify(parsed.data.name_en);

  // Insert product into database
  const id = crypto.randomUUID();
  await db.insert(products).values({
    id,
    slug,
    nameEn: parsed.data.name_en,
    nameMy: parsed.data.name_my || null,
    descriptionEn: parsed.data.description_en || null,
    descriptionMy: parsed.data.description_my || null,
    brand: parsed.data.brand,
    scale: parsed.data.scale,
    price: parsed.data.price,
    stockCount: parsed.data.stock_count,
    status: parsed.data.status,
  });

  // Fetch and return the created product
  const [created] = await db
    .select()
    .from(products)
    .where(eq(products.id, id));

  return NextResponse.json({ product: created }, { status: 201 });
}
```

- [ ] **Step 2: Create `src/app/api/admin/products/[id]/route.ts`**

```typescript
// PUT /api/admin/products/[id] — update a product
// DELETE /api/admin/products/[id] — soft-delete (set status to discontinued)
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { products } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { productSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Validate body
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Update the product
  await db
    .update(products)
    .set({
      nameEn: parsed.data.name_en,
      nameMy: parsed.data.name_my || null,
      descriptionEn: parsed.data.description_en || null,
      descriptionMy: parsed.data.description_my || null,
      brand: parsed.data.brand,
      scale: parsed.data.scale,
      price: parsed.data.price,
      stockCount: parsed.data.stock_count,
      status: parsed.data.status,
      updatedAt: new Date().toISOString(),
    })
    .where(eq(products.id, id));

  // Fetch and return updated product
  const [updated] = await db
    .select()
    .from(products)
    .where(eq(products.id, id));

  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Soft delete — set status to discontinued (preserves order history references)
  await db
    .update(products)
    .set({ status: "discontinued", updatedAt: new Date().toISOString() })
    .where(eq(products.id, id));

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 3: Create `src/app/api/admin/products/[id]/images/route.ts`**

```typescript
// POST /api/admin/products/[id]/images — upload product image to Vercel Blob
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/drizzle";
import { productImages } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { MAX_PHOTOS_PER_PRODUCT, MAX_PHOTO_SIZE_MB, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";
import { eq, count } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id: productId } = await params;

  // Get the uploaded file from FormData
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type. Accepted: ${ACCEPTED_IMAGE_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `File too large. Max ${MAX_PHOTO_SIZE_MB}MB` },
      { status: 400 }
    );
  }

  // Check how many images this product already has
  const [{ imageCount }] = await db
    .select({ imageCount: count() })
    .from(productImages)
    .where(eq(productImages.productId, productId));

  if (imageCount >= MAX_PHOTOS_PER_PRODUCT) {
    return NextResponse.json(
      { error: `Max ${MAX_PHOTOS_PER_PRODUCT} images per product` },
      { status: 400 }
    );
  }

  // Upload to Vercel Blob
  const blob = await put(`products/${productId}/${file.name}`, file, {
    access: "public",
  });

  // Create database record
  const imageId = crypto.randomUUID();
  await db.insert(productImages).values({
    id: imageId,
    productId,
    url: blob.url,
    displayOrder: imageCount, // New images go at the end
  });

  // Return the created image record
  const [image] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, imageId));

  return NextResponse.json({ image }, { status: 201 });
}
```

- [ ] **Step 4: Create `src/app/api/admin/products/[id]/images/[imageId]/route.ts`**

```typescript
// DELETE /api/admin/products/[id]/images/[imageId] — remove product image
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/drizzle";
import { productImages } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageId } = await params;

  // Fetch the image record to get the blob URL
  const [image] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, imageId));

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  // Delete from Vercel Blob
  await del(image.url);

  // Delete from database
  await db.delete(productImages).where(eq(productImages.id, imageId));

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Commit**

```bash
git add -A
git commit -m "feat: add admin product CRUD and image upload API routes

- GET/POST /api/admin/products for listing and creating
- PUT/DELETE /api/admin/products/[id] for update and soft-delete
- POST /api/admin/products/[id]/images for Vercel Blob upload
- DELETE /api/admin/products/[id]/images/[imageId] for removal
- All routes verify admin session cookie
- File validation: type, size, max count per product"
```

---

### Task 4: Remaining Admin API Routes (Orders, Promos, Delivery, Settings, Dashboard, Customers)

**Files:**
- Create: `src/app/api/admin/orders/route.ts`
- Create: `src/app/api/admin/orders/[id]/route.ts`
- Create: `src/app/api/admin/promos/route.ts`
- Create: `src/app/api/admin/promos/[id]/route.ts`
- Create: `src/app/api/admin/delivery-zones/route.ts`
- Create: `src/app/api/admin/delivery-zones/[id]/route.ts`
- Create: `src/app/api/admin/settings/route.ts`
- Create: `src/app/api/admin/dashboard/route.ts`
- Create: `src/app/api/admin/customers/route.ts`

**Consumes:**
- `db` from `@/lib/drizzle`
- All table exports from `@/lib/schema`
- `verifyAdminSession` from `@/lib/admin-auth`
- `promoSchema`, `deliveryZoneSchema` from `@/lib/validation`

**Produces:**
- All admin API endpoints listed in the spec section 3.2

- [ ] **Step 1: Create `src/app/api/admin/orders/route.ts`**

```typescript
// GET /api/admin/orders — list all orders with optional status filter
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders, orderItems } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { desc, eq } from "drizzle-orm";

export async function GET(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse optional status filter from query params
  const { searchParams } = new URL(request.url);
  const statusFilter = searchParams.get("status");

  // Build query — optionally filter by order_status
  let query = db.select().from(orders).orderBy(desc(orders.createdAt));
  if (statusFilter) {
    query = query.where(eq(orders.orderStatus, statusFilter)) as typeof query;
  }

  const allOrders = await query;

  // Fetch items for all orders
  const allItems = await db.select().from(orderItems);

  // Attach items to each order
  const orderList = allOrders.map((o) => ({
    ...o,
    items: allItems.filter((item) => item.orderId === o.id),
  }));

  return NextResponse.json({ orders: orderList });
}
```

- [ ] **Step 2: Create `src/app/api/admin/orders/[id]/route.ts`**

```typescript
// PUT /api/admin/orders/[id] — update order status, tracking number, admin notes
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Validation for order updates
const orderUpdateSchema = z.object({
  order_status: z.enum(["pending", "confirmed", "shipped", "delivered", "cancelled"]).optional(),
  payment_status: z.enum(["pending", "paid", "failed"]).optional(),
  tracking_number: z.string().max(100).optional(),
  admin_notes: z.string().max(1000).optional(),
});

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  const body = await request.json().catch(() => null);
  const parsed = orderUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Build update object — only include fields that were provided
  const updates: Record<string, unknown> = {
    updatedAt: new Date().toISOString(),
  };
  if (parsed.data.order_status) updates.orderStatus = parsed.data.order_status;
  if (parsed.data.payment_status) updates.paymentStatus = parsed.data.payment_status;
  if (parsed.data.tracking_number !== undefined) updates.trackingNumber = parsed.data.tracking_number;
  if (parsed.data.admin_notes !== undefined) updates.adminNotes = parsed.data.admin_notes;

  await db.update(orders).set(updates).where(eq(orders.id, id));

  const [updated] = await db.select().from(orders).where(eq(orders.id, id));
  if (!updated) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  return NextResponse.json({ order: updated });
}
```

- [ ] **Step 3: Create `src/app/api/admin/promos/route.ts`**

```typescript
// GET /api/admin/promos — list all promo codes
// POST /api/admin/promos — create a new promo code
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { promoCodes } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { promoSchema } from "@/lib/validation";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const allPromos = await db
    .select()
    .from(promoCodes)
    .orderBy(desc(promoCodes.createdAt));

  return NextResponse.json({ promos: allPromos });
}

export async function POST(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = promoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

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

  const [created] = await db
    .select()
    .from(promoCodes)
    .where(eq(promoCodes.id, id));

  return NextResponse.json({ promo: created }, { status: 201 });
}
```

- [ ] **Step 4: Create `src/app/api/admin/promos/[id]/route.ts`**

```typescript
// PUT /api/admin/promos/[id] — update a promo code
// DELETE /api/admin/promos/[id] — delete a promo code
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
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = promoSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

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
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  await db.delete(promoCodes).where(eq(promoCodes.id, id));
  return NextResponse.json({ success: true });
}
```

- [ ] **Step 5: Create `src/app/api/admin/delivery-zones/route.ts`**

```typescript
// GET /api/admin/delivery-zones — list all delivery zones
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { deliveryZones } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const zones = await db.select().from(deliveryZones);
  return NextResponse.json({ zones });
}
```

- [ ] **Step 6: Create `src/app/api/admin/delivery-zones/[id]/route.ts`**

```typescript
// PUT /api/admin/delivery-zones/[id] — update a delivery zone
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { deliveryZones } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { deliveryZoneSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;
  const body = await request.json().catch(() => null);
  const parsed = deliveryZoneSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  await db
    .update(deliveryZones)
    .set({
      nameEn: parsed.data.name_en,
      nameMy: parsed.data.name_my || null,
      fee: parsed.data.fee,
      estimatedTime: parsed.data.eta || null,
      isActive: parsed.data.is_active ? 1 : 0,
    })
    .where(eq(deliveryZones.id, id));

  const [updated] = await db
    .select()
    .from(deliveryZones)
    .where(eq(deliveryZones.id, id));

  if (!updated) {
    return NextResponse.json({ error: "Zone not found" }, { status: 404 });
  }

  return NextResponse.json({ zone: updated });
}
```

- [ ] **Step 7: Create `src/app/api/admin/settings/route.ts`**

```typescript
// GET /api/admin/settings — get all site settings
// PUT /api/admin/settings — update site settings
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { siteSettings } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Settings are a flat key-value map
const settingsUpdateSchema = z.record(z.string(), z.unknown());

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all settings and convert to a key-value object
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, unknown> = {};
  for (const row of rows) {
    settings[row.key] = JSON.parse(row.value);
  }

  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const body = await request.json().catch(() => null);
  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  // Upsert each key-value pair
  for (const [key, value] of Object.entries(parsed.data)) {
    const jsonValue = JSON.stringify(value);
    // Try update first, then insert if not found
    const result = await db
      .update(siteSettings)
      .set({ value: jsonValue })
      .where(eq(siteSettings.key, key));

    if (result.rowsAffected === 0) {
      await db.insert(siteSettings).values({ key, value: jsonValue });
    }
  }

  return NextResponse.json({ success: true });
}
```

- [ ] **Step 8: Create `src/app/api/admin/dashboard/route.ts`**

```typescript
// GET /api/admin/dashboard — aggregated stats for the admin dashboard
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders, orderItems, products } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { count, sum, eq, desc, lte, sql } from "drizzle-orm";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Total revenue (from paid orders only)
  const [revenueRow] = await db
    .select({ total: sum(orders.total) })
    .from(orders)
    .where(eq(orders.paymentStatus, "paid"));
  const totalRevenue = Number(revenueRow?.total) || 0;

  // Order count
  const [orderCountRow] = await db
    .select({ count: count() })
    .from(orders);
  const totalOrders = orderCountRow?.count || 0;

  // Product count (active only)
  const [productCountRow] = await db
    .select({ count: count() })
    .from(products)
    .where(eq(products.status, "active"));
  const totalProducts = productCountRow?.count || 0;

  // Unique customers (distinct email from orders)
  const [customerCountRow] = await db
    .select({ count: sql<number>`count(distinct ${orders.customerEmail})` })
    .from(orders);
  const totalCustomers = customerCountRow?.count || 0;

  // Recent orders (last 10)
  const recentOrders = await db
    .select()
    .from(orders)
    .orderBy(desc(orders.createdAt))
    .limit(10);

  // Low stock products (stock_count <= 10, active only)
  const lowStock = await db
    .select()
    .from(products)
    .where(eq(products.status, "active"))
    .where(lte(products.stockCount, 10))
    .orderBy(products.stockCount)
    .limit(10);

  return NextResponse.json({
    stats: {
      totalRevenue,
      totalOrders,
      totalProducts,
      totalCustomers,
    },
    recentOrders,
    lowStock,
  });
}
```

- [ ] **Step 9: Create `src/app/api/admin/customers/route.ts`**

```typescript
// GET /api/admin/customers — aggregated customer list from orders
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { sql, desc } from "drizzle-orm";

export async function GET() {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Aggregate customers from orders — group by email
  const customers = await db
    .select({
      email: orders.customerEmail,
      name: orders.customerName,
      phone: orders.customerPhone,
      orderCount: sql<number>`count(*)`,
      totalSpent: sql<number>`sum(${orders.total})`,
      firstOrder: sql<string>`min(${orders.createdAt})`,
      lastOrder: sql<string>`max(${orders.createdAt})`,
    })
    .from(orders)
    .groupBy(orders.customerEmail)
    .orderBy(desc(sql`sum(${orders.total})`));

  return NextResponse.json({ customers });
}
```

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: add remaining admin API routes

- Orders: list with status filter, update status/tracking/notes
- Promos: full CRUD (create, list, update, delete)
- Delivery zones: list and update
- Settings: get/update key-value pairs
- Dashboard: aggregated stats (revenue, orders, products, customers)
- Customers: aggregated from orders grouped by email
- All routes verify admin session cookie"
```

---

### Task 5: Public API Routes (Products, Orders, Newsletter, Order Tracking)

**Files:**
- Create: `src/app/api/products/route.ts`
- Create: `src/app/api/products/[slug]/route.ts`
- Create: `src/app/api/orders/route.ts`
- Create: `src/app/api/orders/track/route.ts`
- Create: `src/app/api/newsletter/route.ts`

**Consumes:**
- `db` from `@/lib/drizzle`
- All table exports from `@/lib/schema`
- `orderSchema`, `newsletterSchema` from `@/lib/validation`
- `checkRateLimit`, `ORDER_RATE_LIMIT` from `@/lib/rate-limit`
- `PRODUCTS_PER_PAGE` from `@/lib/constants`

**Produces:**
- `GET /api/products` — paginated product list with brand filter and search
- `GET /api/products/[slug]` — single product with images
- `POST /api/orders` — place order (returns order with guest tracking token)
- `GET /api/orders/track?token=xxx` — guest order tracking
- `POST /api/newsletter` — subscribe to newsletter

- [ ] **Step 1: Create `src/app/api/products/route.ts`**

```typescript
// GET /api/products — public product listing with pagination, brand filter, search
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { eq, like, desc, asc, and, count } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters
  const brand = searchParams.get("brand");
  const search = searchParams.get("search");
  const sort = searchParams.get("sort") || "newest";
  const page = Math.max(1, parseInt(searchParams.get("page") || "1"));

  // Build WHERE conditions — only show active products to public
  const conditions = [eq(products.status, "active")];
  if (brand) conditions.push(eq(products.brand, brand));
  if (search) conditions.push(like(products.nameEn, `%${search}%`));

  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  // Sort order
  const orderBy =
    sort === "price-asc" ? asc(products.price) :
    sort === "price-desc" ? desc(products.price) :
    desc(products.createdAt); // "newest" default

  // Count total for pagination
  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .where(where);

  // Fetch products for current page
  const offset = (page - 1) * PRODUCTS_PER_PAGE;
  const productList = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(orderBy)
    .limit(PRODUCTS_PER_PAGE)
    .offset(offset);

  // Fetch images for these products
  const productIds = productList.map((p) => p.id);
  const images = productIds.length > 0
    ? await db
        .select()
        .from(productImages)
        .where(
          // SQLite doesn't have array-based IN via Drizzle easily, so filter in JS
          // For a small catalog this is fine
        )
        .orderBy(productImages.displayOrder)
    : [];

  // Attach images to products
  const result = productList.map((p) => ({
    ...p,
    images: images.filter((img) => img.productId === p.id),
  }));

  return NextResponse.json({
    products: result,
    pagination: {
      page,
      pageSize: PRODUCTS_PER_PAGE,
      total,
      totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
    },
  });
}
```

- [ ] **Step 2: Create `src/app/api/products/[slug]/route.ts`**

```typescript
// GET /api/products/[slug] — single product with images
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Fetch product by slug
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug));

  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Fetch images for this product
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.displayOrder);

  return NextResponse.json({
    product: { ...product, images },
  });
}
```

- [ ] **Step 3: Create `src/app/api/orders/route.ts`**

```typescript
// POST /api/orders — place a new order
// Validates input, checks stock, creates order + items, decrements stock
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders, orderItems, products, deliveryZones, promoCodes } from "@/lib/schema";
import { orderSchema } from "@/lib/validation";
import { checkRateLimit, ORDER_RATE_LIMIT } from "@/lib/rate-limit";
import { eq } from "drizzle-orm";

// Generate human-readable order number: CIT-XXXXX
function generateOrderNumber(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `CIT-${code}`;
}

export async function POST(request: Request) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`order:${ip}`, ORDER_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests. Please wait a moment." },
      { status: 429 }
    );
  }

  // Parse and validate body
  const body = await request.json().catch(() => null);
  const parsed = orderSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  const { contact, delivery, items, payment_method, promo_code } = parsed.data;

  // Look up delivery zone
  const [zone] = await db
    .select()
    .from(deliveryZones)
    .where(eq(deliveryZones.id, delivery.zone));

  if (!zone || !zone.isActive) {
    return NextResponse.json({ error: "Invalid delivery zone" }, { status: 400 });
  }

  // Look up products and verify stock
  let subtotal = 0;
  const resolvedItems: Array<{
    productId: string;
    productName: string;
    productPrice: number;
    quantity: number;
  }> = [];

  for (const item of items) {
    const [product] = await db
      .select()
      .from(products)
      .where(eq(products.id, item.productId));

    if (!product || product.status !== "active") {
      return NextResponse.json(
        { error: `Product ${item.productId} is not available` },
        { status: 400 }
      );
    }

    if (product.stockCount < item.quantity) {
      return NextResponse.json(
        { error: `Insufficient stock for ${product.nameEn}` },
        { status: 400 }
      );
    }

    subtotal += product.price * item.quantity;
    resolvedItems.push({
      productId: product.id,
      productName: product.nameEn,
      productPrice: product.price,
      quantity: item.quantity,
    });
  }

  // Apply promo code if provided
  let discountAmount = 0;
  let promoCodeId: string | null = null;

  if (promo_code) {
    const [promo] = await db
      .select()
      .from(promoCodes)
      .where(eq(promoCodes.code, promo_code.toUpperCase()));

    if (promo && promo.active) {
      // Check expiry
      const notExpired = !promo.expiresAt || new Date(promo.expiresAt) > new Date();
      // Check usage limit
      const underLimit = !promo.maxUses || promo.usageCount < promo.maxUses;
      // Check minimum order
      const meetsMin = subtotal >= promo.minOrderAmount;

      if (notExpired && underLimit && meetsMin) {
        promoCodeId = promo.id;
        if (promo.discountType === "percentage") {
          discountAmount = Math.floor(subtotal * promo.discountValue / 100);
        } else {
          discountAmount = promo.discountValue;
        }
        // Increment usage count
        await db
          .update(promoCodes)
          .set({ usageCount: promo.usageCount + 1 })
          .where(eq(promoCodes.id, promo.id));
      }
    }
  }

  const deliveryFee = zone.fee;
  const total = subtotal - discountAmount + deliveryFee;

  // Create the order
  const orderId = crypto.randomUUID();
  const orderNumber = generateOrderNumber();
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

  // Create order items
  for (const item of resolvedItems) {
    await db.insert(orderItems).values({
      id: crypto.randomUUID(),
      orderId,
      productId: item.productId,
      productName: item.productName,
      productPrice: item.productPrice,
      quantity: item.quantity,
    });

    // Decrement stock
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
          // Auto-mark as sold out if stock hits zero
          status: newStock <= 0 ? "sold_out" : product.status,
        })
        .where(eq(products.id, item.productId));
    }
  }

  // Return the order with tracking info
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
```

- [ ] **Step 4: Create `src/app/api/orders/track/route.ts`**

```typescript
// GET /api/orders/track?token=xxx — guest order tracking
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { orders, orderItems } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const token = searchParams.get("token");

  if (!token) {
    return NextResponse.json({ error: "Tracking token is required" }, { status: 400 });
  }

  // Look up order by guest tracking token
  const [order] = await db
    .select()
    .from(orders)
    .where(eq(orders.guestTrackingToken, token));

  if (!order) {
    return NextResponse.json({ error: "Order not found" }, { status: 404 });
  }

  // Fetch order items
  const items = await db
    .select()
    .from(orderItems)
    .where(eq(orderItems.orderId, order.id));

  // Return limited info for guest tracking (no admin notes, no internal IDs)
  return NextResponse.json({
    order: {
      orderNumber: order.orderNumber,
      orderStatus: order.orderStatus,
      paymentStatus: order.paymentStatus,
      total: order.total,
      trackingNumber: order.trackingNumber,
      createdAt: order.createdAt,
      items: items.map((i) => ({
        name: i.productName,
        price: i.productPrice,
        quantity: i.quantity,
      })),
    },
  });
}
```

- [ ] **Step 5: Create `src/app/api/newsletter/route.ts`**

```typescript
// POST /api/newsletter — subscribe to the newsletter
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { newsletterSubscribers } from "@/lib/schema";
import { newsletterSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit by IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`newsletter:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Insert — ignore if email already subscribed
  await db
    .insert(newsletterSubscribers)
    .values({
      id: crypto.randomUUID(),
      email: parsed.data.email,
    })
    .onConflictDoNothing();

  return NextResponse.json({ success: true }, { status: 201 });
}
```

- [ ] **Step 6: Commit**

```bash
git add -A
git commit -m "feat: add public API routes for products, orders, newsletter

- GET /api/products with pagination, brand filter, search, sort
- GET /api/products/[slug] with images
- POST /api/orders — validates, checks stock, creates order, decrements stock
- GET /api/orders/track — guest order tracking by token
- POST /api/newsletter — subscribe with duplicate protection
- Rate limiting on orders and newsletter"
```

---

### Task 6: Wire Admin Dashboard Pages to Real Data

**Files:**
- Modify: `src/app/[lang]/admin/page.tsx` — fetch from `/api/admin/dashboard`
- Modify: `src/app/[lang]/admin/products/page.tsx` — fetch from `/api/admin/products`
- Modify: `src/app/[lang]/admin/products/[id]/page.tsx` — load real product, wire save + image upload
- Modify: `src/app/[lang]/admin/orders/page.tsx` — fetch from `/api/admin/orders`, add status update
- Modify: `src/app/[lang]/admin/customers/page.tsx` — fetch from `/api/admin/customers`
- Modify: `src/app/[lang]/admin/promos/page.tsx` — wire CRUD to `/api/admin/promos`
- Modify: `src/app/[lang]/admin/delivery/page.tsx` — wire to `/api/admin/delivery-zones`
- Modify: `src/app/[lang]/admin/settings/page.tsx` — wire to `/api/admin/settings`

**Consumes:**
- All admin API routes from Tasks 3 and 4
- `formatPrice`, `formatDate` from `@/lib/format`

This task rewrites all admin pages from hardcoded data to real API calls. Each page follows the same pattern: server component fetches data via Drizzle query (since admin pages are server-rendered), or client component fetches via API for interactive CRUD.

The admin pages are the largest body of work. Each page should be rewritten to:
1. **Server components** (dashboard, products list, orders list, customers): query the database directly using Drizzle in the server component
2. **Client components** (product edit, promos, delivery, settings): fetch data on mount, call API for mutations

Due to the size of this task, the implementer should rewrite one page at a time, testing each before moving to the next. The existing UI structure (tables, cards, layout) should be preserved — only the data source changes.

- [ ] **Step 1: Rewrite admin dashboard page** (`src/app/[lang]/admin/page.tsx`)

Replace the hardcoded STATS, RECENT_ORDERS, and LOW_STOCK with real Drizzle queries. The page is a server component, so import `db` and query directly. Keep the existing JSX structure.

- [ ] **Step 2: Rewrite admin products list page** (`src/app/[lang]/admin/products/page.tsx`)

Replace PRODUCTS array with a Drizzle query for all products ordered by newest. Keep the existing table JSX.

- [ ] **Step 3: Rewrite admin product edit page** (`src/app/[lang]/admin/products/[id]/page.tsx`)

Load real product by ID on mount. Wire the save button to `PUT /api/admin/products/[id]`. Add image upload dropzone that calls `POST /api/admin/products/[id]/images`. Show existing images with delete buttons.

- [ ] **Step 4: Rewrite admin orders page** (`src/app/[lang]/admin/orders/page.tsx`)

Replace ORDERS array with a Drizzle query. Add status update dropdown that calls `PUT /api/admin/orders/[id]`.

- [ ] **Step 5: Rewrite admin customers page** (`src/app/[lang]/admin/customers/page.tsx`)

Replace CUSTOMERS array with Drizzle aggregate query grouping orders by email.

- [ ] **Step 6: Rewrite admin promos page** (`src/app/[lang]/admin/promos/page.tsx`)

Wire the create form to `POST /api/admin/promos`. Load promos list from `GET /api/admin/promos`. Add edit and delete actions.

- [ ] **Step 7: Rewrite admin delivery zones page** (`src/app/[lang]/admin/delivery/page.tsx`)

Load zones from `GET /api/admin/delivery-zones`. Wire edit save to `PUT /api/admin/delivery-zones/[id]`.

- [ ] **Step 8: Rewrite admin settings page** (`src/app/[lang]/admin/settings/page.tsx`)

Load settings from `GET /api/admin/settings`. Wire save to `PUT /api/admin/settings`.

- [ ] **Step 9: Test all admin pages manually**

Run `npm run dev`, log into admin, verify each page loads real data and mutations work.

- [ ] **Step 10: Commit**

```bash
git add -A
git commit -m "feat: wire all admin pages to real database

- Dashboard shows real revenue, order count, product count, customers
- Products list and edit use Drizzle queries + API routes
- Product image upload via Vercel Blob working
- Orders list with real data and status update actions
- Customers aggregated from orders
- Promos CRUD fully wired
- Delivery zones editable and persisted
- Settings saved to site_settings table"
```

---

### Task 7: Wire Public Pages (Catalog, Product Detail, Checkout, Order Confirmation)

**Files:**
- Modify: `src/app/[lang]/products/[brand]/page.tsx` — replace PLACEHOLDER_PRODUCTS with Drizzle query
- Modify: `src/app/[lang]/products/[brand]/[slug]/page.tsx` — replace PLACEHOLDER_PRODUCTS with Drizzle query
- Modify: `src/components/checkout/CheckoutForm.tsx` — wire to `POST /api/orders` and real delivery zones
- Modify: `src/app/[lang]/order-confirmation/page.tsx` — show KBZPay manual payment info
- Modify: `src/app/[lang]/track/page.tsx` — wire to `GET /api/orders/track`

**Consumes:**
- `db` from `@/lib/drizzle`
- `products`, `productImages`, `deliveryZones` from `@/lib/schema`
- Public API routes from Task 5

- [ ] **Step 1: Rewrite catalog page** (`src/app/[lang]/products/[brand]/page.tsx`)

Replace PLACEHOLDER_PRODUCTS with a Drizzle query. The page is a server component — query directly. Filter by brand slug, apply search/sort/pagination from searchParams.

- [ ] **Step 2: Rewrite product detail page** (`src/app/[lang]/products/[brand]/[slug]/page.tsx`)

Replace PLACEHOLDER_PRODUCTS with a Drizzle query by slug. Fetch product images. Keep the existing gallery and add-to-cart UI.

- [ ] **Step 3: Rewrite CheckoutForm** (`src/components/checkout/CheckoutForm.tsx`)

Remove hardcoded DELIVERY_ZONES and PRODUCT_CATALOG. Load delivery zones from the server (pass as prop from checkout page, which queries Drizzle). Wire `handlePlaceOrder` to call `POST /api/orders`. On success, redirect to order confirmation with the tracking token.

- [ ] **Step 4: Update checkout page** (`src/app/[lang]/checkout/page.tsx`)

Query delivery zones from Drizzle and pass to CheckoutForm as a prop.

- [ ] **Step 5: Update order confirmation page** (`src/app/[lang]/order-confirmation/page.tsx`)

Show the KBZPay manual payment instructions: QR/phone number from site_settings, exact amount, order number. Read tracking token from URL search params.

- [ ] **Step 6: Wire track order page** (`src/app/[lang]/track/page.tsx`)

Call `GET /api/orders/track?token=xxx` to show order status.

- [ ] **Step 7: Test the full customer flow**

1. Browse catalog → see real products from DB
2. View product detail → see images
3. Add to cart → checkout → fill form → place order
4. See order confirmation with KBZPay payment info
5. Track order via token
6. Check admin dashboard — new order appears

- [ ] **Step 8: Commit**

```bash
git add -A
git commit -m "feat: wire public pages to real database

- Catalog pages query products from Turso via Drizzle
- Product detail shows real images from product_images table
- Checkout loads delivery zones from DB, places real orders
- Order confirmation shows KBZPay manual payment info
- Order tracking works with guest tracking token
- Full customer flow end-to-end functional"
```

---

### Task 8: Build Verification and Final Cleanup

**Files:**
- Modify: Various — fix any build errors, remove unused imports

- [ ] **Step 1: Run the build**

```bash
npm run build
```

Fix any TypeScript errors or missing imports.

- [ ] **Step 2: Verify all routes work in production mode**

```bash
npm run start
```

Test admin login, product CRUD, order placement, and tracking.

- [ ] **Step 3: Add ADMIN_PASSWORD to .env.local.example**

```
ADMIN_PASSWORD=your-admin-password
BLOB_READ_WRITE_TOKEN=vercel-blob-token
```

- [ ] **Step 4: Final commit**

```bash
git add -A
git commit -m "chore: build verification and env var documentation

- All TypeScript errors resolved
- Build passes cleanly
- Updated .env.local.example with new required vars"
```
