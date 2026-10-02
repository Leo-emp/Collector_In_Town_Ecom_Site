// Admin authentication — checks Better Auth session + admin email
// The admin signs up and signs in through the regular pages
// If their email matches ADMIN_EMAIL, they get dashboard access
import { auth } from "./auth";
import { headers } from "next/headers";

// The admin email — must be set via ADMIN_EMAIL env var
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "";

// Verify that the current request is from the admin user
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user?.email || !ADMIN_EMAIL) return false;

    // Admin = the user whose email matches ADMIN_EMAIL env var
    return session.user.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}
