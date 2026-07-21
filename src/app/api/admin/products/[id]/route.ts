// PUT /api/admin/products/[id] — update a product's details
// DELETE /api/admin/products/[id] — soft-delete (set status to discontinued)
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { products } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { productSchema } from "@/lib/validation";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get product ID from URL params
  const { id } = await params;

  // Validate request body
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Update the product with new values
  await db
    .update(products)
    .set({
      nameEn: parsed.data.name_en,
      nameMy: parsed.data.name_my || null,
      descriptionEn: parsed.data.description_en || null,
      descriptionMy: parsed.data.description_my || null,
      brand: parsed.data.brand,
      scale: parsed.data.scale,
      price: parsed.data.price,
      stockCount: parsed.data.stock_count,
      status: parsed.data.status,
      // Update the timestamp to track when it was last modified
      updatedAt: new Date().toISOString(),
    })
    .where(eq(products.id, id));

  // Fetch and return the updated product
  const [updated] = await db
    .select()
    .from(products)
    .where(eq(products.id, id));

  if (!updated) {
    return NextResponse.json({ error: "Product not found" }, { status: 404 });
  }

  return NextResponse.json({ product: updated });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { id } = await params;

  // Soft delete — set status to discontinued (preserves order history references)
  // We don't hard-delete because order_items reference this product
  await db
    .update(products)
    .set({ status: "discontinued", updatedAt: new Date().toISOString() })
    .where(eq(products.id, id));

  return NextResponse.json({ success: true });
}
