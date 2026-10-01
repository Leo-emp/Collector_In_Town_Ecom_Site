// GET /api/admin/check — verify if the current user has admin access
// Called after sign-in to check role before redirecting to dashboard
import { NextResponse } from "next/server";
import { verifyAdminSession } from "@/lib/admin-auth";

export async function GET() {
  const isAdmin = await verifyAdminSession();

  if (!isAdmin) {
    return NextResponse.json({ error: "Not an admin" }, { status: 403 });
  }

  return NextResponse.json({ admin: true });
}
