// Admin Promo Codes page — manage discount codes via API
// Client component — fetches, creates, and deletes promo codes
"use client";

import { use, useState, useEffect, useCallback } from "react";
import { formatDate } from "@/lib/format";

// Shape of promo code from the API
interface PromoCode {
  id: string;
  code: string;
  discountType: string;
  discountValue: number;
  minOrderAmount: number;
  maxUses: number | null;
  usageCount: number;
  active: number;
  expiresAt: string | null;
  createdAt: string;
}

// Empty form for creating a new promo code
const EMPTY_PROMO = {
  code: "",
  discount_type: "percentage",
  discount_value: 0,
  min_order_amount: 0,
  max_uses: 100,
  expires_at: "",
};

export default function AdminPromosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  // Promo codes from the API
  const [promos, setPromos] = useState<PromoCode[]>([]);
  // Toggle the create form
  const [showForm, setShowForm] = useState(false);
  // New promo form state
  const [form, setForm] = useState(EMPTY_PROMO);
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch all promo codes from the API
  const loadPromos = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/promos");
      if (!res.ok) throw new Error("Failed to load promos");
      const data = await res.json();
      setPromos(data.promos || []);
    } catch {
      setError("Failed to load promo codes");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadPromos();
  }, [loadPromos]);

  // Create a new promo code
  const handleCreate = async () => {
    if (!form.code.trim()) return;
    setSaving(true);
    setError("");

    try {
      const res = await fetch("/api/admin/promos", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...form,
          // Convert empty expires_at to null
          expires_at: form.expires_at || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to create promo");
      }

      // Reset form and reload list
      setForm(EMPTY_PROMO);
      setShowForm(false);
      await loadPromos();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create");
    } finally {
      setSaving(false);
    }
  };

  // Delete a promo code
  const handleDelete = async (promoId: string) => {
    try {
      const res = await fetch(`/api/admin/promos/${promoId}`, { method: "DELETE" });
      if (!res.ok) throw new Error("Failed to delete");
      // Remove from local state immediately
      setPromos((prev) => prev.filter((p) => p.id !== promoId));
    } catch {
      setError("Failed to delete promo code");
    }
  };

  // Toggle active/inactive
  const handleToggle = async (promo: PromoCode) => {
    try {
      const res = await fetch(`/api/admin/promos/${promo.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ active: promo.active ? 0 : 1 }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await loadPromos();
    } catch {
      setError("Failed to update promo code");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary">Promo Codes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-accent text-background rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Promo"}
        </button>
      </div>

      {/* Error banner */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-error text-sm">
          {error}
        </div>
      )}

      {/* Add promo form — slides in when toggled */}
      {showForm && (
        <div className="bg-surface rounded-xl border border-border p-5 mb-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Code</label>
              <input
                type="text"
                value={form.code}
                onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })}
                placeholder="SAVE10"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Type</label>
              <select
                value={form.discount_type}
                onChange={(e) => setForm({ ...form, discount_type: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
              >
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Ks)</option>
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Value</label>
              <input
                type="number"
                value={form.discount_value}
                onChange={(e) => setForm({ ...form, discount_value: parseInt(e.target.value) || 0 })}
                placeholder="10"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Min Order (MMK)</label>
              <input
                type="number"
                value={form.min_order_amount}
                onChange={(e) => setForm({ ...form, min_order_amount: parseInt(e.target.value) || 0 })}
                placeholder="30000"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Max Uses</label>
              <input
                type="number"
                value={form.max_uses}
                onChange={(e) => setForm({ ...form, max_uses: parseInt(e.target.value) || 0 })}
                placeholder="100"
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Expires</label>
              <input
                type="date"
                value={form.expires_at}
                onChange={(e) => setForm({ ...form, expires_at: e.target.value })}
                className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !form.code.trim()}
            className="px-6 py-2.5 bg-accent text-background rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Promo Code"}
          </button>
        </div>
      )}

      {/* Promos table */}
      <div className="bg-surface rounded-xl border border-border overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border bg-surface-hover/30">
                <th className="text-left text-text-muted font-medium px-5 py-3">Code</th>
                <th className="text-left text-text-muted font-medium px-5 py-3">Discount</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Usage</th>
                <th className="text-center text-text-muted font-medium px-5 py-3">Status</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Expires</th>
                <th className="text-right text-text-muted font-medium px-5 py-3">Actions</th>
              </tr>
            </thead>
            <tbody>
              {promos.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-8 text-center text-text-muted">
                    No promo codes yet
                  </td>
                </tr>
              ) : (
                promos.map((promo) => (
                  <tr key={promo.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                    <td className="px-5 py-3">
                      <span className="bg-accent/10 text-accent font-mono text-xs px-2 py-1 rounded">{promo.code}</span>
                    </td>
                    <td className="px-5 py-3 text-text-primary">
                      {promo.discountType === "percentage" ? `${promo.discountValue}%` : `${promo.discountValue.toLocaleString()} Ks`}
                      <span className="text-text-muted text-xs ml-1">(min {promo.minOrderAmount.toLocaleString()} Ks)</span>
                    </td>
                    <td className="px-5 py-3 text-center text-text-secondary">
                      {promo.usageCount}/{promo.maxUses ?? "∞"}
                    </td>
                    <td className="px-5 py-3 text-center">
                      <button
                        onClick={() => handleToggle(promo)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80
                          ${promo.active ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
                      >
                        {promo.active ? "Active" : "Inactive"}
                      </button>
                    </td>
                    <td className="px-5 py-3 text-right text-text-muted">
                      {promo.expiresAt ? formatDate(promo.expiresAt) : "Never"}
                    </td>
                    <td className="px-5 py-3 text-right">
                      <button
                        onClick={() => handleDelete(promo.id)}
                        className="text-error text-xs hover:underline"
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
