// Admin Delivery Zones page — manage zones (state/city/township) and fees
// Client component — fetches zones and saves edits
"use client";

import { use, useState, useEffect, useCallback } from "react";
import { formatPrice } from "@/lib/format";

// Shape of delivery zone from the API
interface DeliveryZone {
  id: string;
  nameEn: string;
  nameMy: string | null;
  city: string;
  township: string;
  fee: number;
  feePerKg: number;
  estimatedTime: string | null;
  isActive: number;
}

export default function AdminDeliveryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  // All delivery zones from the API
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editCity, setEditCity] = useState("");
  const [editTownship, setEditTownship] = useState("");
  const [editFee, setEditFee] = useState<number>(0);
  const [editFeePerKg, setEditFeePerKg] = useState<number>(0);
  const [editEta, setEditEta] = useState("");
  // Add zone form
  const [showAdd, setShowAdd] = useState(false);
  const [newState, setNewState] = useState("");
  const [newCity, setNewCity] = useState("");
  const [newTownship, setNewTownship] = useState("");
  const [newFee, setNewFee] = useState<number>(0);
  const [newFeePerKg, setNewFeePerKg] = useState<number>(0);
  const [newEta, setNewEta] = useState("");
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
    setEditName(zone.nameEn);
    setEditCity(zone.city || "");
    setEditTownship(zone.township || "");
    setEditFee(zone.fee);
    setEditFeePerKg(zone.feePerKg || 0);
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
          name_en: editName,
          city: editCity,
          township: editTownship,
          fee: editFee,
          fee_per_kg: editFeePerKg,
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

  // Create a new zone via POST
  const handleCreate = async () => {
    if (!newState.trim()) return;
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: newState.trim(),
          city: newCity.trim(),
          township: newTownship.trim(),
          fee: newFee,
          feePerKg: newFeePerKg,
          estimatedTime: newEta || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create zone");
      setShowAdd(false);
      setNewState("");
      setNewCity("");
      setNewTownship("");
      setNewFee(0);
      setNewFeePerKg(0);
      setNewEta("");
      await loadZones();
    } catch {
      setError("Failed to create zone");
    } finally {
      setSaving(false);
    }
  };

  // Delete a zone permanently via DELETE
  const handleDelete = async (zone: DeliveryZone) => {
    if (!confirm(`Delete "${zone.nameEn}${zone.city ? ` — ${zone.city}` : ""}${zone.township ? ` — ${zone.township}` : ""}"? This cannot be undone.`)) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zone.id}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete");
      await loadZones();
    } catch {
      setError("Failed to delete zone");
    }
  };

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

  // Shared input classes
  const inputClass = "w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent";

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
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary">Delivery Zones</h1>
        <button
          onClick={() => setShowAdd(!showAdd)}
          className="px-4 py-2 bg-accent text-background rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          {showAdd ? "Cancel" : "+ Add Zone"}
        </button>
      </div>

      {/* Info banner — explains the state/city/township structure */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 mb-6 text-text-secondary text-sm">
        Each delivery zone = <strong>State</strong> + <strong>City</strong> + <strong>Township</strong>. Customers can only checkout if their location matches an active zone.
      </div>

      {/* Add zone form */}
      {showAdd && (
        <div className="bg-surface rounded-xl border border-border p-5 mb-6">
          <h3 className="text-text-primary font-semibold mb-4">New Delivery Zone</h3>
          {/* State, City, Township row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-text-muted text-xs block mb-1">State / Region *</label>
              <input
                type="text"
                value={newState}
                onChange={(e) => setNewState(e.target.value)}
                placeholder="e.g. Yangon Region"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-text-muted text-xs block mb-1">City</label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="e.g. Yangon"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-text-muted text-xs block mb-1">Township</label>
              <input
                type="text"
                value={newTownship}
                onChange={(e) => setNewTownship(e.target.value)}
                placeholder="e.g. Latha"
                className={inputClass}
              />
            </div>
          </div>
          {/* Fees and ETA row */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
            <div>
              <label className="text-text-muted text-xs block mb-1">Base Fee (MMK)</label>
              <input
                type="text"
                inputMode="numeric"
                value={newFee || ""}
                onChange={(e) => setNewFee(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                placeholder="e.g. 3000"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-text-muted text-xs block mb-1">Fee per kg (MMK)</label>
              <input
                type="text"
                inputMode="numeric"
                value={newFeePerKg || ""}
                onChange={(e) => setNewFeePerKg(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                placeholder="e.g. 500"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-text-muted text-xs block mb-1">Estimated Delivery</label>
              <input
                type="text"
                value={newEta}
                onChange={(e) => setNewEta(e.target.value)}
                placeholder="e.g. 2-3 days"
                className={inputClass}
              />
            </div>
          </div>
          <button
            onClick={handleCreate}
            disabled={saving || !newState.trim()}
            className="px-4 py-2 bg-accent text-background rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Creating..." : "Create Zone"}
          </button>
        </div>
      )}

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
                {/* State name as main title */}
                <h3 className="text-text-primary font-semibold">{zone.nameEn}</h3>
                {/* City and township as subtitle */}
                {(zone.city || zone.township) && (
                  <p className="text-text-muted text-sm">
                    {[zone.city, zone.township].filter(Boolean).join(" — ")}
                  </p>
                )}
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
              // Edit mode — inline form with all fields
              <div className="space-y-3">
                {/* State, City, Township fields */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-text-muted text-xs block mb-1">State / Region</label>
                    <input
                      type="text"
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1">City</label>
                    <input
                      type="text"
                      value={editCity}
                      onChange={(e) => setEditCity(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1">Township</label>
                    <input
                      type="text"
                      value={editTownship}
                      onChange={(e) => setEditTownship(e.target.value)}
                      className={inputClass}
                    />
                  </div>
                </div>
                {/* Fee fields */}
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="text-text-muted text-xs block mb-1">Base Fee (MMK)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editFee || ""}
                      onChange={(e) => setEditFee(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1">Per kg (MMK)</label>
                    <input
                      type="text"
                      inputMode="numeric"
                      value={editFeePerKg || ""}
                      onChange={(e) => setEditFeePerKg(parseInt(e.target.value.replace(/\D/g, "")) || 0)}
                      className={inputClass}
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1">ETA</label>
                    <input
                      type="text"
                      value={editEta}
                      onChange={(e) => setEditEta(e.target.value)}
                      className={inputClass}
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
              // View mode — display location, fees, and ETA
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-text-muted">Base Fee</span>
                  <span className="text-accent font-medium">{formatPrice(zone.fee)}</span>
                </div>
                {zone.feePerKg > 0 && (
                  <div className="flex justify-between text-sm mb-3">
                    <span className="text-text-muted">Per kg</span>
                    <span className="text-accent font-medium">+ {formatPrice(zone.feePerKg)}/kg</span>
                  </div>
                )}
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-text-muted">Estimated Delivery</span>
                  <span className="text-text-primary">{zone.estimatedTime || "—"}</span>
                </div>
                <div className="flex items-center gap-4">
                  <button
                    onClick={() => startEdit(zone)}
                    className="text-accent text-sm hover:underline"
                  >
                    Edit Zone
                  </button>
                  <button
                    onClick={() => handleDelete(zone)}
                    className="text-error text-sm hover:underline"
                  >
                    Delete
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
