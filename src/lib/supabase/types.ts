// Database types — manually defined to match our schema
// Will be replaced with auto-generated types once Supabase project is connected:
// npx supabase gen types typescript --project-id <id> > src/lib/supabase/types.ts

export type Database = {
  public: {
    Tables: {
      products: {
        Row: {
          id: string;
          name_en: string;
          name_my: string;
          slug: string;
          brand: "mini-gt" | "hot-wheels" | "inno64" | "pop-race";
          scale: string;
          price: number;
          description_en: string;
          description_my: string;
          photos: string[];
          stock_count: number;
          status: "active" | "draft" | "sold_out";
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["products"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["products"]["Insert"]
        >;
      };
      orders: {
        Row: {
          id: string;
          order_number: string;
          customer_id: string | null;
          customer_name: string;
          customer_phone: string;
          customer_email: string;
          address_line: string;
          township: string;
          city_region: string;
          delivery_notes: string | null;
          admin_notes: string | null;
          items: Array<{
            product_id: string;
            name: string;
            price: number;
            quantity: number;
          }>;
          subtotal: number;
          promo_code: string | null;
          discount_amount: number;
          total: number;
          delivery_zone: string;
          delivery_fee: number;
          delivery_payment: "prepaid" | "pay_at_delivery";
          payment_method: "kbzpay" | "card";
          payment_status: "pending" | "paid" | "failed";
          order_status:
            | "pending"
            | "confirmed"
            | "shipped"
            | "delivered"
            | "cancelled";
          tracking_number: string | null;
          guest_tracking_token: string | null;
          created_at: string;
          updated_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["orders"]["Row"],
          "id" | "created_at" | "updated_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["orders"]["Insert"]
        >;
      };
      customers: {
        Row: {
          id: string;
          name: string;
          email: string;
          phone: string;
          address_line: string | null;
          township: string | null;
          city_region: string | null;
          created_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["customers"]["Row"],
          "created_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["customers"]["Insert"]
        >;
      };
      delivery_zones: {
        Row: {
          id: string;
          zone_name: string;
          cities: string[];
          fee: number;
          estimated_time: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["delivery_zones"]["Row"],
          "id"
        >;
        Update: Partial<
          Database["public"]["Tables"]["delivery_zones"]["Insert"]
        >;
      };
      promo_codes: {
        Row: {
          id: string;
          code: string;
          discount_type: "percentage" | "fixed";
          discount_value: number;
          min_order_amount: number;
          expires_at: string;
          usage_limit: number;
          usage_count: number;
          active: boolean;
        };
        Insert: Omit<
          Database["public"]["Tables"]["promo_codes"]["Row"],
          "id" | "usage_count"
        >;
        Update: Partial<
          Database["public"]["Tables"]["promo_codes"]["Insert"]
        >;
      };
      site_settings: {
        Row: { key: string; value: unknown };
        Insert: { key: string; value: unknown };
        Update: Partial<{ key: string; value: unknown }>;
      };
      featured_3d_models: {
        Row: {
          id: string;
          product_id: string;
          model_url: string;
          display_order: number;
        };
        Insert: Omit<
          Database["public"]["Tables"]["featured_3d_models"]["Row"],
          "id"
        >;
        Update: Partial<
          Database["public"]["Tables"]["featured_3d_models"]["Insert"]
        >;
      };
      newsletter_subscribers: {
        Row: {
          id: string;
          name: string;
          email: string;
          subscribed_at: string;
        };
        Insert: Omit<
          Database["public"]["Tables"]["newsletter_subscribers"]["Row"],
          "id" | "subscribed_at"
        >;
        Update: Partial<
          Database["public"]["Tables"]["newsletter_subscribers"]["Insert"]
        >;
      };
    };
  };
};

// Convenience type aliases — import these instead of the deep paths
export type Product = Database["public"]["Tables"]["products"]["Row"];
export type Order = Database["public"]["Tables"]["orders"]["Row"];
export type Customer = Database["public"]["Tables"]["customers"]["Row"];
export type DeliveryZone = Database["public"]["Tables"]["delivery_zones"]["Row"];
export type PromoCode = Database["public"]["Tables"]["promo_codes"]["Row"];
export type FeaturedModel = Database["public"]["Tables"]["featured_3d_models"]["Row"];
export type NewsletterSubscriber = Database["public"]["Tables"]["newsletter_subscribers"]["Row"];
