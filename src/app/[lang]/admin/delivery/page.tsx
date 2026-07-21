// Admin Delivery Zones page — manage zones and fees via API
// Client component — fetches zones and saves edits
"use client";

import { use, useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/format";

// Shape of delivery zone from the API
interface DeliveryZone {
  id: string;
  nameEn: string;
  nameMy: string | null;
  fee: number;
  estimatedTime: string | null;
  isActive: number;
}

export default function AdminDeliveryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  // All delivery zones from the API
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  // Which zone is currently being edited (by ID)
  const [editing, setEditing] = useState<string | null>(null);
  // Temp values while editing
  const [editFee, setEditFee] = useState(0);
  const [editEta, setEditEta] = useState("");
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  // Fetch all delivery zones from the API
  const loadZones = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/delivery-zones");
      if (!res.ok) throw new Error("Failed to load zones");
      const data = await res.json();
      setZones(data.zones || []);
    } catch {
      setError("Failed to load delivery zones");
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadZones();
  }, [loadZones]);

  // Start editing a zone — populate temp values
  const startEdit = (zone: DeliveryZone) => {
    setEditing(zone.id);
    setEditFee(zone.fee);
    setEditEta(zone.estimatedTime || "");
  };

  // Save edited zone via PUT
  const handleSave = async (zone: DeliveryZone) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          fee: editFee,
          eta: editEta,
        }),
      });
      if (!res.ok) throw new Error("Failed to save");
      setEditing(null);
      await loadZones();
    } catch {
      setError("Failed to save zone");
    } finally {
      setSaving(false);
    }
  };

  // Toggle zone active/inactive
  const toggleActive = async (zone: DeliveryZone) => {
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ is_active: zone.isActive ? 0 : 1 }),
      });
      if (!res.ok) throw new Error("Failed to update");
      await loadZones();
    } catch {
      setError("Failed to toggle zone status");
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
      <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary mb-6">Delivery Zones</h1>

      {/* Error banner */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-error text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-text-primary font-semibold">{zone.nameEn}</h3>
                <p className="text-text-muted text-sm">{zone.nameMy || ""}</p>
              </div>
              <button
                onClick={() => toggleActive(zone)}
                className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80
                  ${zone.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
              >
                {zone.isActive ? "Active" : "Inactive"}
              </button>
            </div>

            {editing === zone.id ? (
              // Edit mode — inline form
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-muted text-xs block mb-1">Fee (MMK)</label>
                    <input
                      type="number"
                      value={editFee}
                      onChange={(e) => setEditFee(parseInt(e.target.value) || 0)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1">ETA</label>
                    <input
                      type="text"
                      value={editEta}
                      onChange={(e) => setEditEta(e.target.value)}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleSave(zone)}
                    disabled={saving}
                    className="px-4 py-2 bg-accent text-background rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
                  >
                    {saving ? "Saving..." : "Save"}
                  </button>
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 text-text-secondary text-sm hover:text-text-primary transition-colors"
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              // View mode — display fee and ETA
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-text-muted">Delivery Fee</span>
                  <span className="text-accent font-medium">{formatPrice(zone.fee)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-text-muted">Estimated Delivery</span>
                  <span className="text-text-primary">{zone.estimatedTime || "—"}</span>
                </div>
                <button
                  onClick={() => startEdit(zone)}
                  className="text-accent text-sm hover:underline"
                >
                  Edit Zone
                </button>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
