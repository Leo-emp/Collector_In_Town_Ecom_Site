// Dynamic sitemap for search engine crawlers
// Generates URLs for all public pages in both locales
import type { MetadataRoute } from "next";
import { BRAND_SLUGS } from "@/lib/constants";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://collectorintown.com";

export default function sitemap(): MetadataRoute.Sitemap {
  const locales = ["en", "my"];
  const now = new Date();

  const urls: MetadataRoute.Sitemap = [];

  // Static pages per locale
  const staticPages = [
    { path: "", priority: 1.0, changeFrequency: "daily" as const },
    { path: "/products/new-arrivals", priority: 0.9, changeFrequency: "daily" as const },
    { path: "/about", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/contact", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/faq", priority: 0.5, changeFrequency: "monthly" as const },
    { path: "/privacy", priority: 0.3, changeFrequency: "yearly" as const },
    { path: "/terms", priority: 0.3, changeFrequency: "yearly" as const },
  ];

  for (const locale of locales) {
    // Static pages
    for (const page of staticPages) {
      urls.push({
        url: `${BASE_URL}/${locale}${page.path}`,
        lastModified: now,
        changeFrequency: page.changeFrequency,
        priority: page.priority,
      });
    }

    // Brand catalog pages
    for (const brand of BRAND_SLUGS) {
      urls.push({
        url: `${BASE_URL}/${locale}/products/${brand}`,
        lastModified: now,
        changeFrequency: "daily",
        priority: 0.8,
      });
    }
  }

  return urls;
}
