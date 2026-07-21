export const dynamic = "force-dynamic";

// GET /api/products — public product listing with pagination, brand filter, search, sort
// Returns active + sold_out products (customers see sold_out but can't buy)
// Also supports ?ids=id1,id2,id3 for batch lookups (cart/checkout resolution)
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { PRODUCTS_PER_PAGE } from "@/lib/constants";
import { eq, like, desc, asc, and, count, inArray, or } from "drizzle-orm";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);

  // Batch lookup by IDs — used by cart and checkout to resolve product details
  const ids = searchParams.get("ids");
  if (ids) {
    const idList = ids.split(",").filter(Boolean);
    if (idList.length === 0) {
      return NextResponse.json({ products: [] });
    }
    // Fetch products by IDs — no status filter (cart needs to show sold_out items too)
    const productList = await db
      .select()
      .from(products)
      .where(inArray(products.id, idList));
    // Fetch images for these products
    const allImages = await db
      .select()
      .from(productImages)
      .orderBy(productImages.displayOrder);
    const result = productList.map((p) => ({
      ...p,
      images: allImages.filter((img) => img.productId === p.id),
    }));
    return NextResponse.json({ products: result });
  }

  // Parse query parameters from URL
  const brand = searchParams.get("brand"); // Filter by brand slug
  const search = searchParams.get("search"); // Text search in product name
  const sort = searchParams.get("sort") || "newest"; // Sort: newest, price-asc, price-desc
  const page = Math.max(1, parseInt(searchParams.get("page") || "1")); // Page number (1-based)

  // Build WHERE conditions — show active and sold_out products
  const conditions = [or(eq(products.status, "active"), eq(products.status, "sold_out"))!];
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
