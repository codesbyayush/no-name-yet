// import {
//   pgTable,
//   serial,
//   integer,
//   text,
//   timestamp,
//   jsonb,
//   pgEnum,
// } from "drizzle-orm/pg-core";
// import { posts } from "./posts";

// // Enum for integration types
// export const integrationTypeEnum = pgEnum("integration_type", [
//   "jira",
//   "salesforce",
//   "slack",
//   "zendesk",
// ]);

// // Integrations table for third-party connections
// export const integrations = pgTable("integrations", {
//   id: text("id").primaryKey(),
//   tenantId: text("tenant_id")
//     .notNull()
//     .references(() => tenants.id, { onDelete: "cascade" }),
//   type: integrationTypeEnum("type").notNull(),
//   config: jsonb("config").notNull().$type<{
//     apiKey?: string;
//     apiUrl?: string;
//     webhookUrl?: string;
//     credentials?: {
//       clientId?: string;
//       clientSecret?: string;
//       accessToken?: string;
//       refreshToken?: string;
//     };
//     settings?: {
//       syncEnabled?: boolean;
//       syncFrequency?: string; // cron expression
//       fieldMappings?: Record<string, string>;
//       filters?: Record<string, any>;
//     };
//     metadata?: Record<string, any>;
//   }>(),
//   lastSync: timestamp("last_sync"),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// });

// // Post integrations table for linking posts to external systems
// export const postIntegrations = pgTable("post_integrations", {
//   id: text("id").primaryKey(),
//   postId: text("post_id")
//     .notNull()
//     .references(() => posts.id, { onDelete: "cascade" }),
//   integrationId: text("integration_id")
//     .notNull()
//     .references(() => integrations.id, { onDelete: "cascade" }),
//   externalId: text("external_id").notNull(),
//   data: jsonb("data").$type<{
//     externalUrl?: string;
//     status?: string;
//     assignedTo?: string;
//     priority?: string;
//     labels?: string[];
//     customFields?: Record<string, any>;
//     syncStatus?: "pending" | "synced" | "error";
//     lastSyncedAt?: string;
//     syncErrors?: string[];
//   }>(),
//   createdAt: timestamp("created_at").defaultNow().notNull(),
//   updatedAt: timestamp("updated_at").defaultNow().notNull(),
// });

// // Export types for TypeScript
// export type Integration = typeof integrations.$inferSelect;
// export type NewIntegration = typeof integrations.$inferInsert;
// export type PostIntegration = typeof postIntegrations.$inferSelect;
// export type NewPostIntegration = typeof postIntegrations.$inferInsert;
