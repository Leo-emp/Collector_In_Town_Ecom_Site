// Admin Product Edit/Create page — form wired to real API
// Client component — fetches product data and submits via API routes
"use client";

import { use, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { BRANDS } from "@/lib/constants";

// Shape of product data from the API
interface ProductImage {
  id: string;
  url: string;
  displayOrder: number;
}

interface ProductData {
  id: string;
  nameEn: string;
  nameMy: string | null;
  descriptionEn: string | null;
  descriptionMy: string | null;
  brand: string;
  scale: string;
  price: number;
  stockCount: number;
  status: string;
}

// Empty form for creating a new product
const EMPTY_FORM = {
  name_en: "",
  name_my: "",
  description_en: "",
  description_my: "",
  brand: "",
  scale: "1:64",
  price: 0,
  stock_count: 0,
  status: "active",
};

export default function AdminProductEditPage({
  params,
}: {
  params: Promise<{ lang: string; id: string }>;
}) {
  const { lang, id } = use(params);
  const router = useRouter();
  const isNew = id === "new";

  // Form state
  const [form, setForm] = useState(EMPTY_FORM);
  // Product images (only for existing products)
  const [images, setImages] = useState<ProductImage[]>([]);
  // UI state
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent";

  // Load existing product data when editing
  const loadProduct = useCallback(async () => {
    if (isNew) return;
    try {
      // Fetch all products and find this one by ID
      const res = await fetch("/api/admin/products");
      if (!res.ok) throw new Error("Failed to load products");
      const data = await res.json();
      const product = data.products?.find((p: ProductData) => p.id === id);
      if (!product) {
        setError("Product not found");
        return;
      }
      // Map DB field names to form field names
      setForm({
        name_en: product.nameEn || "",
        name_my: product.nameMy || "",
        description_en: product.descriptionEn || "",
        description_my: product.descriptionMy || "",
        brand: product.brand || "",
        scale: product.scale || "1:64",
        price: product.price || 0,
        stock_count: product.stockCount || 0,
        status: product.status || "active",
      });
      // Set images if available
      setImages(product.images || []);
    } catch {
      setError("Failed to load product");
    } finally {
      setLoading(false);
    }
  }, [id, isNew]);

  useEffect(() => {
    loadProduct();
  }, [loadProduct]);

  // Handle form submission — create or update
  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setError("");

    try {
      const url = isNew ? "/api/admin/products" : `/api/admin/products/${id}`;
      const method = isNew ? "POST" : "PUT";

      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Failed to save");
      }

      setSaved(true);
      setTimeout(() => setSaved(false), 2000);

      // If creating, redirect to edit page for the new product
      if (isNew) {
        const data = await res.json();
        router.push(`/${lang}/admin/products/${data.product.id}`);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Handle image upload via Vercel Blob
  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    setUploading(true);
    setError("");

    try {
      // Upload each file individually
      for (const file of Array.from(files)) {
        const formData = new FormData();
        formData.append("file", file);

        const res = await fetch(`/api/admin/products/${id}/images`, {
          method: "POST",
          body: formData,
        });

        if (!res.ok) {
          const data = await res.json();
          throw new Error(data.error || "Upload failed");
        }
      }
      // Reload product to get updated images
      await loadProduct();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Upload failed");
    } finally {
      setUploading(false);
      // Reset file input so same file can be re-uploaded
      e.target.value = "";
    }
  };

  // Handle image deletion
  const handleDeleteImage = async (imageId: string) => {
    try {
      const res = await fetch(`/api/admin/products/${id}/images/${imageId}`, {
        method: "DELETE",
      });
      if (!res.ok) throw new Error("Failed to delete image");
      // Remove from local state immediately
      setImages((prev) => prev.filter((img) => img.id !== imageId));
    } catch {
      setError("Failed to delete image");
    }
  };

  // Show loading spinner while fetching existing product
  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <div className="w-8 h-8 border-2 border-accent border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

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

      {/* Error banner */}
      {error && (
        <div className="bg-error/10 border border-error/20 rounded-lg px-4 py-3 mb-6 text-error text-sm">
          {error}
        </div>
      )}

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

        {/* Photos — upload UI for existing products, placeholder for new */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <h2 className="text-text-primary font-semibold text-sm mb-3">Photos</h2>

          {/* Show existing images */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                  <img
                    src={img.url}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                  {/* Delete button overlay */}
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 w-6 h-6 bg-error/80 text-white rounded-full text-xs
                               opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Upload area — only available for existing products (need an ID for the URL) */}
          {isNew ? (
            <div className="border-2 border-dashed border-border rounded-lg p-8 text-center">
              <p className="text-text-muted text-sm">Save the product first, then upload photos</p>
            </div>
          ) : (
            <label className="border-2 border-dashed border-border rounded-lg p-8 text-center block cursor-pointer hover:border-accent/50 transition-colors">
              <input
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleImageUpload}
                className="hidden"
                disabled={uploading}
              />
              <svg className="w-10 h-10 text-text-muted/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                  d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
              <p className="text-text-muted text-sm">
                {uploading ? "Uploading..." : "Click to upload photos"}
              </p>
              <p className="text-text-muted text-xs mt-1">JPEG, PNG, or WebP — max 5MB each, up to 6 total</p>
            </label>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving}
            className={`px-8 py-3 rounded-lg font-semibold text-sm transition-colors
              ${saved ? "bg-success text-white" : "bg-accent text-background hover:bg-accent-hover"}
              ${saving ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving ? "Saving..." : saved ? "Saved!" : isNew ? "Create Product" : "Save Changes"}
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
