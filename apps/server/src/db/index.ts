import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import * as schema from "./schema";

// Accepts the Worker env object and returns a Drizzle db instance
export function getDb(env: { DATABASE_URL: string }) {
  const sql = neon(env.DATABASE_URL);
  return drizzle(sql, { schema });
}
