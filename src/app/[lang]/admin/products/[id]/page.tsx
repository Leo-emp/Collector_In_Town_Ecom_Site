// Admin Product Edit/Create page — form for adding or editing products
// Will connect to Supabase for real CRUD operations
"use client";

import { use, useState } from "react";
import Link from "next/link";
import { BRANDS } from "@/lib/constants";

// Placeholder product for edit mode
const MOCK_PRODUCT = {
  name_en: "Nissan GT-R R35 Liberty Walk",
  name_my: "နစ်ဆန် GT-R R35 Liberty Walk",
  description_en: "Mini GT 1:64 scale Nissan GT-R R35 with Liberty Walk body kit.",
  description_my: "Mini GT 1:64 စကေး နစ်ဆန် GT-R R35 Liberty Walk",
  brand: "mini-gt",
  scale: "1:64",
  price: 45000,
  stock_count: 15,
  status: "active",
};

export default function AdminProductEditPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = use(params);
  const isNew = id === "new";

  // Form state — pre-filled for edit, empty for new
  const [form, setForm] = useState(
    isNew
      ? { name_en: "", name_my: "", description_en: "", description_my: "", brand: "", scale: "1:64", price: 0, stock_count: 0, status: "active" }
      : MOCK_PRODUCT
  );

  const [saved, setSaved] = useState(false);

  const inputClass = "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent";

  // Handle save (placeholder — will call Supabase)
  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    setSaved(true);
    setTimeout(() => setSaved(false), 2000);
  };

  return (
    <div className="max-w-3xl">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <h1 className="font-[family-name:var(--font-cinzel)] text-2xl text-text-primary">
          {isNew ? "Add Product" : "Edit Product"}
        </h1>
        <Link
          href={`/${lang}/admin/products`}
          className="text-text-secondary text-sm hover:text-text-primary transition-colors"
        >
          &larr; Back to Products
        </Link>
      </div>

      <form onSubmit={handleSave} className="space-y-6">
        {/* Product names */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-text-primary font-semibold text-sm">Product Information</h2>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Name (English)</label>
              <input
                type="text"
                value={form.name_en}
                onChange={(e) => setForm({ ...form, name_en: e.target.value })}
                className={inputClass}
                placeholder="Nissan GT-R R35 Liberty Walk"
                required
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Name (Burmese)</label>
              <input
                type="text"
                value={form.name_my}
                onChange={(e) => setForm({ ...form, name_my: e.target.value })}
                className={inputClass}
                placeholder="နစ်ဆန် GT-R R35"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Description (English)</label>
              <textarea
                value={form.description_en}
                onChange={(e) => setForm({ ...form, description_en: e.target.value })}
                className={`${inputClass} resize-none h-24`}
                placeholder="Product description..."
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Description (Burmese)</label>
              <textarea
                value={form.description_my}
                onChange={(e) => setForm({ ...form, description_my: e.target.value })}
                className={`${inputClass} resize-none h-24`}
                placeholder="ကုန်ပစ္စည်း ဖော်ပြချက်..."
              />
            </div>
          </div>
        </div>

        {/* Specs + pricing */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-text-primary font-semibold text-sm">Specs & Pricing</h2>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Brand</label>
              <select
                value={form.brand}
                onChange={(e) => setForm({ ...form, brand: e.target.value })}
                className={inputClass}
                required
              >
                <option value="">Select brand</option>
                {BRANDS.map((b) => (
                  <option key={b.slug} value={b.slug}>{b.name}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Scale</label>
              <select
                value={form.scale}
                onChange={(e) => setForm({ ...form, scale: e.target.value })}
                className={inputClass}
              >
                <option value="1:64">1:64</option>
                <option value="1:43">1:43</option>
                <option value="1:32">1:32</option>
                <option value="1:24">1:24</option>
                <option value="1:18">1:18</option>
              </select>
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Price (MMK)</label>
              <input
                type="number"
                value={form.price}
                onChange={(e) => setForm({ ...form, price: parseInt(e.target.value) || 0 })}
                className={inputClass}
                min={0}
                required
              />
            </div>
            <div>
              <label className="text-text-secondary text-sm block mb-1.5">Stock Count</label>
              <input
                type="number"
                value={form.stock_count}
                onChange={(e) => setForm({ ...form, stock_count: parseInt(e.target.value) || 0 })}
                className={inputClass}
                min={0}
                required
              />
            </div>
          </div>

          <div>
            <label className="text-text-secondary text-sm block mb-1.5">Status</label>
            <select
              value={form.status}
              onChange={(e) => setForm({ ...form, status: e.target.value })}
              className={`${inputClass} max-w-xs`}
            >
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="sold_out">Sold Out</option>
              <option value="discontinued">Discontinued</option>
            </select>
          </div>
        </div>

        {/* Photos placeholder */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-text-primary font-semibold text-sm mb-3">Photos</h2>
          <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
            <svg className="w-10 h-10 text-text-muted/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
            </svg>
            <p className="text-text-muted text-sm">Drop photos here or click to upload</p>
            <p className="text-text-muted text-xs mt-1">Up to 6 photos, max 5MB each</p>
          </div>
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            className={`px-8 py-3 rounded-lg font-semibold text-sm transition-colors
              ${saved ? "bg-success text-white" : "bg-accent text-background hover:bg-accent-hover"}`}
          >
            {saved ? "Saved!" : isNew ? "Create Product" : "Save Changes"}
          </button>
          <Link
            href={`/${lang}/admin/products`}
            className="text-text-secondary text-sm hover:text-text-primary"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
