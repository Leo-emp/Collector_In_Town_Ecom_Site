// Admin Product Edit/Create page — form wired to real API
// Client component — fetches product data and submits via API routes
// Photos can be selected during creation — they upload after the product is saved
"use client";

import { use, useState, useEffect, useCallback, useRef } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
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

// Pending file selected but not yet uploaded (for new products)
interface PendingFile {
  file: File;
  preview: string;
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
  const searchParams = useSearchParams();
  const isNew = id === "new";
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Pre-select brand from query param (e.g. /admin/products/new?brand=mini-gt)
  const preselectedBrand = searchParams.get("brand") || "";

  // Form state — pre-fill brand if coming from a brand-filtered view
  const [form, setForm] = useState({ ...EMPTY_FORM, brand: preselectedBrand });
  // Uploaded images (existing products only)
  const [images, setImages] = useState<ProductImage[]>([]);
  // Pending files queued for upload (new products — stored in memory until save)
  const [pendingFiles, setPendingFiles] = useState<PendingFile[]>([]);
  // UI state
  const [loading, setLoading] = useState(!isNew);
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState("");
  const [uploading, setUploading] = useState(false);

  const inputClass =
    "w-full bg-background border border-border rounded-lg px-3 py-2.5 text-text-primary text-sm placeholder:text-text-muted focus:outline-none focus:border-accent";

  // Clean up blob URLs when component unmounts
  useEffect(() => {
    return () => {
      pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

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

  // Upload files to a product by ID (used for both new and existing)
  const uploadFilesToProduct = async (productId: string, files: File[]) => {
    for (const file of files) {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch(`/api/admin/products/${productId}/images`, {
        method: "POST",
        body: formData,
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Upload failed");
      }
    }
  };

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

      // If creating, upload pending photos then redirect
      if (isNew) {
        const data = await res.json();
        const newProductId = data.product.id;

        // Upload any pending photos to the newly created product
        if (pendingFiles.length > 0) {
          setUploading(true);
          try {
            await uploadFilesToProduct(
              newProductId,
              pendingFiles.map((pf) => pf.file)
            );
          } catch (err) {
            setError(err instanceof Error ? err.message : "Some photos failed to upload");
          }
          // Clean up preview URLs
          pendingFiles.forEach((pf) => URL.revokeObjectURL(pf.preview));
          setPendingFiles([]);
          setUploading(false);
        }

        router.push(`/${lang}/admin/products/${newProductId}`);
      } else {
        setSaved(true);
        setTimeout(() => setSaved(false), 2000);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save");
    } finally {
      setSaving(false);
    }
  };

  // Handle selecting files — for new products, store in pending state with previews
  // For existing products, upload immediately
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    if (isNew) {
      // Store files locally with preview URLs — they'll upload on save
      const newPending: PendingFile[] = Array.from(files).map((file) => ({
        file,
        preview: URL.createObjectURL(file),
      }));
      setPendingFiles((prev) => [...prev, ...newPending]);
    } else {
      // Existing product — upload immediately
      setUploading(true);
      setError("");
      try {
        await uploadFilesToProduct(id, Array.from(files));
        await loadProduct();
      } catch (err) {
        setError(err instanceof Error ? err.message : "Upload failed");
      } finally {
        setUploading(false);
      }
    }

    // Reset input so same file can be re-selected
    e.target.value = "";
  };

  // Remove a pending file (before save)
  const removePendingFile = (index: number) => {
    setPendingFiles((prev) => {
      URL.revokeObjectURL(prev[index].preview);
      return prev.filter((_, i) => i !== index);
    });
  };

  // Handle image deletion (existing uploaded images)
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

  // Total photo count (uploaded + pending)
  const totalPhotos = images.length + pendingFiles.length;
  const maxPhotos = 6;

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
        {/* Product info */}
        <div className="bg-surface rounded-xl border border-border p-5 space-y-4">
          <h2 className="text-text-primary font-semibold text-sm">Product Information</h2>

          <div>
            <label className="text-text-secondary text-sm block mb-1.5">Product Name</label>
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
            <label className="text-text-secondary text-sm block mb-1.5">Description</label>
            <textarea
              value={form.description_en}
              onChange={(e) => setForm({ ...form, description_en: e.target.value })}
              className={`${inputClass} resize-none h-24`}
              placeholder="Product description..."
            />
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

        {/* Photos — works for both new and existing products */}
        <div className="bg-surface rounded-xl border border-border p-5">
          <div className="flex items-center justify-between mb-3">
            <h2 className="text-text-primary font-semibold text-sm">Photos</h2>
            <span className="text-text-muted text-xs">{totalPhotos}/{maxPhotos}</span>
          </div>

          {/* Show uploaded images (existing product) */}
          {images.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {images.map((img) => (
                <div key={img.id} className="relative group rounded-lg overflow-hidden border border-border aspect-square">
                  <img
                    src={img.url}
                    alt="Product"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => handleDeleteImage(img.id)}
                    className="absolute top-1 right-1 w-7 h-7 bg-error/80 text-white rounded-full text-sm
                               flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                </div>
              ))}
            </div>
          )}

          {/* Show pending file previews (new product — not yet uploaded) */}
          {pendingFiles.length > 0 && (
            <div className="grid grid-cols-3 gap-3 mb-4">
              {pendingFiles.map((pf, idx) => (
                <div key={idx} className="relative group rounded-lg overflow-hidden border border-accent/30 aspect-square">
                  <img
                    src={pf.preview}
                    alt="Preview"
                    className="w-full h-full object-cover"
                  />
                  <button
                    type="button"
                    onClick={() => removePendingFile(idx)}
                    className="absolute top-1 right-1 w-7 h-7 bg-error/80 text-white rounded-full text-sm
                               flex items-center justify-center md:opacity-0 md:group-hover:opacity-100 transition-opacity"
                  >
                    &times;
                  </button>
                  <div className="absolute bottom-0 left-0 right-0 bg-accent/80 text-background text-[10px] text-center py-0.5">
                    Pending
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Upload area — always available */}
          {totalPhotos < maxPhotos && (
            <>
              <input
                ref={fileInputRef}
                type="file"
                accept="image/jpeg,image/png,image/webp"
                multiple
                onChange={handleFileSelect}
                className="hidden"
                disabled={uploading}
              />
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                disabled={uploading}
                className="w-full border-2 border-dashed border-border rounded-lg p-6 text-center
                           hover:border-accent/50 active:border-accent transition-colors
                           disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <svg className="w-10 h-10 text-text-muted/30 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                    d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="text-accent text-sm font-medium">
                  {uploading ? "Uploading..." : "Tap to choose photos"}
                </p>
                <p className="text-text-muted text-xs mt-1">JPEG, PNG, or WebP — max 5MB each</p>
              </button>
            </>
          )}
        </div>

        {/* Save button */}
        <div className="flex items-center gap-4">
          <button
            type="submit"
            disabled={saving || uploading}
            className={`px-8 py-3 rounded-lg font-semibold text-sm transition-colors
              ${saved ? "bg-success text-white" : "bg-accent text-background hover:bg-accent-hover"}
              ${saving || uploading ? "opacity-50 cursor-not-allowed" : ""}`}
          >
            {saving
              ? uploading
                ? "Uploading photos..."
                : "Creating..."
              : saved
                ? "Saved!"
                : isNew
                  ? pendingFiles.length > 0
                    ? `Create Product & Upload ${pendingFiles.length} Photo${pendingFiles.length > 1 ? "s" : ""}`
                    : "Create Product"
                  : "Save Changes"}
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
