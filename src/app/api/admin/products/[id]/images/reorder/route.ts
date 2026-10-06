// PUT /api/admin/products/[id]/images/reorder — reorder product images
// Accepts an array of image IDs in desired display order
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { productImages } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  await params;

  const body = await request.json().catch(() => null);
  const imageIds: string[] = body?.imageIds;

  if (!Array.isArray(imageIds) || imageIds.length === 0) {
    return NextResponse.json({ error: "imageIds array required" }, { status: 400 });
  }

  // Update each image's displayOrder to match its position in the array
  for (let i = 0; i < imageIds.length; i++) {
    await db
      .update(productImages)
      .set({ displayOrder: i })
      .where(eq(productImages.id, imageIds[i]));
  }

  return NextResponse.json({ success: true });
}
