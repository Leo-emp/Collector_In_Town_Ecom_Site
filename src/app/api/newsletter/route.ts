// POST /api/newsletter — subscribe to the newsletter
// Validates email, prevents duplicates, rate limited
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { newsletterSubscribers } from "@/lib/schema";
import { newsletterSchema } from "@/lib/validation";
import { checkRateLimit } from "@/lib/rate-limit";

export async function POST(request: Request) {
  // Rate limit by IP — uses default config (20 per minute)
  const ip = request.headers.get("x-forwarded-for") || "unknown";
  const { allowed } = checkRateLimit(`newsletter:${ip}`);
  if (!allowed) {
    return NextResponse.json(
      { error: "Too many requests" },
      { status: 429 }
    );
  }

  // Parse and validate body with Zod newsletterSchema
  const body = await request.json().catch(() => null);
  const parsed = newsletterSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid email" }, { status: 400 });
  }

  // Insert email — onConflictDoNothing prevents duplicate subscriptions
  await db
    .insert(newsletterSubscribers)
    .values({
      id: crypto.randomUUID(),
      email: parsed.data.email,
    })
    .onConflictDoNothing();

  // Always return success (don't leak whether email was already subscribed)
  return NextResponse.json({ success: true }, { status: 201 });
}
