// Validation schemas for API inputs using Zod
// All user-facing forms validate here before hitting the database
import { z } from "zod";

// Contact info — checkout step 1
export const contactSchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  email: z.string().email("Invalid email address"),
  phone: z.string().min(5, "Phone number is required").max(20),
});

// Delivery address — checkout step 2
export const deliverySchema = z.object({
  address: z.string().min(1, "Address is required").max(500),
  township: z.string().min(1, "Township is required").max(100),
  city: z.string().min(1, "City is required").max(100),
  zone: z.string().min(1, "Delivery zone is required"),
  notes: z.string().max(500).optional(),
});

// Order placement — combines contact + delivery + payment + items
export const orderSchema = z.object({
  contact: contactSchema,
  delivery: deliverySchema,
  // "card" = Stripe Checkout, "cod" = Cash on Delivery
  payment_method: z.enum(["card", "cod"]),
  items: z
    .array(
      z.object({
        productId: z.string().uuid(),
        quantity: z.number().int().min(1).max(5),
      })
    )
    .min(1, "Cart cannot be empty"),
  promo_code: z.string().max(50).optional(),
});

// Newsletter subscription
export const newsletterSchema = z.object({
  email: z.string().email("Invalid email address"),
});

// Product creation/update — admin
export const productSchema = z.object({
  name_en: z.string().min(1).max(200),
  name_my: z.string().max(200).optional(),
  description_en: z.string().max(2000).optional(),
  description_my: z.string().max(2000).optional(),
  brand: z.string().min(1),
  scale: z.string().min(1),
  price: z.number().int().min(0),
  weight: z.number().int().min(0).optional(),
  details: z.string().max(5000).optional(),
  terms: z.string().max(2000).optional(),
  show_terms: z.boolean().optional(),
  stock_count: z.number().int().min(0),
  status: z.enum(["active", "draft", "sold_out", "discontinued"]),
});

// Promo code creation — admin
export const promoSchema = z.object({
  code: z.string().min(3).max(30).regex(/^[A-Z0-9]+$/, "Code must be uppercase alphanumeric"),
  discount_type: z.enum(["percentage", "fixed"]),
  discount_value: z.number().min(1),
  min_order_amount: z.number().int().min(0).optional(),
  max_uses: z.number().int().min(1).optional(),
  expires_at: z.string().optional(),
});

// Delivery zone update — admin (all fields optional for partial updates)
export const deliveryZoneSchema = z.object({
  name_en: z.string().min(1).max(100).optional(),
  name_my: z.string().max(100).optional(),
  city: z.string().max(100).optional(),
  township: z.string().max(100).optional(),
  fee: z.number().int().min(0).optional(),
  fee_per_kg: z.number().int().min(0).optional(),
  eta: z.string().max(50).optional(),
  is_active: z.union([z.boolean(), z.number()]).optional(),
});

// Admin login — simple password check (single admin, no roles)
export const adminLoginSchema = z.object({
  password: z.string().min(1, "Password is required"),
});

// Type exports for consuming components
export type ContactInput = z.infer<typeof contactSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type PromoInput = z.infer<typeof promoSchema>;
