import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { admin, organization } from "better-auth/plugins";
import { db } from "../db";
import * as schema from "../db/schema";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [
    "*"
  ],
  emailAndPassword: {
    enabled: true,
  },

  advanced: {
    crossSubDomainCookies: {
      enabled: true,
    },
    cookie: {
      sameSite: "none",
      secure: true,
      path: "/",
    },
    defaultCookieAttributes: {
      secure: true,
      // httpOnly: true,
      sameSite: "none", // Allows CORS-based cookie sharing across subdomains
      // partitioned: true, // New browser standards will mandate this for foreign cookies
    },
  },

  socialProviders: {
    google: {
      clientId: process.env.GOOGLE_CLIENT_ID || "",
      clientSecret: process.env.GOOGLE_CLIENT_SECRET || "",
    },
  },
  plugins: [admin(), organization()],
});
