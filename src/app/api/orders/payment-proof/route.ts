// POST /api/orders/payment-proof — upload KBZ Pay payment screenshot to Vercel Blob
// Requires authenticated session — anonymous uploads are rejected
import { NextResponse } from "next/server";
import { put } from "@vercel/blob";
import { auth } from "@/lib/auth";
import { headers } from "next/headers";
import { checkRateLimit } from "@/lib/rate-limit";

// Max file size: 5 MB
const MAX_SIZE = 5 * 1024 * 1024;
// Allowed image types for payment proof
const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];

export async function POST(request: Request) {
  // Require authenticated session
  const session = await auth.api.getSession({ headers: await headers() });
  if (!session?.user?.id) {
    return NextResponse.json({ error: "Sign in required" }, { status: 401 });
  }

  // Rate limit by user ID — 5 uploads per minute
  const { allowed } = checkRateLimit(`payment-proof:${session.user.id}`, { maxRequests: 5, windowMs: 60000 });
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

  // Upload to Vercel Blob with a fully random filename
  const ext = file.type.split("/")[1] === "jpeg" ? "jpg" : file.type.split("/")[1];
  const filename = `payment-proofs/${crypto.randomUUID()}.${ext}`;

  const blob = await put(filename, file, {
    access: "public",
    addRandomSuffix: true,
  });

  return NextResponse.json({ url: blob.url });
}
