import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
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
    plugins: [admin(), organization()],
  });
}
