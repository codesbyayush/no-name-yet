import { neon } from "@neondatabase/serverless";
import { drizzle } from "drizzle-orm/neon-http";
import * as schema from "./schema";

// Accepts the Worker env object and returns a Drizzle db instance
export function getDb(env: { HYPERDRIVE: { connectionString: string } }) {
	const sql = neon(env.HYPERDRIVE.connectionString);
	return drizzle(sql, { schema });
}
