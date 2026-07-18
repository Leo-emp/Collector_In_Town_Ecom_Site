// CatalogToolbar — search bar + sort dropdown for catalog pages
// Client component because it uses URL search params for state
"use client";

import { useRouter, useSearchParams, usePathname } from "next/navigation";
import { useCallback } from "react";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface CatalogToolbarProps {
  dict: Dictionary;
}

export function CatalogToolbar({ dict }: CatalogToolbarProps) {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Current values from URL
  const currentSort = searchParams.get("sort") || "newest";
  const currentSearch = searchParams.get("q") || "";

  // Update URL search params without full page reload
  const updateParams = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value) {
        params.set(key, value);
      } else {
        params.delete(key);
      }
      // Reset to page 1 when changing sort or search
      params.delete("page");
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-col sm:flex-row gap-3 mb-8">
      {/* Search bar */}
      <div className="relative flex-1">
        {/* Search icon */}
        <svg
          className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-text-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2}
            d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
        </svg>
        <input
          type="text"
          defaultValue={currentSearch}
          placeholder={dict.nav.search}
          onChange={(e) => updateParams("q", e.target.value)}
          className="w-full pl-10 pr-4 py-2.5 bg-surface border border-border rounded-lg
                     text-text-primary text-sm placeholder:text-text-muted
                     focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                     transition-colors"
        />
      </div>

      {/* Sort dropdown */}
      <select
        value={currentSort}
        onChange={(e) => updateParams("sort", e.target.value)}
        className="px-4 py-2.5 bg-surface border border-border rounded-lg
                   text-text-primary text-sm appearance-none cursor-pointer
                   focus:outline-none focus:ring-2 focus:ring-accent/50 focus:border-accent
                   transition-colors min-w-[180px]"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%23737373'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'/%3E%3C/svg%3E")`,
          backgroundRepeat: "no-repeat",
          backgroundPosition: "right 12px center",
          backgroundSize: "16px",
        }}
      >
        <option value="newest">{dict.product.sortNewest}</option>
        <option value="price-asc">{dict.product.sortPriceLow}</option>
        <option value="price-desc">{dict.product.sortPriceHigh}</option>
        <option value="name">{dict.product.sortName}</option>
      </select>
    </div>
  );
}
