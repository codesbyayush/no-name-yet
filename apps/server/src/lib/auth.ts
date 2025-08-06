import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, anonymous, organization } from "better-auth/plugins";
import { eq } from "drizzle-orm";
import { getDb } from "../db";
import * as schema from "../db/schema";
import type { AppEnv } from "./env";

export function getAuth(env: AppEnv): any {
	return betterAuth({
		baseURL: env.BETTER_AUTH_URL as string,
		database: drizzleAdapter(getDb(env as { DATABASE_URL: string }), {
			provider: "pg",
			schema: schema,
		}),
		session: {
			cookieCache: {
				enabled: true,
				maxAge: 5 * 60,
			},
			expiresIn: 60 * 60 * 24 * 28,
			updateAge: 60 * 60 * 24 * 7,
		},
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
				// partitioned: true, // Don't know what it is for yet read something but didn't understand shit
			},
		},
		socialProviders: {
			google: {
				clientId: (env.GOOGLE_CLIENT_ID as string) || "",
				clientSecret: (env.GOOGLE_CLIENT_SECRET as string) || "",
			},
		},
		plugins: [
			admin(),
			organization(),
			anonymous({
				emailDomainName: "anon.us",
				onLinkAccount: async ({ anonymousUser, newUser }) => {
					// TODO: When we allow user to post without signup, update here to migrate post on linking account
					const db = getDb(env as { DATABASE_URL: string });
					const anonymousUserId = anonymousUser.user.id;
					const newUserId = newUser.user.id;

					// Run all migrations concurrently with Promise.allSettled
					await Promise.allSettled([
						// Migrate votes
						db
							.update(schema.votes)
							.set({ userId: newUserId })
							.where(eq(schema.votes.userId, anonymousUserId)),

						// Migrate posts (feedback)
						db
							.update(schema.feedback)
							.set({ userId: newUserId })
							.where(eq(schema.feedback.userId, anonymousUserId)),

						// Migrate comments
						db
							.update(schema.comments)
							.set({ authorId: newUserId })
							.where(eq(schema.comments.authorId, anonymousUserId)),
					]);
				},
			}),
		],
	});
}
