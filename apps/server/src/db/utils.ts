import { type SQL, sql } from 'drizzle-orm';

export function lower(column: unknown): SQL {
  return sql`lower(${column})`;
}
