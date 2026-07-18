// AddToCartButton — client component for adding products to the cart
// Handles quantity selection and disabled state for sold-out items
"use client";

import { useState } from "react";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/constants";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface AddToCartButtonProps {
  productId: string;
  isInStock: boolean;
  dict: Dictionary;
}

export function AddToCartButton({ productId, isInStock, dict }: AddToCartButtonProps) {
  const [quantity, setQuantity] = useState(1);
  const [added, setAdded] = useState(false);

  // Handle add to cart — stores in localStorage (full cart logic in Task 8)
  const handleAddToCart = () => {
    // Read existing cart from localStorage
    const cart = JSON.parse(localStorage.getItem("cit-cart") || "[]");

    // Check if product already in cart
    const existingIndex = cart.findIndex(
      (item: { productId: string }) => item.productId === productId
    );

    if (existingIndex >= 0) {
      // Update quantity (capped at max)
      cart[existingIndex].quantity = Math.min(
        cart[existingIndex].quantity + quantity,
        MAX_QUANTITY_PER_ITEM
      );
    } else {
      // Add new item
      cart.push({ productId, quantity });
    }

    localStorage.setItem("cit-cart", JSON.stringify(cart));

    // Show "Added" feedback briefly
    setAdded(true);
    setTimeout(() => setAdded(false), 2000);
  };

  if (!isInStock) {
    return (
      <button
        disabled
        className="w-full py-3.5 rounded-lg font-semibold text-lg
                   bg-surface text-text-muted cursor-not-allowed border border-border"
      >
        {dict.product.outOfStock}
      </button>
    );
  }

  return (
    <div className="space-y-3">
      {/* Quantity selector */}
      <div className="flex items-center gap-3">
        <label className="text-text-secondary text-sm">{dict.product.quantity}:</label>
        <div className="flex items-center border border-border rounded-lg">
          <button
            onClick={() => setQuantity(Math.max(1, quantity - 1))}
            className="px-3 py-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Decrease quantity"
          >
            -
          </button>
          <span className="px-4 py-2 text-text-primary font-medium min-w-[40px] text-center">
            {quantity}
          </span>
          <button
            onClick={() => setQuantity(Math.min(MAX_QUANTITY_PER_ITEM, quantity + 1))}
            className="px-3 py-2 text-text-secondary hover:text-text-primary transition-colors"
            aria-label="Increase quantity"
          >
            +
          </button>
        </div>
      </div>

      {/* Add to cart button */}
      <button
        onClick={handleAddToCart}
        className={`w-full py-3.5 rounded-lg font-semibold text-lg transition-colors
          ${added
            ? "bg-success text-white"
            : "bg-accent text-background hover:bg-accent-hover"
          }`}
      >
        {added ? dict.cart.itemAdded : dict.product.addToCart}
      </button>
    </div>
  );
}
