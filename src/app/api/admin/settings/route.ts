// GET /api/admin/settings — get all site settings as a key-value object
// PUT /api/admin/settings — upsert site settings from a key-value object
import { NextResponse } from "next/server";
import { db } from "@/lib/drizzle";
import { siteSettings } from "@/lib/schema";
import { verifyAdminSession } from "@/lib/admin-auth";
import { eq } from "drizzle-orm";
import { z } from "zod";

// Settings are a flat key-value map — any string key with any JSON value
const settingsUpdateSchema = z.record(z.string(), z.unknown());

export async function GET() {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Fetch all settings rows and convert to a single object
  const rows = await db.select().from(siteSettings);
  const settings: Record<string, unknown> = {};
  for (const row of rows) {
    // Parse the JSON-encoded value back to its original type
    settings[row.key] = JSON.parse(row.value);
  }

  return NextResponse.json({ settings });
}

export async function PUT(request: Request) {
  // Verify admin session cookie
  if (!(await verifyAdminSession())) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  // Parse body as a flat key-value object
  const body = await request.json().catch(() => null);
  const parsed = settingsUpdateSchema.safeParse(body);
  if (!parsed.success) {
    return NextResponse.json({ error: "Invalid settings" }, { status: 400 });
  }

  // Upsert each key-value pair — update if exists, insert if new
  for (const [key, value] of Object.entries(parsed.data)) {
    const jsonValue = JSON.stringify(value);
    // Try to update existing row first
    const result = await db
      .update(siteSettings)
      .set({ value: jsonValue })
      .where(eq(siteSettings.key, key));

    // If no row was updated, insert a new one
    if (result.rowsAffected === 0) {
      await db.insert(siteSettings).values({ key, value: jsonValue });
    }
  }

  return NextResponse.json({ success: true });
}
