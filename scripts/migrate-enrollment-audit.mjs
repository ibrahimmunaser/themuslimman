/**
 * Adds enrolledByUserId column to ClassEnrollment table.
 * Uses the Supabase transaction-mode pooler (port 6543) to avoid
 * session-mode connection limits.
 */

import pg from "pg";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __dirname = dirname(fileURLToPath(import.meta.url));

// Load .env manually
const envPath = join(__dirname, "..", ".env");
const envContent = readFileSync(envPath, "utf-8");
const envVars = Object.fromEntries(
  envContent
    .split("\n")
    .filter((l) => l.includes("=") && !l.startsWith("#"))
    .map((l) => {
      const idx = l.indexOf("=");
      const key = l.slice(0, idx).trim();
      const val = l.slice(idx + 1).trim().replace(/^["']|["']$/g, "");
      return [key, val];
    })
);

// Switch to transaction-mode pooler (port 6543)
const rawUrl = envVars["DATABASE_URL"] ?? "";
const txUrl = rawUrl.replace(/:5432\//, ":6543/");

console.log("Connecting to transaction-mode pooler...");
const client = new pg.Client({ connectionString: txUrl });
await client.connect();

console.log("Running migration: add ClassEnrollment.enrolledByUserId ...");

await client.query(`
  ALTER TABLE "ClassEnrollment"
  ADD COLUMN IF NOT EXISTS "enrolledByUserId" TEXT;
`);

console.log('  Added column "enrolledByUserId" to ClassEnrollment (idempotent).');

// Verify
const { rows } = await client.query(`
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_name = 'ClassEnrollment'
  ORDER BY ordinal_position;
`);
console.log("\nClassEnrollment columns after migration:");
rows.forEach((r) => console.log(`  ${r.column_name} (${r.data_type}, nullable: ${r.is_nullable})`));

await client.end();
console.log("\nMigration complete.");
