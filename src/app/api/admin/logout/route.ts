// POST /api/admin/logout — redirect to admin login page
// The actual sign-out happens client-side via Better Auth
import { NextResponse } from "next/server";

export async function POST() {
  return NextResponse.redirect(
    new URL("/en/admin-login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000")
  );
}
