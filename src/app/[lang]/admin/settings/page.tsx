// Admin Settings page — site-wide configuration
"use client";

import { use, useState } from "react";

export default function AdminSettingsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params);
  const [saved, setSaved] = useState(false);

  const [settings, setSettings] = useState({
    store_name: "Collector In Town",
    store_email: "hello@collectorintown.com",
    store_phone: "09-xxx-xxx-xxx",
    currency: "MMK",
    default_locale: "en",
    maintenance_mode: false,
  });

  const inputClass = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm focus:outline-none focus:border-accent";

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-2xl">
      <h1 className="font-[family-name:var(--font-playfair)] text-2xl text-text-primary mb-6">Settings</h1>

      <div className="space-y-6">
        {/* Store info */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-text-primary font-semibold text-sm">Store Information</h2>
          <div>
            <label className="text-text-secondary text-sm block mb-1.5">Store Name</label>
            <input type="text" value={settings.store_name} onChange={(e) => setSettings({ ...settings, store_name: e.target.value })} className={inputClass} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Email</label>
              <input type="email" value={settings.store_email} onChange={(e) => setSettings({ ...settings, store_email: e.target.value })} className={inputClass} />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Phone</label>
              <input type="tel" value={settings.store_phone} onChange={(e) => setSettings({ ...settings, store_phone: e.target.value })} className={inputClass} />
            </div>
          </div>
        </div>

        {/* Locale + currency */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-text-primary font-semibold text-sm">Locale & Currency</h2>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Default Language</label>
              <select value={settings.default_locale} onChange={(e) => setSettings({ ...settings, default_locale: e.target.value })} className={inputClass}>
                <option value="en">English</option>
                <option value="my">Myanmar (Burmese)</option>
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Currency</label>
              <select value={settings.currency} className={inputClass} disabled>
                <option value="MMK">Myanmar Kyat (MMK)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Maintenance */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-text-primary font-semibold text-sm">Maintenance Mode</h2>
              <p className="text-text-muted text-xs mt-1">When enabled, customers see a maintenance page</p>
            </div>
            <button
              onClick={() => setSettings({ ...settings, maintenance_mode: !settings.maintenance_mode })}
              className={`w-12 h-6 rounded-full transition-colors relative ${settings.maintenance_mode ? "bg-error" : "bg-border"}`}
            >
              <span className={`absolute top-0.5 w-5 h-5 rounded-full bg-white transition-transform ${settings.maintenance_mode ? "left-6" : "left-0.5"}`} />
            </button>
          </div>
        </div>

        <button
          onClick={handleSave}
          className={`px-8 py-3 rounded-lg font-semibold text-sm transition-colors ${saved ? "bg-success text-white" : "bg-accent text-background hover:bg-accent-hover"}`}
        >
          {saved ? "Saved!" : "Save Settings"}
        </button>
      </div>
    </div>
  );
}
