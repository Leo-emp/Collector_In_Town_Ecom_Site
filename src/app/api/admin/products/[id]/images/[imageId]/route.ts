// DELETE /api/admin/products/[id]/images/[imageId] — remove product image
// Deletes from both Vercel Blob storage and the database
import { NextResponse } from "next/server";
import { del } from "@vercel/blob";
import { db } from "@/lib/drizzle";
import { productImages } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string; imageId: string }> }
) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const { imageId } = await params;

  // Fetch the image record to get the Vercel Blob URL
  const [image] = await db
    .select()
    .from(productImages)
    .where(eq(productImages.id, imageId));

  if (!image) {
    return NextResponse.json({ error: "Image not found" }, { status: 404 });
  }

  // Delete the file from Vercel Blob storage
  await del(image.url);

  // Delete the database record
  await db.delete(productImages).where(eq(productImages.id, imageId));

  return NextResponse.json({ success: true });
}
