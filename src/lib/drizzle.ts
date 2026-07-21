// Drizzle ORM client — wraps the Turso connection from db.ts
// Uses lazy initialization to avoid crashing during Next.js build
// Import this everywhere you need typed database queries:
//   import { db } from "@/lib/drizzle"
import { drizzle, type LibSQLDatabase } from "drizzle-orm/libsql";
import { turso } from "./db";
import * as schema from "./schema";

// Cached Drizzle instance — created on first use
let _db: LibSQLDatabase<typeof schema> | null = null;

// Lazy getter — defers Drizzle initialization until first query
function getDb(): LibSQLDatabase<typeof schema> {
  if (!_db) {
    _db = drizzle(turso, { schema });
  }
  return _db;
}

// Proxy that lazily initializes Drizzle on first method call
// This lets the module be imported during build without triggering DB connection
export const db = new Proxy({} as LibSQLDatabase<typeof schema>, {
  get(_target, prop) {
    const instance = getDb();
    const value = (instance as unknown as Record<string | symbol, unknown>)[prop];
    if (typeof value === "function") {
      return value.bind(instance);
    }
    return value;
  },
});
