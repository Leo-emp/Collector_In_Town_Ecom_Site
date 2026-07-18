// ProductCard — single product tile for catalog grids
// Shows product image, brand, name, price, and stock status
import Link from "next/link";
import { formatPrice } from "@/lib/format";
import type { Dictionary } from "@/app/[lang]/dictionaries";

interface ProductCardProps {
  product: {
    id: string;
    name_en: string;
    name_my: string;
    slug: string;
    brand: string;
    price: number;
    photos: string[];
    stock_count: number;
    status: string;
  };
  lang: string;
  dict: Dictionary;
}

export function ProductCard({ product, lang, dict }: ProductCardProps) {
  // Determine display name based on locale
  const name = lang === "my" ? product.name_my : product.name_en;

  // Stock status — we don't show the actual count, just in-stock or sold out
  const isInStock = product.stock_count > 0 && product.status === "active";

  return (
    <Link
      href={`/${lang}/products/${product.brand}/${product.slug}`}
      className="group block"
    >
      {/* Product image — aspect-square container */}
      <div className="aspect-square bg-surface rounded-xl overflow-hidden mb-3
                      border border-border group-hover:border-accent/30 transition-colors relative">
        {product.photos.length > 0 ? (
          // Real product image
          <img
            src={product.photos[0]}
            alt={name}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            loading="lazy"
          />
        ) : (
          // Placeholder — car icon
          <div className="w-full h-full flex items-center justify-center">
            <svg className="w-16 h-16 text-text-muted/20" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M9 17a2 2 0 11-4 0 2 2 0 014 0zM19 17a2 2 0 11-4 0 2 2 0 014 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1}
                d="M13 16V6a1 1 0 00-1-1H4a1 1 0 00-1 1v10a1 1 0 001 1h1m8-1a1 1 0 01-1 1H9m4-1V8a1 1 0 011-1h2.586a1 1 0 01.707.293l3.414 3.414a1 1 0 01.293.707V16a1 1 0 01-1 1h-1m-6-1a1 1 0 001 1h1M5 17a2 2 0 104 0m-4 0a2 2 0 114 0m6 0a2 2 0 104 0m-4 0a2 2 0 114 0" />
            </svg>
          </div>
        )}

        {/* Stock badge — top-right corner */}
        <span
          className={`absolute top-2 right-2 text-xs font-medium px-2 py-1 rounded-md
            ${isInStock
              ? "bg-success/20 text-success"
              : "bg-error/20 text-error"
            }`}
        >
          {isInStock ? dict.product.inStock : dict.product.outOfStock}
        </span>
      </div>

      {/* Product info */}
      <p className="text-text-muted text-xs uppercase tracking-wider mb-1">
        {product.brand.replace("-", " ")}
      </p>
      <h3 className="text-text-primary text-sm font-medium line-clamp-2 mb-1.5
                     group-hover:text-accent transition-colors">
        {name}
      </h3>
      <p className="text-accent font-semibold">
        {formatPrice(product.price)}
      </p>
    </Link>
  );
}
