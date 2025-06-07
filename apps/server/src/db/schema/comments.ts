import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  real,
  boolean,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./feedback";
import { posts } from "./posts";
import { user } from "./auth";

// Comments table with versioned structure
export const comments = pgTable(
  "comments",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    postId: integer("post_id")
      .notNull()
      .references(() => posts.id, { onDelete: "cascade" }),
    parentCommentId: integer("parent_comment_id").references(
      (): any => comments.id,
    ),
    authorId: text("author_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    content: text("content").notNull(),
    sentimentScore: real("sentiment_score"),
    isInternal: boolean("is_internal").default(false),
    createdAt: timestamp("created_at").defaultNow().notNull(),
    updatedAt: timestamp("updated_at").defaultNow().notNull(),
    deletedAt: timestamp("deleted_at"),
  },
  (table) => ({
    postIdx: index("idx_comments_post").on(table.postId),
    parentIdx: index("idx_comments_parent").on(table.parentCommentId),
  }),
);

// Export types for TypeScript
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
