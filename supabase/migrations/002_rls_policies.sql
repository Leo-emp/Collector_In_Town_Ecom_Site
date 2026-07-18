-- ===================================================================
-- Collector In Town — Row-Level Security Policies
-- Ensures customers can only access their own data
-- Admin operations use service role client (bypasses RLS)
-- ===================================================================

-- Enable RLS on all tables
alter table public.products enable row level security;
alter table public.orders enable row level security;
alter table public.customers enable row level security;
alter table public.delivery_zones enable row level security;
alter table public.promo_codes enable row level security;
alter table public.site_settings enable row level security;
alter table public.featured_3d_models enable row level security;
alter table public.newsletter_subscribers enable row level security;

-- Products: anyone can read active products
-- Admin writes use service role (bypasses RLS)
create policy "Anyone can read active products"
  on public.products for select
  using (status = 'active');

-- Orders: authenticated users can read their own orders
create policy "Users read own orders"
  on public.orders for select
  using (auth.uid() = customer_id);

-- Guest order tracking uses a server-side API route with adminClient (bypasses RLS)
-- No client-side RLS policy needed for guest tracking

-- Customers: users can read their own profile
create policy "Users read own profile"
  on public.customers for select
  using (auth.uid() = id);

-- Customers: users can update their own profile
create policy "Users update own profile"
  on public.customers for update
  using (auth.uid() = id);

-- Customers: allow insert on signup
create policy "Users create own profile"
  on public.customers for insert
  with check (auth.uid() = id);

-- Delivery zones: anyone can read (needed for checkout zone detection)
create policy "Anyone can read delivery zones"
  on public.delivery_zones for select
  using (true);

-- Promo codes: anyone can read active codes (full validation is server-side)
create policy "Anyone can read active promos"
  on public.promo_codes for select
  using (active = true);

-- Site settings: anyone can read (e.g. free shipping threshold)
create policy "Anyone can read settings"
  on public.site_settings for select
  using (true);

-- Featured 3D models: anyone can read (displayed on landing page)
create policy "Anyone can read featured models"
  on public.featured_3d_models for select
  using (true);

-- Newsletter: anyone can subscribe (insert only, no read from client)
create policy "Anyone can subscribe to newsletter"
  on public.newsletter_subscribers for insert
  with check (true);
