// GET /api/products — public product listing with pagination, brand filter, search, sort
// Only returns active products (customers never see drafts/discontinued)
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { eq, like, desc, asc, and, count } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Parse query parameters from URL
  const brand = searchParams.get("brand"); // Filter by brand slug
  const search = searchParams.get("search"); // Text search in product name
  const sort = searchParams.get("sort") || "newest"; // Sort: newest, price-asc, price-desc
  const page = Math.max(1, parseInt(searchParams.get("page") || "1")); // Page number (1-based)

  // Build WHERE conditions — always filter for active products only
  const conditions = [eq(products.status, "active")];
  if (brand) conditions.push(eq(products.brand, brand));
  if (search) conditions.push(like(products.nameEn, `%${search}%`));

  // Combine conditions with AND
  const where = conditions.length > 1 ? and(...conditions) : conditions[0];

  // Determine sort order
  const orderBy =
    sort === "price-asc" ? asc(products.price) :
    sort === "price-desc" ? desc(products.price) :
    desc(products.createdAt); // "newest" is the default

  // Count total matching products for pagination
  const [{ total }] = await db
    .select({ total: count() })
    .from(products)
    .where(where);

  // Fetch products for the current page
  const offset = (page - 1) * PRODUCTS_PER_PAGE;
  const productList = await db
    .select()
    .from(products)
    .where(where)
    .orderBy(orderBy)
    .limit(PRODUCTS_PER_PAGE)
    .offset(offset);

  // Fetch all product images (for a small catalog, fetching all is fine)
  const allImages = productList.length > 0
    ? await db
        .select()
        .from(productImages)
        .orderBy(productImages.displayOrder)
    : [];

  // Attach images to each product
  const result = productList.map((p) => ({
    ...p,
    images: allImages.filter((img) => img.productId === p.id),
  }));

  return NextResponse.json({
    products: result,
    pagination: {
      page,
      pageSize: PRODUCTS_PER_PAGE,
      total,
      totalPages: Math.ceil(total / PRODUCTS_PER_PAGE),
    },
  });
}
