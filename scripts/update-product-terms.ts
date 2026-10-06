// Migration script — append unboxing video policy to all existing product terms
// Run with: TURSO_DATABASE_URL=libsql://... TURSO_AUTH_TOKEN=... npx tsx scripts/update-product-terms.ts
import { createClient } from "@libsql/client";

const url = process.env.TURSO_DATABASE_URL;
const authToken = process.env.TURSO_AUTH_TOKEN;

if (!url) {
  console.error("Set TURSO_DATABASE_URL and TURSO_AUTH_TOKEN env vars first");
  process.exit(1);
}

const client = createClient({ url, authToken });

const NEW_SENTENCES = " Take unboxing video for refund and return purposes. No unboxing video, no aftersale service.";

async function migrate() {
  // Fetch all products with their current terms
  const result = await client.execute("SELECT id, terms FROM products WHERE terms IS NOT NULL AND terms != ''");

  console.log(`Found ${result.rows.length} products with terms`);

  let updated = 0;
  for (const row of result.rows) {
    const currentTerms = String(row.terms || "");
    // Skip if already has the new sentences
    if (currentTerms.includes("unboxing video")) {
      console.log(`  Skipping ${row.id} — already has unboxing policy`);
      continue;
    }
    // Append new sentences
    const newTerms = currentTerms + NEW_SENTENCES;
    await client.execute({
      sql: "UPDATE products SET terms = ? WHERE id = ?",
      args: [newTerms, String(row.id)],
    });
    updated++;
    console.log(`  Updated ${row.id}`);
  }

  console.log(`\nDone! Updated ${updated} products.`);
  process.exit(0);
}

migrate();
