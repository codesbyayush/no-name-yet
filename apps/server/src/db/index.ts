import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
// import { reset, seed } from "drizzle-seed";
import * as schema from "./schema";

// Accepts the Worker env object and returns a Drizzle db instance
export function getDb(env: {
	HYPERDRIVE: { connectionString: string };
	DATABASE_URL: string;
	NODE_ENV: string;
}) {
	const connectionString =
		env.NODE_ENV !== "production"
			? env.DATABASE_URL
			: env.HYPERDRIVE.connectionString;
	const sql = neon(connectionString);
	const db = drizzle(sql, { schema });

	// await reset(db, schema);

	// await seed(db, schema, {
	// 	count: 100,
	// });

	return db;
}
