// POST /api/orders/payment-proof — upload KBZ Pay payment screenshot to Vercel Blob
// Returns the blob URL to attach to the order
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { checkRateLimit } from "@/lib/rate-limit";

// Max file size: 5 MB
const MAX_SIZE = 5 * 1024 * 1024;
// Allowed image types for payment proof
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  // Rate limit — 5 uploads per minute per IP
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`payment-proof:${ip}`, { maxRequests: 5, windowMs: 60000 });
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many uploads. Please wait." },
      { status: 429 }
    );
  }

  // Parse the multipart form data
  const formData = await request.formData().catch(() => null);
  if (!formData) {
    return NextResponse.json({ error: "Invalid form data" }, { status: 400 });
  }

  const file = formData.get("file") as File | null;
  if (!file) {
    return NextResponse.json({ error: "No file provided" }, { status: 400 });
  }

  // Validate file type — only images allowed
  if (!ALLOWED_TYPES.includes(file.type)) {
    return NextResponse.json(
      { error: "Invalid file type. Only JPEG, PNG, and WebP are allowed." },
      { status: 400 }
    );
  }

  // Validate file size
  if (file.size > MAX_SIZE) {
    return NextResponse.json(
      { error: "File too large. Maximum size is 5 MB." },
      { status: 400 }
    );
  }

  // Upload to Vercel Blob with a unique filename
  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `payment-proofs/${Date.now()}-${crypto.randomUUID().slice(0, 8)}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: false,
  });

  return NextResponse.json({ url: blob.url });
}
