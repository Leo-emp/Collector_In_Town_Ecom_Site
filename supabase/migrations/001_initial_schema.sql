-- ===================================================================
-- Collector In Town — Initial Database Schema
-- Run this in Supabase Dashboard → SQL Editor
-- ===================================================================

-- Products table — the core catalog
create table public.products (
  id uuid default gen_random_uuid() primary key,
  name_en text not null,                    -- English product name
  name_my text not null default '',         -- Burmese product name
  slug text not null unique,                -- URL-friendly identifier
  brand text not null check (brand in ('mini-gt', 'hot-wheels', 'inno64', 'pop-race')),
  scale text not null default '1:64',       -- e.g. "1:64", "1:43"
  price integer not null check (price >= 0), -- Price in MMK (stored as integer)
  description_en text not null default '',  -- English description
  description_my text not null default '',  -- Burmese description
  photos text[] not null default '{}',      -- Array of Supabase Storage URLs
  stock_count integer not null default 0 check (stock_count >= 0), -- Hidden from customers
  status text not null default 'draft' check (status in ('active', 'draft', 'sold_out')),
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

-- Indexes for catalog pages — filter by brand + status, sort by date
create index idx_products_brand_status on public.products (brand, status);
create index idx_products_created_at on public.products (created_at desc);
create index idx_products_slug on public.products (slug);

-- Orders table — tracks every purchase
create table public.orders (
  id uuid default gen_random_uuid() primary key,
  order_number text not null unique,            -- Human-readable e.g. CIT-00001
  customer_id uuid references auth.users(id) on delete set null, -- Null for guests
  customer_name text not null,
  customer_phone text not null,
  customer_email text not null,
  address_line text not null,                   -- House/building number, street
  township text not null,
  city_region text not null,
  delivery_notes text,                          -- Optional e.g. "near the pagoda"
  admin_notes text,                             -- Internal notes (cancellation/refund reasons)
  items jsonb not null,                         -- Array of {product_id, name, price, quantity}
  subtotal integer not null check (subtotal >= 0),     -- Product total in MMK
  promo_code text,                              -- Applied promo code (nullable)
  discount_amount integer not null default 0 check (discount_amount >= 0),
  total integer not null check (total >= 0),    -- Final amount charged online
  delivery_zone text not null,                  -- Zone name
  delivery_fee integer not null check (delivery_fee >= 0),
  delivery_payment text not null check (delivery_payment in ('prepaid', 'pay_at_delivery')),
  payment_method text not null check (payment_method in ('kbzpay', 'card')),
  payment_status text not null default 'pending' check (payment_status in ('pending', 'paid', 'failed')),
  order_status text not null default 'pending' check (order_status in ('pending', 'confirmed', 'shipped', 'delivered', 'cancelled')),
  tracking_number text,                         -- Added manually by admin ~24hrs after shipping
  guest_tracking_token text unique,             -- Unique token for guest order tracking
  created_at timestamptz default now() not null,
  updated_at timestamptz default now() not null
);

create index idx_orders_customer on public.orders (customer_id);
create index idx_orders_status on public.orders (order_status);
create index idx_orders_created_at on public.orders (created_at desc);
create index idx_orders_guest_token on public.orders (guest_tracking_token);

-- Customers profile table — extends Supabase auth.users
create table public.customers (
  id uuid references auth.users(id) on delete cascade primary key,
  name text not null,
  email text not null,
  phone text not null default '',
  address_line text,                -- Saved default address
  township text,
  city_region text,
  created_at timestamptz default now() not null
);

-- Delivery zones — admin-managed, used at checkout
create table public.delivery_zones (
  id uuid default gen_random_uuid() primary key,
  zone_name text not null unique,
  cities text[] not null default '{}',  -- Cities/townships belonging to this zone
  fee integer not null check (fee >= 0), -- Delivery fee in MMK
  estimated_time text not null default '' -- e.g. "1-2 business days"
);

-- Promo codes — admin-created discount codes
create table public.promo_codes (
  id uuid default gen_random_uuid() primary key,
  code text not null unique,
  discount_type text not null check (discount_type in ('percentage', 'fixed')),
  discount_value integer not null check (discount_value > 0),
  min_order_amount integer not null default 0,
  expires_at timestamptz not null,
  usage_limit integer not null default 1,
  usage_count integer not null default 0,
  active boolean not null default true
);

-- Site settings — key-value store for config like free shipping threshold
create table public.site_settings (
  key text primary key,
  value jsonb not null default '{}'
);

-- Featured 3D models — linked to products, shown on landing page showcase
create table public.featured_3d_models (
  id uuid default gen_random_uuid() primary key,
  product_id uuid references public.products(id) on delete cascade not null,
  model_url text not null,              -- Supabase Storage URL to GLB file
  display_order integer not null default 0 -- Position in horizontal showcase
);

create index idx_featured_order on public.featured_3d_models (display_order);

-- Newsletter subscribers — email signup from footer
create table public.newsletter_subscribers (
  id uuid default gen_random_uuid() primary key,
  name text not null,
  email text not null unique,
  subscribed_at timestamptz default now() not null
);

-- Auto-update updated_at timestamp on products and orders
create or replace function public.update_updated_at()
returns trigger as $$
begin
  new.updated_at = now();
  return new;
end;
$$ language plpgsql;

create trigger products_updated_at
  before update on public.products
  for each row execute function public.update_updated_at();

create trigger orders_updated_at
  before update on public.orders
  for each row execute function public.update_updated_at();
