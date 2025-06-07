import {
  pgTable,
  serial,
  integer,
  text,
  boolean,
  timestamp,
  jsonb,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./feedback";

// Boards table for hierarchical board structure
export const boards = pgTable(
  "boards",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    slug: text("slug").notNull(),
    description: text("description"),
    isPrivate: boolean("is_private").default(false),
    postCount: integer("post_count").default(0),
    viewCount: integer("view_count").default(0),
    customFields: jsonb("custom_fields"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueTenantSlug: unique().on(table.tenantId, table.slug),
    tenantIdx: index("idx_boards_tenant").on(table.tenantId),
  }),
);

// Export types for TypeScript
export type Board = typeof boards.$inferSelect;
export type NewBoard = typeof boards.$inferInsert;
