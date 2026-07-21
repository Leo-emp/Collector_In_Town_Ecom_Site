// TrackingForm — guest order tracking via real API
// Calls GET /api/orders/track?token=xxx to look up order by tracking token
"use client";

import { useState, useEffect } from "react";
import { formatPrice, formatDate } from "@/lib/format";
import type { Dictionary } from "@/app/[lang]/dictionaries";

// Order status steps in sequence
const STATUS_STEPS = ["pending", "confirmed", "shipped", "delivered"] as const;

// Shape of tracking API response
interface TrackedOrder {
  orderNumber: string;
  orderStatus: string;
  paymentStatus: string;
  total: number;
  subtotal: number;
  deliveryFee: number;
  discountAmount: number;
  trackingNumber: string | null;
  createdAt: string;
  items: Array<{
    name: string;
    price: number;
    quantity: number;
  }>;
}

interface TrackingFormProps {
  lang: string;
  dict: Dictionary;
  initialToken?: string;
}

export function TrackingForm({ lang, dict, initialToken }: TrackingFormProps) {
  const [token, setToken] = useState(initialToken || "");
  const [order, setOrder] = useState<TrackedOrder | null>(null);
  const [searched, setSearched] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  // Auto-search if token is provided in URL
  useEffect(() => {
    if (initialToken) {
      lookupOrder(initialToken);
    }
  }, [initialToken]);

  // Look up order by tracking token via API
  const lookupOrder = async (trackingToken: string) => {
    setLoading(true);
    setError("");
    setOrder(null);

    try {
      const res = await fetch(`/api/orders/track?token=${encodeURIComponent(trackingToken)}`);
      if (res.status === 404) {
        setSearched(true);
        return;
      }
      if (!res.ok) throw new Error("Failed to look up order");

      const data = await res.json();
      setOrder(data.order);
      setSearched(true);
    } catch {
      setError("Failed to look up order. Please try again.");
      setSearched(true);
    } finally {
      setLoading(false);
    }
  };

  // Handle form submission
  const handleTrack = (e: React.FormEvent) => {
    e.preventDefault();
    if (!token.trim()) return;
    lookupOrder(token.trim());
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
          disabled={loading}
          className="px-6 py-3 bg-accent text-background rounded-lg font-semibold
                     hover:bg-accent-hover transition-colors disabled:opacity-50"
        >
          {loading ? "..." : dict.tracking.track}
        </button>
      </form>

      {/* Error message */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-error text-sm">
          {error}
        </div>
      )}

      {/* Order result */}
      {searched && order && (
        <div className="bg-surface rounded-xl border border-border p-6">
          {/* Order header */}
          <div className="flex justify-between items-start mb-6">
            <div>
              <p className="text-text-muted text-sm">{dict.checkout.orderNumber}</p>
              <p className="text-accent font-bold text-lg">{order.orderNumber}</p>
            </div>
            <p className="text-text-muted text-sm">{formatDate(order.createdAt)}</p>
          </div>

          {/* Cancelled orders show a simple message instead of the progress tracker */}
          {order.orderStatus === "cancelled" ? (
            <div className="bg-error/10 rounded-lg p-4 mb-6 text-center">
              <p className="text-error font-medium">{dict.tracking.cancelled}</p>
            </div>
          ) : (
            // Status tracker — horizontal steps
            <div className="flex items-center justify-between mb-8">
              {STATUS_STEPS.map((step, i) => {
                const currentIndex = STATUS_STEPS.indexOf(
                  order.orderStatus as (typeof STATUS_STEPS)[number]
                );
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
          )}

          {/* Tracking number if available */}
          {order.trackingNumber && (
            <div className="bg-accent/5 rounded-lg p-3 mb-4 text-sm">
              <span className="text-text-muted">Tracking: </span>
              <span className="text-accent font-medium">{order.trackingNumber}</span>
            </div>
          )}

          {/* Order items */}
          <div className="border-t border-border pt-4 space-y-3">
            {order.items.map((item, i) => (
              <div key={i} className="flex justify-between text-sm">
                <span className="text-text-secondary">{item.name} × {item.quantity}</span>
                <span className="text-text-primary">{formatPrice(item.price * item.quantity)}</span>
              </div>
            ))}
            {order.discountAmount > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Discount</span>
                <span className="text-success">-{formatPrice(order.discountAmount)}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span className="text-text-muted">Delivery</span>
              <span className="text-text-primary">{formatPrice(order.deliveryFee)}</span>
            </div>
            <div className="flex justify-between font-bold pt-2 border-t border-border">
              <span className="text-text-primary">{dict.cart.total}</span>
              <span className="text-accent">{formatPrice(order.total)}</span>
            </div>
          </div>
        </div>
      )}

      {/* No order found */}
      {searched && !order && !error && (
        <div className="text-center py-12">
          <p className="text-text-secondary">No order found with that tracking token.</p>
        </div>
      )}
    </div>
  );
}
