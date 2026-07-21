// Drizzle ORM client — wraps the Turso connection from db.ts
// Import this everywhere you need typed database queries:
//   import { db } from "@/lib/drizzle"
import { drizzle } from "drizzle-orm/libsql";
import { turso } from "./db";
import * as schema from "./schema";

// Single Drizzle instance — reused across all requests
// Passing schema enables the relational query builder (db.query.*)
export const db = drizzle(turso, { schema });
