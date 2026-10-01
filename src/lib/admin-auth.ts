// Admin authentication — checks Better Auth session + admin role
// Admin users sign in with their regular account, no separate password needed
// The admin's email is set via ADMIN_EMAIL env var (or defaults to empty)
import { auth } from "./auth";
import { headers } from "next/headers";

// Verify that the current request has a valid Better Auth session
// AND the user has the "admin" role
// Used by admin API routes and the admin layout to gate access
export async function verifyAdminSession(): Promise<boolean> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return false;

    // Check if user has admin role
    return (session.user as { role?: string }).role === "admin";
  } catch {
    return false;
  }
}

// Get the current admin user's info (for display in the dashboard)
export async function getAdminUser(): Promise<{ name: string; email: string } | null> {
  try {
    const session = await auth.api.getSession({
      headers: await headers(),
    });

    if (!session?.user) return null;
    if ((session.user as { role?: string }).role !== "admin") return null;

    return {
      name: session.user.name,
      email: session.user.email,
    };
  } catch {
    return null;
  }
}
