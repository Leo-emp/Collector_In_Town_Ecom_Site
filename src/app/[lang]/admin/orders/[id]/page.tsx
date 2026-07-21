// Admin Order Detail page — view and update a single order
// Client component — fetches order data and submits status updates via API
"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { formatPrice, formatDate } from "@/lib/format";

// Shape of order from the API
interface OrderItem {
  id: string;
  productName: string;
  productPrice: number;
  quantity: number;
}

interface OrderData {
  id: string;
  orderNumber: string;
  customerName: string;
  customerEmail: string;
  customerPhone: string;
  addressLine: string;
  township: string;
  cityRegion: string;
  deliveryFee: number;
  deliveryNotes: string | null;
  paymentMethod: string;
  paymentStatus: string;
  orderStatus: string;
  discountAmount: number;
  subtotal: number;
  total: number;
  trackingNumber: string | null;
  adminNotes: string | null;
  createdAt: string;
  updatedAt: string;
}

// All valid statuses for the dropdowns
const ORDER_STATUSES = ["pending", "confirmed", "shipped", "delivered", "cancelled"];
const PAYMENT_STATUSES = ["pending", "paid", "failed"];

export default function AdminOrderDetailPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = use(params);
  // Order data from the API
  const [order, setOrder] = useState<OrderData | null>(null);
  const [items, setItems] = useState<OrderItem[]>([]);
  // Editable fields
  const [orderStatus, setOrderStatus] = useState("");
  const [paymentStatus, setPaymentStatus] = useState("");
  const [trackingNumber, setTrackingNumber] = useState("");
  const [adminNotes, setAdminNotes] = useState("");
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");

  // Load order data from the admin orders list API
  const loadOrder = useCallback(async () => {
    try {
      // Fetch all orders with items from the admin endpoint
      const res = await fetch("/api/admin/orders");
      if (!res.ok) throw new Error("Failed to load orders");
      const data = await res.json();
      // Find this specific order by ID
      const found = data.orders?.find((o: OrderData & { items?: OrderItem[] }) => o.id === id);
      if (!found) {
        setError("Order not found");
        return;
      }
      setOrder(found);
      setItems(found.items || []);
      // Initialize editable fields
      setOrderStatus(found.orderStatus);
      setPaymentStatus(found.paymentStatus);
      setTrackingNumber(found.trackingNumber || "");
      setAdminNotes(found.adminNotes || "");
    } catch {
      setError("Failed to load order");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadOrder();
  }, [loadOrder]);

  // Save changes via PUT /api/admin/orders/[id]
  const handleSave = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_status: orderStatus,
          payment_status: paymentStatus,
          tracking_number: trackingNumber,
          admin_notes: adminNotes,
        }),
      });
      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
      // Refresh order data to get updated timestamps
      await loadOrder();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Status badge color helper
  const statusColor = (s: string) => {
    switch (s) {
      case "delivered": case "paid": return "bg-success/10 text-success";
      case "shipped": return "bg-blue-500/10 text-blue-400";
      case "confirmed": return "bg-accent/10 text-accent";
      case "pending": return "bg-orange-500/10 text-orange-400";
      case "cancelled": case "failed": return "bg-error/10 text-error";
      default: return "bg-surface text-text-muted";
    }
  };

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent";

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!order) {
    return (
      <div className="text-center py-20">
        <p className="text-error mb-4">{error || "Order not found"}</p>
        <Link href={`/${lang}/admin/orders`} className="text-accent hover:underline">
          Back to Orders
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-4xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary">
            Order {order.orderNumber}
          </h1>
          <p className="text-text-muted text-sm mt-1">Placed {formatDate(order.createdAt)}</p>
        </div>
        <Link
          href={`/${lang}/admin/orders`}
          className="text-text-secondary text-sm hover:text-text-primary transition-colors"
        >
          &larr; Back to Orders
        </Link>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-error text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column — order details (2 cols) */}
        <div className="lg:col-span-2 space-y-6">
          {/* Order items */}
          <div className="bg-surface rounded-xl border border-border overflow-hidden">
            <div className="p-5 border-b border-border">
              <h2 className="text-text-primary font-semibold">Items ({items.length})</h2>
            </div>
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border">
                  <th className="text-left text-text-muted font-medium px-5 py-3">Product</th>
                  <th className="text-center text-text-muted font-medium px-5 py-3">Qty</th>
                  <th className="text-right text-text-muted font-medium px-5 py-3">Price</th>
                  <th className="text-right text-text-muted font-medium px-5 py-3">Subtotal</th>
                </tr>
              </thead>
              <tbody>
                {items.map((item) => (
                  <tr key={item.id} className="border-b border-border last:border-0">
                    <td className="px-5 py-3 text-text-primary">{item.productName}</td>
                    <td className="px-5 py-3 text-center text-text-secondary">{item.quantity}</td>
                    <td className="px-5 py-3 text-right text-text-secondary">{formatPrice(item.productPrice)}</td>
                    <td className="px-5 py-3 text-right text-text-primary font-medium">
                      {formatPrice(item.productPrice * item.quantity)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {/* Totals */}
            <div className="p-5 border-t border-border space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-text-muted">Subtotal</span>
                <span className="text-text-primary">{formatPrice(order.subtotal)}</span>
              </div>
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
              <div className="flex justify-between text-sm font-bold pt-2 border-t border-border">
                <span className="text-text-primary">Total</span>
                <span className="text-accent">{formatPrice(order.total)}</span>
              </div>
            </div>
          </div>

          {/* Customer info */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h2 className="text-text-primary font-semibold mb-4">Customer</h2>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-text-muted mb-1">Name</p>
                <p className="text-text-primary">{order.customerName}</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Email</p>
                <p className="text-text-primary">{order.customerEmail}</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Phone</p>
                <p className="text-text-primary">{order.customerPhone}</p>
              </div>
              <div>
                <p className="text-text-muted mb-1">Payment Method</p>
                <p className="text-text-primary uppercase">{order.paymentMethod}</p>
              </div>
            </div>
          </div>

          {/* Delivery address */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h2 className="text-text-primary font-semibold mb-4">Delivery Address</h2>
            <div className="text-sm space-y-1">
              <p className="text-text-primary">{order.addressLine}</p>
              <p className="text-text-secondary">{order.township}, {order.cityRegion}</p>
              {order.deliveryNotes && (
                <p className="text-text-muted mt-2 italic">Note: {order.deliveryNotes}</p>
              )}
            </div>
          </div>
        </div>

        {/* Right column — status management */}
        <div className="space-y-6">
          {/* Current status badges */}
          <div className="bg-surface rounded-xl border border-border p-5">
            <h2 className="text-text-primary font-semibold mb-4">Status</h2>
            <div className="space-y-3">
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Order</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor(order.orderStatus)}`}>
                  {order.orderStatus}
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-text-muted">Payment</span>
                <span className={`text-xs font-medium px-2.5 py-1 rounded-full capitalize ${statusColor(order.paymentStatus)}`}>
                  {order.paymentStatus}
                </span>
              </div>
            </div>
          </div>

          {/* Update form */}
          <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
            <h2 className="text-text-primary font-semibold">Update Order</h2>

            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Order Status</label>
              <select
                value={orderStatus}
                onChange={(e) => setOrderStatus(e.target.value)}
                className={inputClass}
              >
                {ORDER_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Payment Status</label>
              <select
                value={paymentStatus}
                onChange={(e) => setPaymentStatus(e.target.value)}
                className={inputClass}
              >
                {PAYMENT_STATUSES.map((s) => (
                  <option key={s} value={s} className="capitalize">{s}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Tracking Number</label>
              <input
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="Enter tracking number"
                className={inputClass}
              />
            </div>

            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Admin Notes</label>
              <textarea
                value={adminNotes}
                onChange={(e) => setAdminNotes(e.target.value)}
                placeholder="Internal notes (not visible to customer)"
                className={`${inputClass} resize-none h-24`}
              />
            </div>

            <button
              onClick={handleSave}
              disabled={saving}
              className={`w-full px-6 py-3 rounded-lg font-semibold text-sm transition-colors
                ${saved ? "bg-success text-white" : "bg-accent text-background hover:bg-accent-hover"}
                ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
            >
              {saving ? "Saving..." : saved ? "Saved!" : "Save Changes"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
