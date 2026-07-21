// POST /api/admin/products/[id]/images — upload product image to Vercel Blob
// Validates file type, size, and max count before uploading
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { db } from "@/lib/drizzle";
import { productImages } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { MAX_PHOTOS_PER_PRODUCT, MAX_PHOTO_SIZE_MB, ACCEPTED_IMAGE_TYPES } from "@/lib/constants";
import { eq, count } from "drizzle-orm";

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Get product ID from URL params
  const { id: productId } = await params;

  // Get the uploaded file from FormData
  const formData = await request.formData();
  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type — only JPEG, PNG, WebP
  if (!ACCEPTED_IMAGE_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: `Invalid file type. Accepted: ${ACCEPTED_IMAGE_TYPES.join(", ")}` },
      { status: 400 }
    );
  }

  // Validate file size — max 5MB
  if (file.size > MAX_PHOTO_SIZE_MB * 1024 * 1024) {
    return NextResponse.json(
      { error: `File too large. Max ${MAX_PHOTO_SIZE_MB}MB` },
      { status: 400 }
    );
  }

  // Check how many images this product already has (max 6)
  const [{ imageCount }] = await db
    .select({ imageCount: count() })
    .from(productImages)
    .where(eq(productImages.productId, productId));

  if (imageCount >= MAX_PHOTOS_PER_PRODUCT) {
    return NextResponse.json(
      { error: `Max ${MAX_PHOTOS_PER_PRODUCT} images per product` },
      { status: 400 }
    );
  }

  // Upload to Vercel Blob — stored under products/[productId]/ path
  const blob = await put(`products/${productId}/${file.name}`, file, {
    access: "public",
  });

  // Create database record linking the blob URL to the product
  const imageId = crypto.randomUUID();
  await db.insert(productImages).values({
    id: imageId,
    productId,
    url: blob.url,
    // New images go at the end of the display order
    displayOrder: imageCount,
  });

  // Return the created image record
  const [image] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, imageId));

  return NextResponse.json({ image }, { status: 201 });
}
