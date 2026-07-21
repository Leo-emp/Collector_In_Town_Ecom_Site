// GET /api/admin/products — list all products for admin (includes all statuses)
// POST /api/admin/products — create a new product
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { products, productImages } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { productSchema } from "@/lib/validation";
import { slugify } from "@/lib/format";
import { desc, eq } from "drizzle-orm";

export async function GET() {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all products ordered by newest first (admin sees ALL statuses)
  const allProducts = await db
    .select()
    .from(products)
    .orderBy(desc(products.createdAt));

  // Fetch all images sorted by display order
  const allImages = await db
    .select()
    .from(productImages)
    .orderBy(productImages.displayOrder);

  // Group images by product — attach to each product object
  const productList = allProducts.map((p) => ({
    ...p,
    images: allImages.filter((img) => img.productId === p.id),
  }));

  return NextResponse.json({ products: productList });
}

export async function POST(request: Request) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse and validate body with Zod productSchema
  const body = await request.json().catch(() => null);
  const parsed = productSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json(
      { error: "Validation failed", details: parsed.error.flatten() },
      { status: 400 }
    );
  }

  // Generate URL slug from English name
  const slug = slugify(parsed.data.name_en);

  // Insert product into database
  const id = crypto.randomUUID();
  await db.insert(products).values({
    id,
    slug,
    nameEn: parsed.data.name_en,
    nameMy: parsed.data.name_my || null,
    descriptionEn: parsed.data.description_en || null,
    descriptionMy: parsed.data.description_my || null,
    brand: parsed.data.brand,
    scale: parsed.data.scale,
    price: parsed.data.price,
    stockCount: parsed.data.stock_count,
    status: parsed.data.status,
  });

  // Fetch and return the created product
  const [created] = await db
    .select()
    .from(products)
    .where(eq(products.id, id));

  return NextResponse.json({ product: created }, { status: 201 });
}
