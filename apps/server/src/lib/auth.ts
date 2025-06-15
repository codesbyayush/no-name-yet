import { betterAuth } from "better-auth";
import { drizzleAdapter } from "better-auth/adapters/drizzle";
import { db } from "../db";
import * as schema from "../db/schema";
import { admin, organization } from "better-auth/plugins";

export const auth: ReturnType<typeof betterAuth> = betterAuth({
  database: drizzleAdapter(db, {
    provider: "pg",
    schema: schema,
  }),
  trustedOrigins: [
    process.env.CORS_ORIGIN || "https://localhost:3001",
    "http://localhost:3000",
    "http://localhost:3001",
    "https://localhost:3001", // Frontend HTTPS
    "https://localhost:3002", // Alternative port
    "http://localhost:8080", // Server port
    "https://localhost:8080", // Server HTTPS port
    "http://localhost:5173", // Vite dev server
    "http://localhost:4173", // Vite preview
    "http://127.0.0.1:3000",
    "http://127.0.0.1:3001",
    "https://127.0.0.1:3001",
    "http://127.0.0.1:3002",
    "https://127.0.0.1:3002",
    "http://127.0.0.1:8080",
    "https://127.0.0.1:8080",
    "http://127.0.0.1:5173"
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
