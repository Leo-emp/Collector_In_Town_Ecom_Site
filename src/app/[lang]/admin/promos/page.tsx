// Admin Promo Codes page — manage discount codes
"use client";

import { use, useState } from "react";

const PROMOS = [
  { id: "1", code: "WELCOME10", discount_type: "percentage", discount_value: 10, min_order: 30000, uses: 45, max_uses: 100, active: true, expires: "2026-08-31" },
  { id: "2", code: "COLLECTOR20", discount_type: "percentage", discount_value: 20, min_order: 80000, uses: 12, max_uses: 50, active: true, expires: "2026-09-15" },
  { id: "3", code: "FLAT5K", discount_type: "fixed", discount_value: 5000, min_order: 50000, uses: 30, max_uses: 30, active: false, expires: "2026-07-01" },
];

export default function AdminPromosPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const [showForm, setShowForm] = useState(false);

  return (
    <div>
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-text-primary">Promo Codes</h1>
        <button
          onClick={() => setShowForm(!showForm)}
          className="px-4 py-2.5 bg-accent text-background rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors"
        >
          {showForm ? "Cancel" : "+ Add Promo"}
        </button>
      </div>

      {/* Add promo form */}
      {showForm && (
        <div className="bg-surface rounded-xl border border-border p-5 mb-6 space-y-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Code</label>
              <input type="text" placeholder="SAVE10" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Type</label>
              <select className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent">
                <option value="percentage">Percentage (%)</option>
                <option value="fixed">Fixed Amount (Ks)</option>
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Value</label>
              <input type="number" placeholder="10" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Max Uses</label>
              <input type="number" placeholder="100" className="w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent" />
            </div>
          </div>
          <button className="px-6 py-2.5 bg-accent text-background rounded-lg font-semibold text-sm hover:bg-accent-hover transition-colors">
            Create Promo Code
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
              </tr>
            </thead>
            <tbody>
              {PROMOS.map((promo) => (
                <tr key={promo.id} className="border-b border-border last:border-0 hover:bg-surface-hover/50 transition-colors">
                  <td className="px-5 py-3">
                    <span className="bg-accent/10 text-accent font-mono text-xs px-2 py-1 rounded">{promo.code}</span>
                  </td>
                  <td className="px-5 py-3 text-text-primary">
                    {promo.discount_type === "percentage" ? `${promo.discount_value}%` : `${promo.discount_value.toLocaleString()} Ks`}
                    <span className="text-text-muted text-xs ml-1">(min {promo.min_order.toLocaleString()} Ks)</span>
                  </td>
                  <td className="px-5 py-3 text-center text-text-secondary">
                    {promo.uses}/{promo.max_uses}
                  </td>
                  <td className="px-5 py-3 text-center">
                    <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${promo.active ? "bg-success/10 text-success" : "bg-error/10 text-error"}`}>
                      {promo.active ? "Active" : "Expired"}
                    </span>
                  </td>
                  <td className="px-5 py-3 text-right text-text-muted">{promo.expires}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
