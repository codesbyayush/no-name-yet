import { neon, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-http';
import * as schema from './schema';

// Centralized Database type - import this everywhere instead of redefining
export type Database = ReturnType<typeof getDb>;

// Accepts the Worker env object and returns a Drizzle db instance
export function getDb(env: {
  HYPERDRIVE: { connectionString: string };
  DATABASE_URL: string;
  NODE_ENV: string;
}) {
  let connectionString = env.DATABASE_URL;
  if (env.NODE_ENV === 'development') {
    connectionString = 'postgres://postgres:postgres@db.localtest.me:5432/main';
    neonConfig.fetchEndpoint = (host: string) => {
      const [protocol, port] =
        host === 'db.localtest.me' ? ['http', 4444] : ['https', 443];
      return `${protocol}://${host}:${port}/sql`;
    };

    const connectionStringUrl = new URL(connectionString);
    neonConfig.useSecureWebSocket =
      connectionStringUrl.hostname !== 'db.localtest.me';
    neonConfig.wsProxy = (host) =>
      host === 'db.localtest.me' ? `${host}:4444/v2` : `${host}/v2`;
  }

  const sql = neon(connectionString);
  const db = drizzle(sql, { schema });

  return db;
}
