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
  payment_method: z.enum(["kbzpay", "card"]),
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

// Delivery zone update — admin
export const deliveryZoneSchema = z.object({
  name_en: z.string().min(1).max(100),
  name_my: z.string().max(100).optional(),
  fee: z.number().int().min(0),
  eta: z.string().max(50).optional(),
  is_active: z.boolean(),
});

// Type exports for consuming components
export type ContactInput = z.infer<typeof contactSchema>;
export type DeliveryInput = z.infer<typeof deliverySchema>;
export type OrderInput = z.infer<typeof orderSchema>;
export type ProductInput = z.infer<typeof productSchema>;
export type PromoInput = z.infer<typeof promoSchema>;
