// Turso database client — used by Better Auth and Drizzle ORM
// Reads TURSO_DATABASE_URL and TURSO_AUTH_TOKEN from env
// Uses lazy initialization to avoid throwing during Next.js build phase
import { createClient, type Client } from "@libsql/client";

// Cached client instance — created on first use, reused after
let _turso: Client | null = null;

// Lazy getter — creates the Turso client on first access
// This prevents the build from crashing when env vars aren't set
function getTurso(): Client {
  if (_turso) return _turso;

  // Local dev uses file:local.db; production uses Turso cloud URL
  const dbUrl = process.env.TURSO_DATABASE_URL || (process.env.NODE_ENV !== "production" ? "file:local.db" : undefined);

  // During Next.js build (no env vars), throw a clear error at runtime
  // This should never happen in Vercel because env vars are set there
  if (!dbUrl) {
    throw new Error("TURSO_DATABASE_URL is required — set it in Vercel environment variables");
  }

  _turso = createClient({
    url: dbUrl,
    authToken: process.env.TURSO_AUTH_TOKEN,
  });

  return _turso;
}

// Export a proxy that lazily creates the client on first method call
// This way the module can be imported during build without throwing
export const turso = new Proxy({} as Client, {
  get(_target, prop) {
    const client = getTurso();
    const value = (client as unknown as Record<string | symbol, unknown>)[prop];
    // If it's a method, bind it to the client so `this` works correctly
    if (typeof value === "function") {
      return value.bind(client);
    }
    return value;
  },
});
