// Pagination — numbered page navigation for catalog grids
// Client component for URL-based navigation
"use client";

import { useSearchParams, usePathname } from "next/navigation";
import Link from "next/link";

interface PaginationProps {
  totalPages: number;
  currentPage: number;
}

export function Pagination({ totalPages, currentPage }: PaginationProps) {
  const pathname = usePathname();
  const searchParams = useSearchParams();

  // Don't render if only 1 page
  if (totalPages <= 1) return null;

  // Build URL for a specific page
  const getPageUrl = (page: number) => {
    const params = new URLSearchParams(searchParams.toString());
    if (page > 1) {
      params.set("page", page.toString());
    } else {
      params.delete("page");
    }
    const query = params.toString();
    return query ? `${pathname}?${query}` : pathname;
  };

  // Generate page numbers to display — show at most 5 pages around current
  const pages: number[] = [];
  const start = Math.max(1, currentPage - 2);
  const end = Math.min(totalPages, currentPage + 2);
  for (let i = start; i <= end; i++) {
    pages.push(i);
  }

  return (
    <nav className="flex items-center justify-center gap-1.5 mt-12" aria-label="Pagination">
      {/* Previous button */}
      {currentPage > 1 ? (
        <Link
          href={getPageUrl(currentPage - 1)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary
                     hover:bg-surface-hover transition-colors"
          aria-label="Previous page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </Link>
      ) : (
        <span className="p-2 text-text-muted/30">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
          </svg>
        </span>
      )}

      {/* First page + ellipsis if needed */}
      {start > 1 && (
        <>
          <Link
            href={getPageUrl(1)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm
                       text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            1
          </Link>
          {start > 2 && (
            <span className="w-9 h-9 flex items-center justify-center text-text-muted text-sm">
              ...
            </span>
          )}
        </>
      )}

      {/* Page numbers */}
      {pages.map((page) => (
        <Link
          key={page}
          href={getPageUrl(page)}
          className={`w-9 h-9 flex items-center justify-center rounded-lg text-sm font-medium transition-colors
            ${page === currentPage
              ? "bg-accent text-background"
              : "text-text-secondary hover:text-text-primary hover:bg-surface-hover"
            }`}
          aria-current={page === currentPage ? "page" : undefined}
        >
          {page}
        </Link>
      ))}

      {/* Last page + ellipsis if needed */}
      {end < totalPages && (
        <>
          {end < totalPages - 1 && (
            <span className="w-9 h-9 flex items-center justify-center text-text-muted text-sm">
              ...
            </span>
          )}
          <Link
            href={getPageUrl(totalPages)}
            className="w-9 h-9 flex items-center justify-center rounded-lg text-sm
                       text-text-secondary hover:text-text-primary hover:bg-surface-hover transition-colors"
          >
            {totalPages}
          </Link>
        </>
      )}

      {/* Next button */}
      {currentPage < totalPages ? (
        <Link
          href={getPageUrl(currentPage + 1)}
          className="p-2 rounded-lg text-text-secondary hover:text-text-primary
                     hover:bg-surface-hover transition-colors"
          aria-label="Next page"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </Link>
      ) : (
        <span className="p-2 text-text-muted/30">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
          </svg>
        </span>
      )}
    </nav>
  );
}
