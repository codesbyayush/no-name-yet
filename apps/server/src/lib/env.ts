import type { Context } from 'hono';
import { env } from 'hono/adapter';

// Environment variable interface
export interface AppEnv {
  HYPERDRIVE: {
    connectionString: string;
  };
  DATABASE_URL: string;
  BETTER_AUTH_URL: string;
  BETTER_AUTH_SECRET: string;
  GOOGLE_CLIENT_ID: string;
  GOOGLE_CLIENT_SECRET: string;
  COOKIE_DOMAIN: string;
  CORS_ORIGIN: string;
  FRONTEND_URL: string;
  NODE_ENV: string;
  PORT: string;
  GEMINI_API_KEY: string;
  GOOGLE_GENERATIVE_AI_API_KEY: string;
  RESEND_DOMAIN_KEY: string;
  GH_APP_ID: string;
  GH_PRIVATE_KEY: string;
  GH_WEBHOOK_SECRET: string;
  GH_APP_NAME: string;
  OF_STORE?: KVNamespace;
  REDIS_URL?: string;
  SENTRY_DSN?: string;
  CF_VERSION_METADATA: {
    id: string;
  };
}

// Use Hono's official env adapter to get environment variables
export function getEnvFromContext(context: Context): AppEnv {
  return env(context) as AppEnv;
}
