// Admin Delivery Zones page — manage delivery zones and fees
"use client";

import { use, useState } from "react";
import { formatPrice } from "@/lib/format";

const ZONES = [
  { id: "1", name_en: "Yangon", name_my: "ရန်ကုန်", fee: 2000, eta: "1-2 days", active: true },
  { id: "2", name_en: "Mandalay", name_my: "မန္တလေး", fee: 3500, eta: "2-3 days", active: true },
  { id: "3", name_en: "Naypyidaw", name_my: "နေပြည်တော်", fee: 3000, eta: "2-3 days", active: true },
  { id: "4", name_en: "Other Regions", name_my: "အခြားဒေသများ", fee: 5000, eta: "3-5 days", active: true },
];

export default function AdminDeliveryPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const [zones, setZones] = useState(ZONES);
  const [editing, setEditing] = useState<string | null>(null);

  return (
    <div>
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-text-primary mb-6">Delivery Zones</h1>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {zones.map((zone) => (
          <div key={zone.id} className="bg-surface rounded-xl border border-border p-5">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-text-primary font-semibold">{zone.name_en}</h3>
                <p className="text-text-muted text-sm">{zone.name_my}</p>
              </div>
              <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${zone.active ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                {zone.active ? "Active" : "Inactive"}
              </span>
            </div>

            {editing === zone.id ? (
              // Edit mode
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-text-muted text-xs block mb-1">Fee (MMK)</label>
                    <input
                      type="number"
                      defaultValue={zone.fee}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                  <div>
                    <label className="text-text-muted text-xs block mb-1">ETA</label>
                    <input
                      type="text"
                      defaultValue={zone.eta}
                      className="w-full bg-background border border-border rounded-lg px-3 py-2 text-text-primary text-sm focus:outline-none focus:border-accent"
                    />
                  </div>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => setEditing(null)}
                    className="px-4 py-2 bg-accent text-background rounded-lg text-sm font-medium hover:bg-accent-hover transition-colors"
                  >
                    Save
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
              // View mode
              <div>
                <div className="flex justify-between text-sm mb-3">
                  <span className="text-text-muted">Delivery Fee</span>
                  <span className="text-accent font-medium">{formatPrice(zone.fee)}</span>
                </div>
                <div className="flex justify-between text-sm mb-4">
                  <span className="text-text-muted">Estimated Delivery</span>
                  <span className="text-text-primary">{zone.eta}</span>
                </div>
                <button
                  onClick={() => setEditing(zone.id)}
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
