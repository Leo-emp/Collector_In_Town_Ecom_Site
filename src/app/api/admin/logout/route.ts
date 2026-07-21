// POST /api/admin/logout — clear admin session cookie and redirect to login
// Called when admin clicks "Logout" in the sidebar
import { NextResponse } from "next/server";
import { clearAdminCookie } from "@/lib/admin-auth";

export async function POST() {
  // Remove the admin_session cookie
  await clearAdminCookie();
  // Redirect to the English login page (browser follows the 302)
  return NextResponse.redirect(new URL("/en/admin-login", process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000"));
}
