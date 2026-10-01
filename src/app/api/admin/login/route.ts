// POST /api/admin/login — deprecated, admin now uses Better Auth sign-in
// Kept to avoid 404 if old login form is cached
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.json(
    { error: "Use the admin sign-in page instead" },
    { status: 410 }
  );
}
