// CartSummary — order summary sidebar showing subtotal, delivery fee, and total
// Includes delivery zone selector and promo code input
"use client";

import { useState } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Delivery zone data — will come from Supabase when connected
const DELIVERY_ZONES = [
  { id: "yangon", name_en: "Yangon", name_my: "ရန်ကုန်", fee: 2000 },
  { id: "mandalay", name_en: "Mandalay", name_my: "မန္တလေး", fee: 3500 },
  { id: "naypyidaw", name_en: "Naypyidaw", name_my: "နေပြည်တော်", fee: 3000 },
  { id: "other", name_en: "Other Regions", name_my: "အခြားဒေသများ", fee: 5000 },
];

// Free shipping threshold in MMK
const FREE_SHIPPING_THRESHOLD = 50000;

interface CartSummaryProps {
  subtotal: number;
  lang: string;
  dict: Dictionary;
}

export function CartSummary({ subtotal, lang, dict }: CartSummaryProps) {
  const [selectedZone, setSelectedZone] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  // Calculate delivery fee — free if above threshold
  const zone = DELIVERY_ZONES.find((z) => z.id === selectedZone);
  const isFreeShipping = subtotal >= FREE_SHIPPING_THRESHOLD;
  const deliveryFee = isFreeShipping ? 0 : (zone?.fee || 0);
  const total = subtotal + deliveryFee;

  // Handle promo code (placeholder — will validate via API)
  const handleApplyPromo = () => {
    if (promoCode.trim()) setPromoApplied(true);
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
      <h2 className="text-text-primary font-semibold text-lg mb-4">
        {dict.cart.title}
      </h2>

      {/* Delivery zone selector */}
      <div className="mb-4">
        <label className="text-text-secondary text-sm block mb-2">
          {dict.checkout.deliveryZone}
        </label>
        <select
          value={selectedZone}
          onChange={(e) => setSelectedZone(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5
                     text-text-primary text-sm focus:outline-none focus:border-accent"
        >
          <option value="">-- {dict.checkout.deliveryZone} --</option>
          {DELIVERY_ZONES.map((z) => (
            <option key={z.id} value={z.id}>
              {lang === "my" ? z.name_my : z.name_en} — {formatPrice(z.fee)}
            </option>
          ))}
        </select>
      </div>

      {/* Promo code input */}
      <div className="mb-6">
        <label className="text-text-secondary text-sm block mb-2">
          {dict.checkout.promoCode}
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoCode}
            onChange={(e) => { setPromoCode(e.target.value); setPromoApplied(false); }}
            placeholder="SAVE10"
            className="flex-1 bg-background border border-border rounded-lg px-3 py-2
                       text-text-primary text-sm placeholder:text-text-muted
                       focus:outline-none focus:border-accent"
          />
          <button
            onClick={handleApplyPromo}
            className="px-4 py-2 bg-surface-hover text-text-primary rounded-lg text-sm
                       font-medium hover:bg-accent hover:text-background transition-colors"
          >
            {dict.checkout.apply}
          </button>
        </div>
        {promoApplied && (
          <p className="text-success text-xs mt-1">Promo code applied (validation coming soon)</p>
        )}
      </div>

      {/* Price breakdown */}
      <div className="space-y-3 border-t border-border pt-4">
        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">{dict.cart.subtotal}</span>
          <span className="text-text-primary">{formatPrice(subtotal)}</span>
        </div>

        <div className="flex justify-between text-sm">
          <span className="text-text-secondary">{dict.cart.deliveryFee}</span>
          <span className="text-text-primary">
            {isFreeShipping
              ? "FREE"
              : zone
                ? formatPrice(deliveryFee)
                : "—"}
          </span>
        </div>

        {/* Free shipping note */}
        {!isFreeShipping && (
          <p className="text-text-muted text-xs">
            {dict.checkout.freeShipping} {formatPrice(FREE_SHIPPING_THRESHOLD)}
          </p>
        )}

        <div className="flex justify-between text-lg font-bold border-t border-border pt-3">
          <span className="text-text-primary">{dict.cart.total}</span>
          <span className="text-accent">{formatPrice(total)}</span>
        </div>
      </div>

      {/* Checkout button */}
      <Link
        href={`/${lang}/checkout`}
        className="block w-full mt-6 py-3.5 rounded-lg bg-accent text-background
                   font-semibold text-center text-lg hover:bg-accent-hover transition-colors"
      >
        {dict.cart.checkout}
      </Link>
    </div>
  );
}
