// CartContext — global cart state using React Context + localStorage
// Provides add/remove/update/clear operations across the app
"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  type ReactNode,
} from "react";
import { MAX_QUANTITY_PER_ITEM } from "@/lib/constants";

// Shape of a single cart item
export interface CartItem {
  productId: string;
  quantity: number;
}

// Context value exposed to consumers
interface CartContextValue {
  items: CartItem[];
  addItem: (productId: string, quantity?: number) => void;
  removeItem: (productId: string) => void;
  updateQuantity: (productId: string, quantity: number) => void;
  clearCart: () => void;
  itemCount: number;
}

const CartContext = createContext<CartContextValue | null>(null);

// localStorage key for cart persistence
const CART_KEY = "cit-cart";

// Read cart from localStorage (safe for SSR)
function loadCart(): CartItem[] {
  if (typeof window === "undefined") return [];
  try {
    const stored = localStorage.getItem(CART_KEY);
    return stored ? JSON.parse(stored) : [];
  } catch {
    return [];
  }
}

// Write cart to localStorage
function saveCart(items: CartItem[]) {
  if (typeof window === "undefined") return;
  localStorage.setItem(CART_KEY, JSON.stringify(items));
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [loaded, setLoaded] = useState(false);

  // Load cart from localStorage on mount (client-side only)
  useEffect(() => {
    setItems(loadCart());
    setLoaded(true);
  }, []);

  // Persist to localStorage whenever items change (skip initial SSR render)
  useEffect(() => {
    if (loaded) saveCart(items);
  }, [items, loaded]);

  // Add item to cart — merges quantities if product already exists
  const addItem = useCallback((productId: string, quantity: number = 1) => {
    setItems((prev) => {
      const existing = prev.find((item) => item.productId === productId);
      if (existing) {
        // Cap at max quantity per item
        return prev.map((item) =>
          item.productId === productId
            ? { ...item, quantity: Math.min(item.quantity + quantity, MAX_QUANTITY_PER_ITEM) }
            : item
        );
      }
      return [...prev, { productId, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }];
    });
  }, []);

  // Remove item entirely from cart
  const removeItem = useCallback((productId: string) => {
    setItems((prev) => prev.filter((item) => item.productId !== productId));
  }, []);

  // Update quantity for a specific item (remove if quantity hits 0)
  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((prev) => prev.filter((item) => item.productId !== productId));
      return;
    }
    setItems((prev) =>
      prev.map((item) =>
        item.productId === productId
          ? { ...item, quantity: Math.min(quantity, MAX_QUANTITY_PER_ITEM) }
          : item
      )
    );
  }, []);

  // Clear entire cart
  const clearCart = useCallback(() => {
    setItems([]);
  }, []);

  // Total item count (sum of all quantities)
  const itemCount = items.reduce((sum, item) => sum + item.quantity, 0);

  return (
    <CartContext.Provider
      value={{ items, addItem, removeItem, updateQuantity, clearCart, itemCount }}
    >
      {children}
    </CartContext.Provider>
  );
}

// Hook for consuming cart context
export function useCart() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCart must be used within a CartProvider");
  }
  return context;
}
