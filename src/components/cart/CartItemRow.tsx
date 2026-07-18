// CartItemRow — single item in the shopping cart
// Shows product info, quantity controls, price subtotal, and remove button
"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatPrice } from "@/lib/format";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/constants";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Product data needed for display (resolved from product ID)
interface CartProduct {
  id: string;
  name_en: string;
  name_my: string;
  slug: string;
  brand: string;
  price: number;
  photos: string[];
  stock_count: number;
}

interface CartItemRowProps {
  product: CartProduct;
  quantity: number;
  lang: string;
  dict: Dictionary;
}

export function CartItemRow({ product, quantity, lang, dict }: CartItemRowProps) {
  const { updateQuantity, removeItem } = useCart();
  const name = lang === "my" ? product.name_my : product.name_en;
  const lineTotal = product.price * quantity;

  return (
    <div className="flex gap-4 py-4 border-b border-border">
      {/* Product thumbnail */}
      <Link
        href={`/${lang}/products/${product.brand}/${product.slug}`}
        className="flex-shrink-0 w-20 h-20 sm:w-24 sm:h-24 bg-surface rounded-lg
                   border border-border overflow-hidden"
      >
        {product.photos.length > 0 ? (
          <img src={product.photos[0]} alt={name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-10 h-10 text-text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
        )}
      </Link>

      {/* Product info + controls */}
      <div className="flex-1 min-w-0">
        <div className="flex justify-between items-start">
          <div>
            <p className="text-text-muted text-xs uppercase tracking-wider">
              {product.brand.replace("-", " ")}
            </p>
            <Link
              href={`/${lang}/products/${product.brand}/${product.slug}`}
              className="text-text-primary text-sm font-medium hover:text-accent transition-colors line-clamp-2"
            >
              {name}
            </Link>
            <p className="text-accent text-sm mt-1">{formatPrice(product.price)}</p>
          </div>
          {/* Line total on larger screens */}
          <p className="hidden sm:block text-text-primary font-semibold text-right">
            {formatPrice(lineTotal)}
          </p>
        </div>

        {/* Quantity controls + remove */}
        <div className="flex items-center justify-between mt-3">
          <div className="flex items-center border border-border rounded-lg">
            <button
              onClick={() => updateQuantity(product.id, quantity - 1)}
              className="px-2.5 py-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm"
              aria-label="Decrease quantity"
            >
              -
            </button>
            <span className="px-3 py-1.5 text-text-primary font-medium text-sm min-w-[32px] text-center">
              {quantity}
            </span>
            <button
              onClick={() => updateQuantity(product.id, Math.min(quantity + 1, MAX_QUANTITY_PER_ITEM))}
              className="px-2.5 py-1.5 text-text-secondary hover:text-text-primary transition-colors text-sm"
              aria-label="Increase quantity"
            >
              +
            </button>
          </div>

          {/* Remove button */}
          <button
            onClick={() => removeItem(product.id)}
            className="text-error text-sm hover:underline transition-colors"
          >
            {dict.cart.remove}
          </button>
        </div>

        {/* Line total on mobile */}
        <p className="sm:hidden text-text-primary font-semibold mt-2">
          {formatPrice(lineTotal)}
        </p>
      </div>
    </div>
  );
}
