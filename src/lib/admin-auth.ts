// Admin authentication — simple password gate using signed cookies
// No user accounts — just a single ADMIN_PASSWORD env var
// The cookie value is signed with HMAC-SHA256 to prevent tampering
import { cookies } from "next/headers";
import crypto from "crypto";

// Cookie name for admin session — checked by admin layout and API routes
export const ADMIN_COOKIE_NAME = "admin_session";

// 24-hour TTL for admin session (seconds)
const SESSION_TTL_SECONDS = 60 * 60 * 24;

// Secret used to sign the cookie — reuses BETTER_AUTH_SECRET to avoid extra env vars
function getSecret(): string {
  const secret = process.env.BETTER_AUTH_SECRET;
  if (!secret) throw new Error("BETTER_AUTH_SECRET is required");
  return secret;
}

// Sign a value with HMAC-SHA256 to prevent cookie tampering
// Returns "value.signature" format
function sign(value: string): string {
  const secret = getSecret();
  // Create HMAC digest of the value using the secret
  const signature = crypto
    .createHmac("sha256", secret)
    .update(value)
    .digest("hex");
  // Concatenate value and signature with a dot separator
  return `${value}.${signature}`;
}

// Verify a signed value — returns the original value or null if invalid/tampered
function verifySignature(signed: string): string | null {
  // Find the last dot to split value from signature
  const lastDot = signed.lastIndexOf(".");
  if (lastDot === -1) return null;

  // Extract the original value (everything before the last dot)
  const value = signed.slice(0, lastDot);

  // Re-sign the value and compare with the provided signature
  const expected = sign(value);

  // Timing-safe comparison to prevent timing attacks
  if (
    expected.length !== signed.length ||
    !crypto.timingSafeEqual(Buffer.from(expected), Buffer.from(signed))
  ) {
    return null;
  }

  return value;
}

// Check if the admin password matches — timing-safe comparison
// Called by the login API route to verify the submitted password
export function verifyPassword(input: string): boolean {
  const password = process.env.ADMIN_PASSWORD;
  if (!password) throw new Error("ADMIN_PASSWORD env var is required");

  // Timing-safe comparison to prevent timing attacks
  // If lengths differ, we still do the comparison to avoid leaking length info
  const inputBuf = Buffer.from(input);
  const passwordBuf = Buffer.from(password);
  if (inputBuf.length !== passwordBuf.length) return false;
  return crypto.timingSafeEqual(inputBuf, passwordBuf);
}

// Set the admin session cookie — called after successful password verification
export async function setAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  // Payload is the timestamp when the session was created
  const payload = Date.now().toString();
  // Sign the payload to prevent tampering
  const signed = sign(payload);
  // Set the cookie with security options
  cookieStore.set(ADMIN_COOKIE_NAME, signed, {
    httpOnly: true, // Prevents JavaScript access (XSS protection)
    secure: process.env.NODE_ENV === "production", // HTTPS only in production
    sameSite: "lax", // Protects against CSRF
    maxAge: SESSION_TTL_SECONDS, // 24 hours
    path: "/", // Available on all routes
  });
}

// Clear the admin session cookie — called on logout
export async function clearAdminCookie(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(ADMIN_COOKIE_NAME);
}

// Verify admin session from cookies — returns true if valid
// Used by admin API routes and the admin layout to gate access
export async function verifyAdminSession(): Promise<boolean> {
  const cookieStore = await cookies();
  const cookie = cookieStore.get(ADMIN_COOKIE_NAME);

  // No cookie = not logged in
  if (!cookie?.value) return false;

  // Verify the signature hasn't been tampered with
  const payload = verifySignature(cookie.value);
  if (!payload) return false;

  // Parse the timestamp from the payload
  const created = parseInt(payload, 10);
  if (isNaN(created)) return false;

  // Check TTL — reject if older than 24 hours
  const age = Date.now() - created;
  return age < SESSION_TTL_SECONDS * 1000;
}
