// PhotoGallery — product image viewer with thumbnail strip
// Shows main image + clickable thumbnails (up to 6 photos)
"use client";

import { useState } from "react";

interface PhotoGalleryProps {
  photos: string[];
  productName: string;
}

export function PhotoGallery({ photos, productName }: PhotoGalleryProps) {
  const [activeIndex, setActiveIndex] = useState(0);

  // If no photos, show placeholder
  if (photos.length === 0) {
    return (
      <div className="aspect-square bg-surface rounded-xl border border-border
                      flex items-center justify-center">
        <svg className="w-24 h-24 text-text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
            d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
        </svg>
      </div>
    );
  }

  return (
    <div>
      {/* Main image */}
      <div className="aspect-square bg-surface rounded-xl border border-border overflow-hidden mb-3">
        <img
          src={photos[activeIndex]}
          alt={`${productName} - Photo ${activeIndex + 1}`}
          className="w-full h-full object-cover"
        />
      </div>

      {/* Thumbnail strip — only shown if multiple photos */}
      {photos.length > 1 && (
        <div className="flex gap-2 overflow-x-auto scrollbar-hide">
          {photos.map((photo, i) => (
            <button
              key={i}
              onClick={() => setActiveIndex(i)}
              className={`flex-shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 transition-colors
                ${i === activeIndex ? "border-accent" : "border-border hover:border-accent/50"}`}
            >
              <img
                src={photo}
                alt={`${productName} thumbnail ${i + 1}`}
                className="w-full h-full object-cover"
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
