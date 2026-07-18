// CartContent — client component that renders the cart items and summary
// Separated from the cart page (server component) because it needs CartContext
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Placeholder product catalog — same data used across pages until Supabase is connected
const PRODUCT_CATALOG = [
  { id: "1", name_en: "Nissan GT-R R35 Liberty Walk", name_my: "နစ်ဆန် GT-R R35 Liberty Walk", slug: "nissan-gtr-r35-liberty-walk", brand: "mini-gt", scale: "1:64", price: 45000, photos: [] as string[], stock_count: 15 },
  { id: "2", name_en: "Porsche 911 GT3 RS", name_my: "ပေါ့ရှ 911 GT3 RS", slug: "porsche-911-gt3-rs", brand: "mini-gt", scale: "1:64", price: 52000, photos: [] as string[], stock_count: 8 },
  { id: "3", name_en: "Toyota AE86 Sprinter Trueno", name_my: "တိုယိုတာ AE86 Sprinter Trueno", slug: "toyota-ae86-sprinter-trueno", brand: "hot-wheels", scale: "1:64", price: 12000, photos: [] as string[], stock_count: 25 },
  { id: "4", name_en: "Mazda RX-7 FD3S Spirit R", name_my: "မဇ်ဒါ RX-7 FD3S Spirit R", slug: "mazda-rx7-fd3s-spirit-r", brand: "hot-wheels", scale: "1:64", price: 15000, photos: [] as string[], stock_count: 20 },
  { id: "5", name_en: "Honda Civic Type-R EK9", name_my: "ဟွန်ဒါ Civic Type-R EK9", slug: "honda-civic-type-r-ek9", brand: "inno64", scale: "1:64", price: 38000, photos: [] as string[], stock_count: 10 },
  { id: "6", name_en: "Mitsubishi Lancer Evolution III", name_my: "မစ်ဆူဘီရှီ Lancer Evolution III", slug: "mitsubishi-lancer-evo-iii", brand: "inno64", scale: "1:64", price: 42000, photos: [] as string[], stock_count: 6 },
  { id: "7", name_en: "Nissan Skyline GT-R R34 V-Spec II", name_my: "နစ်ဆန် Skyline GT-R R34 V-Spec II", slug: "nissan-skyline-gtr-r34-vspec-ii", brand: "pop-race", scale: "1:64", price: 35000, photos: [] as string[], stock_count: 12 },
  { id: "8", name_en: "Toyota Supra A80 TRD", name_my: "တိုယိုတာ Supra A80 TRD", slug: "toyota-supra-a80-trd", brand: "pop-race", scale: "1:64", price: 32000, photos: [] as string[], stock_count: 0 },
];

interface CartContentProps {
  lang: string;
  dict: Dictionary;
}

export function CartContent({ lang, dict }: CartContentProps) {
  const { items } = useCart();

  // Resolve cart items to full product data
  const cartProducts = items
    .map((item) => {
      const product = PRODUCT_CATALOG.find((p) => p.id === item.productId);
      return product ? { product, quantity: item.quantity } : null;
    })
    .filter(Boolean) as { product: (typeof PRODUCT_CATALOG)[number]; quantity: number }[];

  // Calculate subtotal
  const subtotal = cartProducts.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0
  );

  if (cartProducts.length === 0) {
    return (
      <div className="text-center py-20">
        <svg className="w-20 h-20 text-text-muted/20 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
        </svg>
        <p className="text-text-secondary text-lg mb-4">{dict.cart.empty}</p>
        <Link
          href={`/${lang}/products/new-arrivals`}
          className="inline-block px-6 py-3 bg-accent text-background rounded-lg
                     font-semibold hover:bg-accent-hover transition-colors"
        >
          {dict.cart.continueShopping}
        </Link>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
      {/* Cart items list — takes 2 columns */}
      <div className="lg:col-span-2">
        {cartProducts.map(({ product, quantity }) => (
          <CartItemRow
            key={product.id}
            product={product}
            quantity={quantity}
            lang={lang}
            dict={dict}
          />
        ))}

        {/* Continue shopping link */}
        <div className="mt-6">
          <Link
            href={`/${lang}/products/new-arrivals`}
            className="text-accent text-sm hover:underline"
          >
            &larr; {dict.cart.continueShopping}
          </Link>
        </div>
      </div>

      {/* Order summary sidebar — takes 1 column */}
      <div>
        <CartSummary subtotal={subtotal} lang={lang} dict={dict} />
      </div>
    </div>
  );
}
