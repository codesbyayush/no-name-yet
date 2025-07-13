import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import { getDb } from "../db";
import * as schema from "../db/schema";

export function getAuth(env: Record<string, string>): unknown {
	return betterAuth({
		baseURL: env.BETTER_AUTH_URL as string,
		database: drizzleAdapter(getDb(env as { DATABASE_URL: string }), {
			provider: "pg",
			schema: schema,
		}),
		trustedOrigins: ["*"],
		emailAndPassword: {
			enabled: true,
		},
		advanced: {
			crossSubDomainCookies: {
				enabled: true,
				domain: env.COOKIE_DOMAIN,
			},
			defaultCookieAttributes: {
				secure: true,
				httpOnly: true,
				sameSite: "none",
				// partitioned: true, // New browser standards will mandate this for foreign cookies
			},
		},
		socialProviders: {
			google: {
				clientId: (env.GOOGLE_CLIENT_ID as string) || "",
				clientSecret: (env.GOOGLE_CLIENT_SECRET as string) || "",
			},
		},
		plugins: [admin(), organization()],
	});
}
