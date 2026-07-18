// TrackingForm — guest order tracking form
// Allows customers to enter order number to view delivery status
"use client";

import { useState } from "react";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Order status steps in sequence
const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"] as const;

interface TrackingFormProps {
  lang: string;
  dict: Dictionary;
  initialToken?: string;
}

// Placeholder order data — will come from API when Supabase is connected
const MOCK_ORDER = {
  id: "CIT-DEMO123",
  status: "confirmed" as const,
  items: [
    { name_en: "Nissan GT-R R35 Liberty Walk", name_my: "နစ်ဆန် GT-R R35 Liberty Walk", quantity: 1, price: 45000 },
    { name_en: "Honda Civic Type-R EK9", name_my: "ဟွန်ဒါ Civic Type-R EK9", quantity: 1, price: 38000 },
  ],
  total: 85000,
  delivery_zone: "Yangon",
  created_at: "2026-07-18",
};

export function TrackingForm({ lang, dict, initialToken }: TrackingFormProps) {
  const [token, setToken] = useState(initialToken || "");
  const [order, setOrder] = useState<typeof MOCK_ORDER | null>(null);
  const [searched, setSearched] = useState(false);

  // Look up order by token (placeholder — will call API)
  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    // For demo, show mock order for any input
    setOrder(MOCK_ORDER);
    setSearched(true);
  };

  // Map status keys to dictionary labels
  const statusLabel = (status: string) => {
    const labels: Record<string, string> = {
      pending: dict.tracking.pending,
      confirmed: dict.tracking.confirmed,
      shipped: dict.tracking.shipped,
      delivered: dict.tracking.delivered,
      cancelled: dict.tracking.cancelled,
    };
    return labels[status] || status;
  };

  return (
    <div>
      {/* Search form */}
      <form onSubmit={handleTrack} className="flex gap-3 mb-8">
        <input
          type="text"
          value={token}
          onChange={(e) => setToken(e.target.value)}
          placeholder={dict.tracking.enterToken}
          className="flex-1 bg-background border border-border rounded-lg px-4 py-3
                     text-text-primary placeholder:text-text-muted
                     focus:outline-none focus:border-accent"
        />
        <button
          type="submit"
          className="px-6 py-3 bg-accent text-background rounded-lg font-semibold
                     hover:bg-accent-hover transition-colors"
        >
          {dict.tracking.track}
        </button>
      </form>

      {/* Order result */}
      {searched && order && (
        <div className="bg-surface rounded-xl border border-border p-6">
          {/* Order header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-text-muted text-sm">{dict.checkout.orderNumber}</p>
              <p className="text-accent font-bold text-lg">{order.id}</p>
            </div>
            <p className="text-text-muted text-sm">{order.created_at}</p>
          </div>

          {/* Status tracker — horizontal steps */}
          <div className="flex items-center justify-between mb-8">
            {STATUS_STEPS.map((step, i) => {
              const currentIndex = STATUS_STEPS.indexOf(order.status);
              const isCompleted = i <= currentIndex;
              const isCurrent = i === currentIndex;

              return (
                <div key={step} className="flex items-center flex-1">
                  {/* Step circle */}
                  <div className="flex flex-col items-center">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium
                      ${isCompleted
                        ? "bg-success text-white"
                        : "bg-surface-hover text-text-muted"
                      }
                      ${isCurrent ? "ring-2 ring-success ring-offset-2 ring-offset-surface" : ""}`}
                    >
                      {isCompleted && i < currentIndex ? "✓" : i + 1}
                    </div>
                    <p className={`text-xs mt-1.5 ${isCompleted ? "text-success" : "text-text-muted"}`}>
                      {statusLabel(step)}
                    </p>
                  </div>

                  {/* Connector line */}
                  {i < STATUS_STEPS.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-2 ${i < currentIndex ? "bg-success" : "bg-border"}`} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Order items */}
          <div className="border-t border-border pt-4 space-y-3">
            {order.items.map((item, i) => {
              const name = lang === "my" ? item.name_my : item.name_en;
              return (
                <div key={i} className="flex justify-between text-sm">
                  <span className="text-text-secondary">{name} × {item.quantity}</span>
                  <span className="text-text-primary">{formatPrice(item.price * item.quantity)}</span>
                </div>
              );
            })}
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span className="text-text-primary">{dict.cart.total}</span>
              <span className="text-accent">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* No order found */}
      {searched && !order && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No order found with that tracking number.</p>
        </div>
      )}
    </div>
  );
}
