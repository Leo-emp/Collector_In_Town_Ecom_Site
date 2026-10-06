// Migration script — add city and township columns to delivery_zones table
// Run with: TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx tsx scripts/add-delivery-city-township.ts
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars first");
  process.exit(1);
}

const client = createClient({ url, authToken });

async function migrate() {
  console.log("Adding city and township columns to delivery_zones...");

  // Add city column (default empty string for existing rows)
  await client.execute(
    `ALTER TABLE delivery_zones ADD COLUMN city TEXT NOT NULL DEFAULT ''`
  ).catch((e: Error) => {
    if (e.message.includes("duplicate column")) {
      console.log("city column already exists, skipping");
    } else {
      throw e;
    }
  });

  // Add township column (default empty string for existing rows)
  await client.execute(
    `ALTER TABLE delivery_zones ADD COLUMN township TEXT NOT NULL DEFAULT ''`
  ).catch((e: Error) => {
    if (e.message.includes("duplicate column")) {
      console.log("township column already exists, skipping");
    } else {
      throw e;
    }
  });

  console.log("Migration complete!");
  process.exit(0);
}

migrate();
