// Supported diecast brands — used for catalog routing, nav dropdown, product form
export const BRANDS = [
  { slug: "mini-gt", name: "Mini GT", logo: "/images/brands/mini-gt.png" },
  { slug: "hot-wheels", name: "Hot Wheels", logo: "/images/brands/hot-wheels.png" },
  { slug: "inno64", name: "Inno64", logo: "/images/brands/inno64.png" },
  { slug: "pop-race", name: "Pop Race", logo: "/images/brands/pop-race.png" },
] as const;

// Valid brand slug values — used in Zod validation and route matching
export const BRAND_SLUGS = BRANDS.map((b) => b.slug);

// Common diecast scales — used in product form dropdown
export const SCALES = ["1:12", "1:18", "1:24", "1:32", "1:43", "1:64"] as const;

// Catalog pagination — 20 products per page
export const PRODUCTS_PER_PAGE = 20;

// Cart limits — max 5 of same item to prevent stock hoarding
export const MAX_QUANTITY_PER_ITEM = 5;

// File upload constraints for product photos
export const MAX_PHOTO_SIZE_MB = 5;
export const MAX_PHOTOS_PER_PRODUCT = 6;
export const ACCEPTED_IMAGE_TYPES = ["image/jpeg", "image/png", "image/webp"];
