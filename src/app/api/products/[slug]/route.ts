export const dynamic = "force-dynamic";

// GET /api/products/[slug] — single product with images
// Public endpoint — used by product detail page
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ slug: string }> }
) {
  const { slug } = await params;

  // Fetch product by URL slug
  const [product] = await db
    .select()
    .from(products)
    .where(eq(products.slug, slug));

  // Return 404 if product doesn't exist
  if (!product) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  // Fetch images for this product, ordered by display_order
  const images = await db
    .select()
    .from(productImages)
    .where(eq(productImages.productId, product.id))
    .orderBy(productImages.displayOrder);

  // Return product with images attached
  return NextResponse.json({
    product: { ...product, images },
  });
}
