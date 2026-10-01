// POST /api/admin/setup — promote a user to admin by email
// Protected by ADMIN_SETUP_KEY env var (one-time setup)
// Usage: POST /api/admin/setup with { email, key }
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { user } from "@/lib/schema";
import { eq } from "drizzle-orm";

export async function POST(request: Request) {
  const body = await request.json().catch(() => null);
  if (!body?.email || !body?.key) {
    return NextResponse.json({ error: "email and key required" }, { status: 400 });
  }

  // Verify setup key — prevents anyone from promoting themselves
  const setupKey = process.env.ADMIN_SETUP_KEY || process.env.BETTER_AUTH_SECRET;
  if (body.key !== setupKey) {
    return NextResponse.json({ error: "Invalid key" }, { status: 403 });
  }

  // Find the user by email
  const [found] = await db
    .select()
    .from(user)
    .where(eq(user.email, body.email));

  if (!found) {
    return NextResponse.json(
      { error: "User not found. They must sign up first at /en/sign-up" },
      { status: 404 }
    );
  }

  // Promote to admin
  await db
    .update(user)
    .set({ role: "admin" })
    .where(eq(user.id, found.id));

  return NextResponse.json({
    success: true,
    message: `${found.name} (${found.email}) is now an admin`,
  });
}
