// POST /api/admin/login — verify admin password and set session cookie
// Rate limited: 5 attempts per 15 minutes to prevent brute force
import { NextResponse } from "next/server";
import { adminLoginSchema } from "@/lib/validation";
import { verifyPassword, setAdminCookie } from "@/lib/admin-auth";
import { checkRateLimit, AUTH_RATE_LIMIT } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit by IP — 5 attempts per 15 minutes
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`admin-login:${ip}`, AUTH_RATE_LIMIT);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many login attempts. Try again later." },
      { status: 429 }
    );
  }

  // Parse and validate the request body with Zod
  const body = await request.json().catch(() => null);
  const parsed = adminLoginSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Password is required" }, { status: 400 });
  }

  // Check the password against ADMIN_PASSWORD env var (timing-safe)
  if (!verifyPassword(parsed.data.password)) {
    return NextResponse.json({ error: "Incorrect password" }, { status: 401 });
  }

  // Password correct — set the signed admin session cookie (24h TTL)
  await setAdminCookie();
  return NextResponse.json({ success: true });
}
