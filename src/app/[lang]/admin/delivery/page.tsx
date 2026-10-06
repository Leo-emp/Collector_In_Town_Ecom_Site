// Admin Delivery Zones page — manage state/city/township delivery areas and fees
// Each zone = one state with multiple cities and townships (comma-separated in DB)
// Admin types a name, presses Enter to add it as a tag, can add as many as they want
"use client";

import { use, useState, useEffect, useCallback, useMemo, type KeyboardEvent } from "react";
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

// Parse comma-separated string into array of trimmed non-empty strings
function parseTags(str: string): string[] {
  return str ? str.split(",").map((s) => s.trim()).filter(Boolean) : [];
}

// Join array back to comma-separated string for DB storage
function joinTags(tags: string[]): string {
  return tags.join(",");
}

// Tag input component — type and press Enter to add tags
function TagInput({
  tags,
  onTagsChange,
  placeholder,
  disabled,
}: {
  tags: string[];
  onTagsChange: (tags: string[]) => void;
  placeholder: string;
  disabled?: boolean;
}) {
  const [input, setInput] = useState("");

  const handleKeyDown = (e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter") {
      e.preventDefault();
      const val = input.trim();
      if (val && !tags.includes(val)) {
        onTagsChange([...tags, val]);
      }
      setInput("");
    }
    // Backspace removes last tag when input is empty
    if (e.key === "Backspace" && !input && tags.length > 0) {
      onTagsChange(tags.slice(0, -1));
    }
  };

  const removeTag = (index: number) => {
    onTagsChange(tags.filter((_, i) => i !== index));
  };

  return (
    <div className="w-full bg-background border border-border rounded-lg px-2 py-1.5 focus-within:border-accent transition-colors min-h-[38px] flex flex-wrap gap-1.5 items-center">
      {tags.map((tag, i) => (
        <span
          key={`${tag}-${i}`}
          className="inline-flex items-center gap-1 bg-accent/10 text-accent text-xs font-medium px-2 py-1 rounded-md"
        >
          {tag}
          {!disabled && (
            <button
              type="button"
              onClick={() => removeTag(i)}
              className="text-accent/60 hover:text-accent ml-0.5"
            >
              ×
            </button>
          )}
        </span>
      ))}
      {!disabled && (
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={tags.length === 0 ? placeholder : "Type and press Enter"}
          className="flex-1 min-w-[120px] bg-transparent text-text-primary text-sm outline-none placeholder:text-text-muted py-0.5"
        />
      )}
    </div>
  );
}

export default function AdminDeliveryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const [zones, setZones] = useState<DeliveryZone[]>([]);
  const [editing, setEditing] = useState<string | null>(null);
  // Edit form state
  const [editName, setEditName] = useState("");
  const [editCities, setEditCities] = useState<string[]>([]);
  const [editTownships, setEditTownships] = useState<string[]>([]);
  const [editFee, setEditFee] = useState<number>(0);
  const [editFeePerKg, setEditFeePerKg] = useState<number>(0);
  const [editEta, setEditEta] = useState("");
  // Add zone form
  const [showAdd, setShowAdd] = useState(false);
  const [newState, setNewState] = useState("");
  const [newCities, setNewCities] = useState<string[]>([]);
  const [newTownships, setNewTownships] = useState<string[]>([]);
  const [newFee, setNewFee] = useState<number>(0);
  const [newFeePerKg, setNewFeePerKg] = useState<number>(0);
  const [newEta, setNewEta] = useState("");
  // UI state
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

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

  // Group zones by state for display
  const groupedZones = useMemo(() => {
    const groups: Record<string, DeliveryZone[]> = {};
    for (const zone of zones) {
      if (!groups[zone.nameEn]) groups[zone.nameEn] = [];
      groups[zone.nameEn].push(zone);
    }
    return groups;
  }, [zones]);

  const startEdit = (zone: DeliveryZone) => {
    setEditing(zone.id);
    setEditName(zone.nameEn);
    setEditCities(parseTags(zone.city));
    setEditTownships(parseTags(zone.township));
    setEditFee(zone.fee);
    setEditFeePerKg(zone.feePerKg || 0);
    setEditEta(zone.estimatedTime || "");
  };

  const handleSave = async (zone: DeliveryZone) => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zone.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name_en: editName,
          city: joinTags(editCities),
          township: joinTags(editTownships),
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

  const handleCreate = async () => {
    setSaving(true);
    setError("");
    try {
      const res = await fetch("/api/admin/delivery-zones", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          nameEn: newState.trim(),
          city: joinTags(newCities),
          township: joinTags(newTownships),
          fee: newFee,
          feePerKg: newFeePerKg,
          estimatedTime: newEta || null,
        }),
      });
      if (!res.ok) throw new Error("Failed to create zone");
      setShowAdd(false);
      setNewState("");
      setNewCities([]);
      setNewTownships([]);
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

  const handleDelete = async (zone: DeliveryZone) => {
    const label = zone.nameEn;
    if (!confirm(`Delete "${label}" zone? This cannot be undone.`)) return;
    setError("");
    try {
      const res = await fetch(`/api/admin/delivery-zones/${zone.id}`, { method: "DELETE" });
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
          {showAdd ? "Close" : "+ Add Zone"}
        </button>
      </div>

      {/* Info banner */}
      <div className="bg-accent/5 border border-accent/20 rounded-lg px-4 py-3 mb-6 text-text-secondary text-sm">
        Each zone has one <strong>State/Division</strong> with multiple <strong>Cities</strong> and <strong>Townships</strong>. Type a name and press <strong>Enter</strong> to add it. Customers can only checkout from locations set up here.
      </div>

      {/* Add zone form */}
      {showAdd && (
        <div className="bg-surface rounded-xl border border-border p-5 mb-6">
          <h3 className="text-text-primary font-semibold mb-4">Add Delivery Zone</h3>
          {/* State name */}
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
          {/* Cities — tag input */}
          <div className="mb-4">
            <label className="text-text-muted text-xs block mb-1">Cities (type and press Enter to add)</label>
            <TagInput
              tags={newCities}
              onTagsChange={setNewCities}
              placeholder="e.g. Yangon"
            />
          </div>
          {/* Townships — tag input */}
          <div className="mb-4">
            <label className="text-text-muted text-xs block mb-1">Townships (type and press Enter to add)</label>
            <TagInput
              tags={newTownships}
              onTagsChange={setNewTownships}
              placeholder="e.g. Latha"
            />
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
          <button
            onClick={handleCreate}
            disabled={saving}
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

      {/* Zones list */}
      {zones.length === 0 ? (
        <div className="text-center py-12 text-text-muted">
          No delivery zones yet. Click &quot;+ Add Zone&quot; to create one.
        </div>
      ) : (
        <div className="space-y-4">
          {zones.map((zone) => (
            <div key={zone.id} className="bg-surface rounded-xl border border-border p-5">
              {editing === zone.id ? (
                // Edit mode
                <div className="space-y-4">
                  <div>
                    <label className="text-text-muted text-xs block mb-1">State / Division</label>
                    <input type="text" value={editName} onChange={(e) => setEditName(e.target.value)} className={inputClass} />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1">Cities</label>
                    <TagInput tags={editCities} onTagsChange={setEditCities} placeholder="Type city and press Enter" />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1">Townships</label>
                    <TagInput tags={editTownships} onTagsChange={setEditTownships} placeholder="Type township and press Enter" />
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
              ) : (
                // View mode
                <div>
                  <div className="flex items-start justify-between mb-3">
                    <h3 className="text-text-primary font-semibold text-lg">{zone.nameEn}</h3>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => toggleActive(zone)}
                        className={`text-xs font-medium px-2.5 py-1 rounded-full cursor-pointer hover:opacity-80
                          ${zone.isActive ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}
                      >
                        {zone.isActive ? "Active" : "Inactive"}
                      </button>
                    </div>
                  </div>

                  {/* Cities tags */}
                  {zone.city && (
                    <div className="mb-2">
                      <span className="text-text-muted text-xs mr-2">Cities:</span>
                      <span className="flex flex-wrap gap-1.5 inline">
                        {parseTags(zone.city).map((c, i) => (
                          <span key={i} className="inline-block bg-accent/10 text-accent text-xs font-medium px-2 py-0.5 rounded-md">{c}</span>
                        ))}
                      </span>
                    </div>
                  )}

                  {/* Townships tags */}
                  {zone.township && (
                    <div className="mb-3">
                      <span className="text-text-muted text-xs mr-2">Townships:</span>
                      <span className="flex flex-wrap gap-1.5 inline">
                        {parseTags(zone.township).map((t, i) => (
                          <span key={i} className="inline-block bg-surface-hover text-text-secondary text-xs font-medium px-2 py-0.5 rounded-md">{t}</span>
                        ))}
                      </span>
                    </div>
                  )}

                  {/* Fee info */}
                  <div className="flex flex-wrap gap-4 text-sm mb-3">
                    <span><span className="text-text-muted">Fee:</span> <span className="text-accent font-medium">{formatPrice(zone.fee)}</span></span>
                    {zone.feePerKg > 0 && (
                      <span><span className="text-text-muted">Per kg:</span> <span className="text-accent font-medium">{formatPrice(zone.feePerKg)}</span></span>
                    )}
                    <span><span className="text-text-muted">ETA:</span> <span className="text-text-primary">{zone.estimatedTime || "—"}</span></span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-4">
                    <button onClick={() => startEdit(zone)} className="text-accent text-sm hover:underline">Edit</button>
                    <button onClick={() => handleDelete(zone)} className="text-error text-sm hover:underline">Delete</button>
                  </div>
                </div>
              )}
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
