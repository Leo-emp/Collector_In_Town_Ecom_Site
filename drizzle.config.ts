// drizzle-kit config — connects to Turso for migrations and schema push
// Run: npm run db:push   (pushes schema to Turso/local SQLite)
// Run: npm run db:studio (opens Drizzle Studio GUI for browsing data)
import { defineConfig } from "drizzle-kit";

export default defineConfig({
  // Path to the schema file with all table definitions
  schema: "./src/lib/schema.ts",
  // Output directory for generated migration SQL files
  out: "./drizzle",
  // Turso uses the libSQL dialect (SQLite-compatible)
  dialect: "turso",
  dbCredentials: {
    // Local dev: file:local.db, production: libsql://xxx.turso.io
    url: process.env.TURSO_DATABASE_URL || "file:local.db",
    authToken: process.env.TURSO_AUTH_TOKEN,
  },
});
