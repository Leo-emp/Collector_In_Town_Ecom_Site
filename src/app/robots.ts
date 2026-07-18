// Robots.txt for search engine crawlers
import type { MetadataRoute } from "next";

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || "https://collectorintown.com";

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: "*",
        allow: "/",
        disallow: ["/admin/", "/api/", "/checkout", "/cart"],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
