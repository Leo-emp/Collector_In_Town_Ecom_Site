// Admin Delivery Zones page — manage state/city/township delivery areas and fees
// Each zone entry = one state + city + township combo with its own fee
// Admin adds multiple entries to build out coverage (e.g. same state, different townships)
"use client";

import { use, useState, useEffect, useCallback, useMemo } from "react";
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
  // Add zone form — keeps state after create so admin can add more under same state
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
  const [success, setSuccess] = useState("");

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

  // Group zones by state for organized display
  const groupedZones = useMemo(() => {
    const groups: Record<string, DeliveryZone[]> = {};
    for (const zone of zones) {
      if (!groups[zone.nameEn]) groups[zone.nameEn] = [];
      groups[zone.nameEn].push(zone);
    }
    return groups;
  }, [zones]);

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

  // Create a new zone — keeps state name so admin can quickly add more cities/townships
  const handleCreate = async () => {
    if (!newState.trim()) return;
    setSaving(true);
    setError("");
    setSuccess("");
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
      // Keep the state name and fees so admin can add another city/township quickly
      const added = `${newState}${newCity ? ` — ${newCity}` : ""}${newTownship ? ` — ${newTownship}` : ""}`;
      setNewCity("");
      setNewTownship("");
      setSuccess(`Added: ${added}. Add another city/township or close the form.`);
      await loadZones();
    } catch {
      setError("Failed to create zone");
    } finally {
      setSaving(false);
    }
  };

  // Delete a zone permanently via DELETE
  const handleDelete = async (zone: DeliveryZone) => {
    const label = [zone.nameEn, zone.city, zone.township].filter(Boolean).join(" — ");
    if (!confirm(`Delete "${label}"? This cannot be undone.`)) return;
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
          onClick={() => { setShowAdd(!showAdd); setSuccess(""); }}
          className="px-4 py-2 bg-accent text-background rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
        >
          {showAdd ? "Close" : "+ Add Zone"}
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 mb-6 text-text-secondary text-sm">
        Add one entry per <strong>State + City + Township</strong> combination. You can add multiple cities and townships under the same state. Customers will only see locations you have set up here.
      </div>

      {/* Add zone form */}
      {showAdd && (
        <div className="bg-surface rounded-xl border border-border p-5 mb-6">
          <h3 className="text-text-primary font-semibold mb-4">Add Delivery Zone</h3>
          {/* State */}
          <div className="mb-4">
            <label className="text-text-muted text-xs block mb-1">State / Division *</label>
            <input
              type="text"
              value={newState}
              onChange={(e) => setNewState(e.target.value)}
              placeholder="e.g. Yangon Region"
              className={inputClass}
            />
          </div>
          {/* City and Township on same row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            <div>
              <label className="text-text-muted text-xs block mb-1">City *</label>
              <input
                type="text"
                value={newCity}
                onChange={(e) => setNewCity(e.target.value)}
                placeholder="e.g. Yangon"
                className={inputClass}
              />
            </div>
            <div>
              <label className="text-text-muted text-xs block mb-1">Township *</label>
              <input
                type="text"
                value={newTownship}
                onChange={(e) => setNewTownship(e.target.value)}
                placeholder="e.g. Latha"
                className={inputClass}
              />
            </div>
          </div>
          {/* Fees and ETA */}
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
          {/* Success message */}
          {success && (
            <div className="bg-success/10 border border-success/20 rounded-lg px-4 py-2 mb-4 text-success text-sm">
              {success}
            </div>
          )}
          <button
            onClick={handleCreate}
            disabled={saving || !newState.trim()}
            className="px-4 py-2 bg-accent text-background rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50"
          >
            {saving ? "Adding..." : "Add Zone"}
          </button>
        </div>
      )}

      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-error text-sm">
          {error}
        </div>
      )}

      {/* Zones grouped by state */}
      {Object.keys(groupedZones).length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          No delivery zones yet. Click &quot;+ Add Zone&quot; to create one.
        </div>
      ) : (
        <div className="space-y-6">
          {Object.entries(groupedZones).map(([stateName, stateZones]) => (
            <div key={stateName}>
              {/* State header */}
              <h2 className="text-text-primary font-semibold text-lg mb-3 flex items-center gap-2">
                {stateName}
                <span className="text-text-muted text-sm font-normal">
                  ({stateZones.length} {stateZones.length === 1 ? "zone" : "zones"})
                </span>
              </h2>

              {/* Zone entries table */}
              <div className="bg-surface rounded-xl border border-border overflow-hidden">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b border-border bg-surface-hover/30">
                      <th className="text-left text-text-muted font-medium px-4 py-2.5">City</th>
                      <th className="text-left text-text-muted font-medium px-4 py-2.5">Township</th>
                      <th className="text-right text-text-muted font-medium px-4 py-2.5">Base Fee</th>
                      <th className="text-right text-text-muted font-medium px-4 py-2.5">Per kg</th>
                      <th className="text-left text-text-muted font-medium px-4 py-2.5">ETA</th>
                      <th className="text-center text-text-muted font-medium px-4 py-2.5">Status</th>
                      <th className="text-right text-text-muted font-medium px-4 py-2.5">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {stateZones.map((zone) => (
                      editing === zone.id ? (
                        // Inline edit row
                        <tr key={zone.id} className="border-b border-border last:border-0 bg-accent/5">
                          <td colSpan={7} className="px-4 py-4">
                            <div className="space-y-3">
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-text-muted text-xs block mb-1">State</label>
                                  <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                  <label className="text-text-muted text-xs block mb-1">City</label>
                                  <input type="text" value={editCity} onChange={(e) => setEditCity(e.target.value)} className={inputClass} />
                                </div>
                                <div>
                                  <label className="text-text-muted text-xs block mb-1">Township</label>
                                  <input type="text" value={editTownship} onChange={(e) => setEditTownship(e.target.value)} className={inputClass} />
                                </div>
                              </div>
                              <div className="grid grid-cols-3 gap-3">
                                <div>
                                  <label className="text-text-muted text-xs block mb-1">Base Fee (MMK)</label>
                                  <input type="text" inputMode="numeric" value={editFee || ""} onChange={(e) => setEditFee(parseInt(e.target.value.replace(/\D/g, "")) || 0)} className={inputClass} />
                                </div>
                                <div>
                                  <label className="text-text-muted text-xs block mb-1">Per kg (MMK)</label>
                                  <input type="text" inputMode="numeric" value={editFeePerKg || ""} onChange={(e) => setEditFeePerKg(parseInt(e.target.value.replace(/\D/g, "")) || 0)} className={inputClass} />
                                </div>
                                <div>
                                  <label className="text-text-muted text-xs block mb-1">ETA</label>
                                  <input type="text" value={editEta} onChange={(e) => setEditEta(e.target.value)} className={inputClass} />
                                </div>
                              </div>
                              <div className="flex gap-2">
                                <button onClick={() => handleSave(zone)} disabled={saving} className="px-4 py-2 bg-accent text-background rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors disabled:opacity-50">
                                  {saving ? "Saving..." : "Save"}
                                </button>
                                <button onClick={() => setEditing(null)} className="px-4 py-2 text-text-secondary text-sm hover:text-text-primary transition-colors">
                                  Cancel
                                </button>
                              </div>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        // View row
                        <tr key={zone.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                          <td className="px-4 py-2.5 text-text-primary">{zone.city || "—"}</td>
                          <td className="px-4 py-2.5 text-text-primary">{zone.township || "—"}</td>
                          <td className="px-4 py-2.5 text-right text-accent font-medium">{formatPrice(zone.fee)}</td>
                          <td className="px-4 py-2.5 text-right text-text-secondary">{zone.feePerKg > 0 ? formatPrice(zone.feePerKg) : "—"}</td>
                          <td className="px-4 py-2.5 text-text-secondary">{zone.estimatedTime || "—"}</td>
                          <td className="px-4 py-2.5 text-center">
                            <button
                              onClick={() => toggleActive(zone)}
                              className={`text-xs font-medium px-2 py-0.5 rounded-full cursor-pointer hover:opacity-80
                                ${zone.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
                            >
                              {zone.isActive ? "Active" : "Off"}
                            </button>
                          </td>
                          <td className="px-4 py-2.5 text-right">
                            <div className="flex items-center justify-end gap-3">
                              <button onClick={() => startEdit(zone)} className="text-accent text-xs hover:underline">Edit</button>
                              <button onClick={() => handleDelete(zone)} className="text-error text-xs hover:underline">Delete</button>
                            </div>
                          </td>
                        </tr>
                      )
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
