import { type SQL, sql } from "drizzle-orm";

export function lower(column: any): SQL {
	return sql`lower(${column})`;
}
