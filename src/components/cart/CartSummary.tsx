// CartSummary — order summary sidebar showing subtotal, delivery estimate, and total
// Fetches active delivery zones from API for location-based fee preview
"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Delivery zone shape from API
interface DeliveryZone {
  id: string;
  nameEn: string;
  city: string;
  township: string;
  fee: number;
  feePerKg: number;
}

interface CartSummaryProps {
  subtotal: number;
  lang: string;
  dict: Dictionary;
}

export function CartSummary({ subtotal, lang, dict }: CartSummaryProps) {
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [selectedState, setSelectedState] = useState("");
  const [promoCode, setPromoCode] = useState("");
  const [promoApplied, setPromoApplied] = useState(false);

  // Fetch delivery zones on mount
  useEffect(() => {
    fetch("/api/delivery-zones")
      .then((res) => res.json())
      .then((data) => setZones(data.zones || []))
      .catch(() => {});
  }, []);

  // Unique states for the dropdown
  const stateOptions = useMemo(() => {
    return [...new Set(zones.map((z) => z.nameEn))].sort();
  }, [zones]);

  // Find cheapest zone in selected state for fee preview
  const previewZone = useMemo(() => {
    if (!selectedState) return null;
    const stateZones = zones.filter((z) => z.nameEn === selectedState);
    if (stateZones.length === 0) return null;
    return stateZones.reduce((min, z) => z.fee < min.fee ? z : min, stateZones[0]);
  }, [zones, selectedState]);

  const deliveryFee = previewZone?.fee || 0;
  const total = subtotal + deliveryFee;

  // Handle promo code (placeholder — validated at checkout)
  const handleApplyPromo = () => {
    if (promoCode.trim()) setPromoApplied(true);
  };

  return (
    <div className="bg-surface rounded-xl border border-border p-6 sticky top-24">
      <h2 className="text-text-primary font-semibold text-lg mb-4">
        {dict.cart.title}
      </h2>

      {/* State selector for delivery fee preview */}
      <div className="mb-4">
        <label className="text-text-secondary text-sm block mb-2">
          {dict.checkout.deliveryZone}
        </label>
        <select
          value={selectedState}
          onChange={(e) => setSelectedState(e.target.value)}
          className="w-full bg-background border border-border rounded-lg px-3 py-2.5
                     text-text-primary text-sm focus:outline-none focus:border-accent"
        >
          <option value="">-- Select State / Region --</option>
          {stateOptions.map((state) => (
            <option key={state} value={state}>{state}</option>
          ))}
        </select>
        {selectedState && previewZone && (
          <p className="text-text-muted text-xs mt-1">
            Starting from {formatPrice(previewZone.fee)}
          </p>
        )}
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
          <p className="text-success text-xs mt-1">Promo code applied (validated at checkout)</p>
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
            {previewZone ? formatPrice(deliveryFee) : "—"}
          </span>
        </div>

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
