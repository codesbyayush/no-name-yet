import {
  boolean,
  pgTable,
  serial,
  text,
  timestamp,
  integer,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./feedback";

export const user = pgTable(
  "user",
  {
    id: text("id").primaryKey(),
    name: text("name").notNull(),
    email: text("email").notNull().unique(),
    emailVerified: boolean("email_verified").notNull(),
    image: text("image"),
    createdAt: timestamp("created_at").notNull(),
    updatedAt: timestamp("updated_at").notNull(),
    // Extended fields for multi-tenancy and enhanced user management
    tenantId: integer("tenant_id").references(() => tenants.id, {
      onDelete: "cascade",
    }),
    authProvider: text("auth_provider").notNull().default("email"),
    externalId: text("external_id"),
    role: text("role").notNull().default("user"),
    banned: boolean("banned").default(false),
    banReason: text("ban_reason"),
    banExpires: timestamp("ban_expires"),
    customFields: jsonb("custom_fields"),
    lastActiveAt: timestamp("last_active_at"),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueTenantEmail: unique().on(table.tenantId, table.email),
    uniqueTenantExternalId: unique().on(table.tenantId, table.externalId),
    tenantIdx: index("idx_users_tenant").on(table.tenantId),
    emailIdx: index("idx_users_email").on(table.email),
  }),
);

export const session = pgTable("session", {
  id: text("id").primaryKey(),
  expiresAt: timestamp("expires_at").notNull(),
  token: text("token").notNull().unique(),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
  ipAddress: text("ip_address"),
  userAgent: text("user_agent"),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  activeOrganizationId: text("active_organization_id"),
  impersonatedBy: text("impersonated_by"),
});

export const account = pgTable("account", {
  id: text("id").primaryKey(),
  accountId: text("account_id").notNull(),
  providerId: text("provider_id").notNull(),
  userId: text("user_id")
    .notNull()
    .references(() => user.id, { onDelete: "cascade" }),
  accessToken: text("access_token"),
  refreshToken: text("refresh_token"),
  idToken: text("id_token"),
  accessTokenExpiresAt: timestamp("access_token_expires_at"),
  refreshTokenExpiresAt: timestamp("refresh_token_expires_at"),
  scope: text("scope"),
  password: text("password"),
  createdAt: timestamp("created_at").notNull(),
  updatedAt: timestamp("updated_at").notNull(),
});

export const verification = pgTable("verification", {
  id: text("id").primaryKey(),
  identifier: text("identifier").notNull(),
  value: text("value").notNull(),
  expiresAt: timestamp("expires_at").notNull(),
  createdAt: timestamp("created_at"),
  updatedAt: timestamp("updated_at"),
});

// User authentication table for security-sensitive data
export const userAuth = pgTable("user_auth", {
  userId: text("user_id")
    .primaryKey()
    .references(() => user.id, { onDelete: "cascade" }),
  passwordHash: text("password_hash"),
  mfaSecret: text("mfa_secret"),
  recoveryCodes: text("recovery_codes").array(),
  failedAttempts: integer("failed_attempts").default(0),
  lockedUntil: timestamp("locked_until"),
  refreshTokens: text("refresh_tokens").array(),
  lastLogin: timestamp("last_login"),
});
