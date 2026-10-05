// Dynamic sitemap for search engine crawlers
// Generates URLs for all public pages + individual product pages
import type { MetadataRoute } from "next";
import { BRAND_SLUGS } from "@/lib/constants";
import { db } from "@/lib/drizzle";
import { products } from "@/lib/schema";
import { eq, or } from "drizzle-orm";

const BASE_URL = "https://www.collectorintown.com";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const urls: MetadataRoute.Sitemap = [];

  // Homepage
  urls.push({
    url: `${BASE_URL}/en`,
    lastModified: now,
    changeFrequency: "daily",
    priority: 1.0,
  });

  // Static pages
  const staticPages = [
    { path: "/products/new-arrivals", priority: 0.9, freq: "daily" as const },
    { path: "/about", priority: 0.5, freq: "monthly" as const },
    { path: "/contact", priority: 0.5, freq: "monthly" as const },
    { path: "/faq", priority: 0.5, freq: "monthly" as const },
  ];

  for (const page of staticPages) {
    urls.push({
      url: `${BASE_URL}/en${page.path}`,
      lastModified: now,
      changeFrequency: page.freq,
      priority: page.priority,
    });
  }

  // Brand catalog pages
  for (const brand of BRAND_SLUGS) {
    urls.push({
      url: `${BASE_URL}/en/products/${brand}`,
      lastModified: now,
      changeFrequency: "daily",
      priority: 0.8,
    });
  }

  // Individual product pages — each product gets its own URL for Google
  const allProducts = await db
    .select({ slug: products.slug, brand: products.brand, updatedAt: products.updatedAt })
    .from(products)
    .where(or(eq(products.status, "active"), eq(products.status, "sold_out")));

  for (const p of allProducts) {
    urls.push({
      url: `${BASE_URL}/en/products/${p.brand}/${p.slug}`,
      lastModified: p.updatedAt ? new Date(p.updatedAt) : now,
      changeFrequency: "weekly",
      priority: 0.7,
    });
  }

  return urls;
}
