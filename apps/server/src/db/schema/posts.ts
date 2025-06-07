import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  jsonb,
  pgEnum,
  real,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./feedback";
import { boards } from "./boards";
import { user } from "./auth";

// Enum for post status
export const postStatusEnum = pgEnum("post_status", [
  "draft",
  "published",
  "archived",
  "deleted",
]);

// Posts table with AI-ready architecture
export const posts = pgTable(
  "posts",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    boardId: integer("board_id")
      .notNull()
      .references(() => boards.id, { onDelete: "cascade" }),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    slug: text("slug").notNull(),
    content: text("content").notNull(),
    // Note: contentVector would need pgvector extension for VECTOR(1536) type
    // For now using jsonb to store vector data until pgvector is set up
    contentVector: jsonb("content_vector"),
    status: postStatusEnum("status").notNull().default("draft"),
    upvotes: integer("upvotes").default(0),
    downvotes: integer("downvotes").default(0),
    sentimentScore: real("sentiment_score"),
    priority: integer("priority").default(0),
    customFields: jsonb("custom_fields"),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    uniqueTenantBoardSlug: unique().on(
      table.tenantId,
      table.boardId,
      table.slug,
    ),
    boardIdx: index("idx_posts_board").on(table.boardId),
    authorIdx: index("idx_posts_author").on(table.authorId),
  }),
);

// Export types for TypeScript
export type Post = typeof posts.$inferSelect;
export type NewPost = typeof posts.$inferInsert;
