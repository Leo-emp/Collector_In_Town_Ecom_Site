# Collector In Town — Admin Dashboard & Backend Design

**Date**: 2026-07-22
**Status**: Approved
**Stack**: Next.js 16 + Turso (SQLite) + Drizzle ORM + Better Auth + Vercel Blob + KBZPay

## Context

The Collector In Town e-commerce site (diecast cars, Myanmar market) has complete UI shells for all pages — landing, catalog, product detail, cart, checkout, account, and full admin dashboard (7 pages). Everything renders hardcoded placeholder data. Zero backend logic exists. The only working API route is Better Auth's catch-all at `/api/auth/[...all]`.

This spec defines everything needed to make the site fully functional: database schema, API routes, admin auth, payment integration, image upload, and cleanup of dead Supabase code.

## Decisions

- **Database**: Turso (libSQL) — already used by Better Auth, free tier sufficient
- **ORM**: Drizzle — already in package.json, type-safe, auto migrations
- **Admin auth**: Simple password gate via env var (single admin, no roles)
- **Payment**: KBZPay API integration (real gateway). Manual QR fallback until merchant account approved
- **Image storage**: Vercel Blob (free tier: 100MB storage, 100GB bandwidth)
- **Card payments**: Deferred — KBZPay only at launch
- **No Supabase**: Delete all Supabase client/server files and packages

---

## 1. Database Schema

### 1.1 Tables (6 app tables + 4 Better Auth auto-tables)

Better Auth auto-creates: `user`, `session`, `account`, `verification`. We do not define or modify these.

#### `products`
| Column | Type | Constraints |
|---|---|---|
| id | text (uuid) | PK, default uuid |
| slug | text | unique, not null |
| name_en | text | not null |
| name_my | text | |
| description_en | text | |
| description_my | text | |
| brand | text | not null (mini-gt, hot-wheels, inno64, pop-race) |
| scale | text | not null, default "1:64" |
| price | integer | not null (MMK, no decimals) |
| stock_count | integer | not null, default 0 |
| status | text | not null, default "active" (active/draft/sold_out/discontinued) |
| created_at | text | not null, default current_timestamp |
| updated_at | text | not null, default current_timestamp |

Indexes: `slug` (unique), `brand`, `status`, `created_at`

#### `product_images`
| Column | Type | Constraints |
|---|---|---|
| id | text (uuid) | PK, default uuid |
| product_id | text | FK → products.id, on delete cascade |
| url | text | not null (Vercel Blob URL) |
| display_order | integer | not null, default 0 |
| created_at | text | not null, default current_timestamp |

Index: `product_id`

#### `orders`
| Column | Type | Constraints |
|---|---|---|
| id | text (uuid) | PK, default uuid |
| order_number | text | unique, not null (e.g. CIT-XK91M) |
| auth_user_id | text | nullable, FK → user.id (Better Auth) |
| customer_name | text | not null |
| customer_email | text | not null |
| customer_phone | text | not null |
| address_line | text | not null |
| township | text | not null |
| city_region | text | not null |
| delivery_zone_id | text | FK → delivery_zones.id |
| delivery_fee | integer | not null |
| delivery_notes | text | |
| payment_method | text | not null (kbzpay) |
| payment_status | text | not null, default "pending" (pending/paid/failed) |
| order_status | text | not null, default "pending" (pending/confirmed/shipped/delivered/cancelled) |
| promo_code_id | text | nullable, FK → promo_codes.id |
| discount_amount | integer | not null, default 0 |
| subtotal | integer | not null |
| total | integer | not null |
| tracking_number | text | |
| admin_notes | text | |
| guest_tracking_token | text | |
| created_at | text | not null, default current_timestamp |
| updated_at | text | not null, default current_timestamp |

Indexes: `order_number` (unique), `auth_user_id`, `order_status`, `payment_status`, `created_at`

#### `order_items`
| Column | Type | Constraints |
|---|---|---|
| id | text (uuid) | PK, default uuid |
| order_id | text | FK → orders.id, on delete cascade |
| product_id | text | FK → products.id |
| product_name | text | not null (snapshot at time of order) |
| product_price | integer | not null (snapshot at time of order) |
| quantity | integer | not null |

Index: `order_id`, `product_id`

#### `delivery_zones`
| Column | Type | Constraints |
|---|---|---|
| id | text (uuid) | PK, default uuid |
| name_en | text | not null |
| name_my | text | |
| fee | integer | not null (MMK) |
| estimated_time | text | |
| is_active | integer | not null, default 1 (SQLite boolean) |
| created_at | text | not null, default current_timestamp |

#### `promo_codes`
| Column | Type | Constraints |
|---|---|---|
| id | text (uuid) | PK, default uuid |
| code | text | unique, not null, uppercase |
| discount_type | text | not null (percentage/fixed) |
| discount_value | integer | not null |
| min_order_amount | integer | not null, default 0 |
| max_uses | integer | |
| usage_count | integer | not null, default 0 |
| active | integer | not null, default 1 (SQLite boolean) |
| expires_at | text | |
| created_at | text | not null, default current_timestamp |

Index: `code` (unique)

#### `site_settings`
| Column | Type | Constraints |
|---|---|---|
| key | text | PK, not null |
| value | text | not null (JSON-encoded) |

#### `newsletter_subscribers`
| Column | Type | Constraints |
|---|---|---|
| id | text (uuid) | PK, default uuid |
| email | text | unique, not null |
| name | text | |
| subscribed_at | text | not null, default current_timestamp |

Index: `email` (unique)

### 1.2 Key Design Decisions

- **Snapshot columns on order_items**: `product_name` and `product_price` capture values at order time. Price changes don't retroactively alter past orders.
- **auth_user_id nullable**: Supports guest checkout. Guests get a `guest_tracking_token` for order tracking.
- **All prices as integers**: MMK has no decimal places.
- **SQLite booleans**: Stored as integer 0/1 (Drizzle handles the mapping).
- **No separate customers table**: Customer data lives on orders (for guests) and Better Auth's user table (for registered users). Admin "Customers" page aggregates both.

---

## 2. Admin Authentication

Simple password-based access — no user roles, no accounts.

### Flow
1. Admin visits `/[lang]/admin/*` → admin layout checks for `admin_session` cookie
2. If missing → redirect to `/[lang]/admin/login`
3. Login page: single password field
4. `POST /api/admin/login` — compares input against `ADMIN_PASSWORD` env var (bcrypt-hashed on server)
5. On match: set `admin_session` HTTP-only signed cookie, 24-hour TTL
6. On fail: return error
7. Logout: `POST /api/admin/logout` clears the cookie

### Security
- Cookie is HTTP-only, Secure, SameSite=Lax
- Password comparison uses timing-safe comparison
- Rate limited: 5 attempts per 15 minutes (existing AUTH_RATE_LIMIT)
- Cookie value is a signed token (using BETTER_AUTH_SECRET as the signing key)

---

## 3. API Routes

### 3.1 Public (customer-facing)

| Method | Route | Purpose |
|---|---|---|
| GET | `/api/products` | List products (pagination, brand filter, search, sort) |
| GET | `/api/products/[slug]` | Single product with images |
| POST | `/api/orders` | Place order — validate, check stock, create order + items, decrement stock, initiate KBZPay |
| GET | `/api/orders/track` | Guest order tracking by token (query param) |
| POST | `/api/newsletter` | Subscribe to newsletter |
| POST | `/api/payments/kbzpay/callback` | KBZPay payment notification webhook |

### 3.2 Admin (protected by admin cookie)

All admin routes verify the `admin_session` cookie. Return 401 if missing/invalid.

| Method | Route | Purpose |
|---|---|---|
| POST | `/api/admin/login` | Verify password, set cookie |
| POST | `/api/admin/logout` | Clear cookie |
| GET | `/api/admin/dashboard` | Aggregated stats: revenue, order counts by status, top products, low stock alerts |
| GET | `/api/admin/products` | List all products (admin view with stock, status) |
| POST | `/api/admin/products` | Create product |
| PUT | `/api/admin/products/[id]` | Update product |
| DELETE | `/api/admin/products/[id]` | Soft delete (set status to discontinued) |
| POST | `/api/admin/products/[id]/images` | Upload image to Vercel Blob, create product_images row |
| DELETE | `/api/admin/products/[id]/images/[imageId]` | Delete from Vercel Blob + DB |
| GET | `/api/admin/orders` | List orders with filters (status, date range) |
| PUT | `/api/admin/orders/[id]` | Update order status, tracking number, admin notes |
| GET | `/api/admin/customers` | Aggregated customer list from orders + Better Auth users |
| GET | `/api/admin/promos` | List promo codes |
| POST | `/api/admin/promos` | Create promo code |
| PUT | `/api/admin/promos/[id]` | Update promo code |
| DELETE | `/api/admin/promos/[id]` | Delete promo code |
| GET | `/api/admin/delivery-zones` | List delivery zones |
| PUT | `/api/admin/delivery-zones/[id]` | Update zone fee/ETA/active status |
| GET | `/api/admin/settings` | Get site settings |
| PUT | `/api/admin/settings` | Update site settings |

### 3.3 Validation

All POST/PUT routes validate input using existing Zod schemas from `src/lib/validation.ts`. Admin routes additionally verify the admin cookie before processing.

---

## 4. KBZPay Integration

### 4.1 Merchant API Flow (when credentials available)
1. Customer places order → `POST /api/orders` creates order with `payment_status: pending`
2. Server calls KBZPay Precreate API to generate payment request
3. Response contains a payment URL or QR code data
4. Customer is shown the KBZPay payment page / QR
5. Customer completes payment in KBZPay app
6. KBZPay calls `POST /api/payments/kbzpay/callback` with result
7. Server verifies the callback signature, updates order `payment_status` to `paid` or `failed`
8. Order confirmation page polls or uses the callback to show success

### 4.2 Manual Fallback (until merchant account approved)
1. Customer places order → same flow, order created as `pending`
2. Instead of KBZPay redirect, show order confirmation page with:
   - Admin's KBZPay QR code / phone number (from site_settings)
   - Exact amount to transfer
   - Order number as transfer reference
   - "We'll confirm your payment within 1-2 hours"
3. Admin checks KBZPay app, clicks "Confirm Payment" in admin dashboard

### 4.3 Required Env Vars (when ready)
- `KBZPAY_MERCHANT_CODE`
- `KBZPAY_API_KEY`
- `KBZPAY_API_SECRET`
- `KBZPAY_CALLBACK_URL` (auto-derived from NEXT_PUBLIC_APP_URL)

---

## 5. Image Upload (Vercel Blob)

### Flow
1. Admin opens product edit page, drops image into upload zone
2. Client sends file to `POST /api/admin/products/[id]/images`
3. Server uploads to Vercel Blob via `@vercel/blob` SDK
4. Server creates `product_images` row with the blob URL
5. Returns the image URL + ID for display

### Constraints (from constants.ts)
- Max 6 images per product
- Max 5MB per image
- Accepted: JPEG, PNG, WebP

### Required
- `BLOB_READ_WRITE_TOKEN` env var on Vercel (auto-provisioned when you enable Blob in project settings)

---

## 6. Cleanup

### Delete
- `src/lib/supabase/client.ts`
- `src/lib/supabase/server.ts`
- `src/lib/supabase/types.ts`
- `src/lib/supabase/` directory

### Uninstall
- `@supabase/ssr`
- `@supabase/supabase-js`

### Replace
- All hardcoded `PRODUCTS`, `ORDERS`, `CUSTOMERS`, `PROMOS`, `ZONES` arrays in admin pages → Drizzle queries
- Hardcoded `PRODUCT_CATALOG` in CheckoutForm → real DB lookup
- Hardcoded `DELIVERY_ZONES` in CheckoutForm → DB query
- Dashboard placeholder stats → real aggregation queries

---

## 7. Seed Data

Seed script (`src/lib/seed.ts`) to populate:
- 4 delivery zones (Yangon, Mandalay, Naypyidaw, Other Regions)
- 8 sample products (the current hardcoded ones)
- 3 promo codes (WELCOME10, COLLECTOR20, FLAT5K)
- Site settings (store name, email, phone, currency)

Run via `npx tsx src/lib/seed.ts` after schema push.

---

## 8. Environment Variables (Production)

| Variable | Required | Notes |
|---|---|---|
| `TURSO_DATABASE_URL` | Yes | libsql://xxx.turso.io |
| `TURSO_AUTH_TOKEN` | Yes | Turso auth token |
| `BETTER_AUTH_SECRET` | Yes | Random 32+ char string |
| `NEXT_PUBLIC_APP_URL` | Yes | Production Vercel URL |
| `ADMIN_PASSWORD` | Yes | Admin dashboard password |
| `BLOB_READ_WRITE_TOKEN` | Yes | Vercel Blob (auto-provisioned) |
| `KBZPAY_MERCHANT_CODE` | Later | When merchant account approved |
| `KBZPAY_API_KEY` | Later | When merchant account approved |
| `KBZPAY_API_SECRET` | Later | When merchant account approved |
