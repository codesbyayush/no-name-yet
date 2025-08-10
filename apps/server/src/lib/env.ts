import { env } from "hono/adapter";

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
}

// Use Hono's official env adapter to get environment variables
export function getEnvFromContext(context: any): AppEnv {
	return env(context) as AppEnv;
}
