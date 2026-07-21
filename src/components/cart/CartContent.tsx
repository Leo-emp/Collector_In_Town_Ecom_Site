// CartContent — client component that renders cart items and summary
// Fetches real product data from the API to resolve cart item IDs
"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { CartItemRow } from "./CartItemRow";
import { CartSummary } from "./CartSummary";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Product data shape from the API
interface ProductData {
  id: string;
  nameEn: string;
  nameMy: string | null;
  slug: string;
  brand: string;
  scale: string;
  price: number;
  stockCount: number;
  images: Array<{ url: string }>;
}

interface CartContentProps {
  lang: string;
  dict: Dictionary;
}

export function CartContent({ lang, dict }: CartContentProps) {
  const { items } = useCart();
  // Product data fetched from the API
  const [productMap, setProductMap] = useState<Map<string, ProductData>>(new Map());
  const [loading, setLoading] = useState(true);

  // Fetch product data for all cart items
  useEffect(() => {
    if (items.length === 0) {
      setLoading(false);
      return;
    }

    const ids = items.map((i) => i.productId).join(",");
    fetch(`/api/products?ids=${ids}`)
      .then((res) => res.json())
      .then((data) => {
        const map = new Map<string, ProductData>();
        for (const p of data.products || []) {
          map.set(p.id, p);
        }
        setProductMap(map);
      })
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [items]);

  // Resolve cart items to full product data
  const cartProducts = items
    .map((item) => {
      const p = productMap.get(item.productId);
      if (!p) return null;
      // Map API response to the format CartItemRow expects
      return {
        product: {
          id: p.id,
          name_en: p.nameEn,
          name_my: p.nameMy || p.nameEn,
          slug: p.slug,
          brand: p.brand,
          scale: p.scale,
          price: p.price,
          photos: p.images?.map((img) => img.url) || [],
          stock_count: p.stockCount,
        },
        quantity: item.quantity,
      };
    })
    .filter(Boolean) as { product: { id: string; name_en: string; name_my: string; slug: string; brand: string; scale: string; price: number; photos: string[]; stock_count: number }; quantity: number }[];

  // Calculate subtotal
  const subtotal = cartProducts.reduce(
    (sum, { product, quantity }) => sum + product.price * quantity,
    0
  );

  // Loading state
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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
