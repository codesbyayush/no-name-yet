#!/usr/bin/env bun

import * as fs from "fs";
import * as path from "path";
import { sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Client } from "pg";

// Database reset script
// This script will completely drop all tables, types, and sequences, then regenerate migrations

async function resetDatabase() {
	console.log("🔄 Starting database reset...");

	// Get database URL from environment
	const databaseUrl = process.env.DATABASE_URL;
	if (!databaseUrl) {
		console.error("❌ DATABASE_URL environment variable is required");
		process.exit(1);
	}

	// Create database connection
	const client = new Client({
		connectionString: databaseUrl,
	});
	await client.connect();
	const db = drizzle(client);

	try {
		console.log("🗑️  Dropping all tables and types...");

		// Drop tables in dependency order (children first)
		const dropTablesSQL = `
      -- Drop all tables in dependency order
      DROP TABLE IF EXISTS "post_integrations" CASCADE;
      DROP TABLE IF EXISTS "integrations" CASCADE;
      DROP TABLE IF EXISTS "votes" CASCADE;
      DROP TABLE IF EXISTS "custom_field_values" CASCADE;
      DROP TABLE IF EXISTS "custom_fields" CASCADE;
      DROP TABLE IF EXISTS "comments" CASCADE;
      DROP TABLE IF EXISTS "posts" CASCADE;
      DROP TABLE IF EXISTS "boards" CASCADE;
      DROP TABLE IF EXISTS "feedback" CASCADE;
      DROP TABLE IF EXISTS "user_auth" CASCADE;
      DROP TABLE IF EXISTS "verification" CASCADE;
      DROP TABLE IF EXISTS "session" CASCADE;
      DROP TABLE IF EXISTS "account" CASCADE;
      DROP TABLE IF EXISTS "user" CASCADE;
      DROP TABLE IF EXISTS "tenants" CASCADE;

      -- Drop all custom ENUM types
      DROP TYPE IF EXISTS "integration_type" CASCADE;
      DROP TYPE IF EXISTS "vote_type" CASCADE;
      DROP TYPE IF EXISTS "post_status" CASCADE;
      DROP TYPE IF EXISTS "entity_type" CASCADE;
      DROP TYPE IF EXISTS "field_type" CASCADE;
      DROP TYPE IF EXISTS "plan_type" CASCADE;
      DROP TYPE IF EXISTS "status" CASCADE;
      DROP TYPE IF EXISTS "severity" CASCADE;
      DROP TYPE IF EXISTS "feedback_type" CASCADE;

      -- Drop sequences
      DROP SEQUENCE IF EXISTS "tenants_id_seq" CASCADE;
      DROP SEQUENCE IF EXISTS "boards_id_seq" CASCADE;
      DROP SEQUENCE IF EXISTS "posts_id_seq" CASCADE;
      DROP SEQUENCE IF EXISTS "comments_id_seq" CASCADE;
      DROP SEQUENCE IF EXISTS "votes_id_seq" CASCADE;
      DROP SEQUENCE IF EXISTS "custom_fields_id_seq" CASCADE;
      DROP SEQUENCE IF EXISTS "custom_field_values_id_seq" CASCADE;
      DROP SEQUENCE IF EXISTS "feedback_id_seq" CASCADE;
      DROP SEQUENCE IF EXISTS "integrations_id_seq" CASCADE;
      DROP SEQUENCE IF EXISTS "post_integrations_id_seq" CASCADE;
    `;

		await db.execute(sql.raw(dropTablesSQL));
		console.log("✅ Successfully dropped all tables, types, and sequences");

		// Close database connection
		await client.end();

		console.log("🧹 Cleaning up migration files...");

		// Remove existing migration files
		const migrationsDir = path.join(process.cwd(), "src/db/migrations");
		if (fs.existsSync(migrationsDir)) {
			const files = fs.readdirSync(migrationsDir);
			for (const file of files) {
				const filePath = path.join(migrationsDir, file);
				if (fs.statSync(filePath).isFile()) {
					fs.unlinkSync(filePath);
					console.log(`   Deleted: ${file}`);
				} else if (fs.statSync(filePath).isDirectory()) {
					// Remove meta directory and its contents
					if (file === "meta") {
						fs.rmSync(filePath, { recursive: true, force: true });
						console.log(`   Deleted: ${file}/ (directory)`);
					}
				}
			}
		}

		console.log("✅ Migration files cleaned up");
		console.log("\n🚀 Database reset complete!");
		console.log("\nNext steps:");
		console.log("1. Run: bun run db:generate");
		console.log("2. Run: bun run db:push");
		console.log(
			"\nThis will create fresh migrations from your current schema.",
		);
	} catch (error) {
		console.error("❌ Error during database reset:", error);
		process.exit(1);
	}
}

// Run the reset
resetDatabase().catch((error) => {
	console.error("❌ Unexpected error:", error);
	process.exit(1);
});
