import {
  pgTable,
  serial,
  integer,
  text,
  timestamp,
  pgEnum,
  unique,
  index,
} from "drizzle-orm/pg-core";
import { tenants } from "./feedback";
import { posts } from "./posts";
import { comments } from "./comments";
import { user } from "./auth";

// Enum for vote types
export const voteTypeEnum = pgEnum("vote_type", [
  "upvote",
  "downvote",
  "bookmark",
]);

// Votes table for intelligent voting system
export const votes = pgTable(
  "votes",
  {
    id: serial("id").primaryKey(),
    tenantId: integer("tenant_id")
      .notNull()
      .references(() => tenants.id, { onDelete: "cascade" }),
    postId: integer("post_id").references(() => posts.id, {
      onDelete: "cascade",
    }),
    commentId: integer("comment_id").references(() => comments.id, {
      onDelete: "cascade",
    }),
    userId: text("user_id")
      .notNull()
      .references(() => user.id, { onDelete: "cascade" }),
    type: voteTypeEnum("type").notNull(),
    weight: integer("weight").default(1),
    createdAt: timestamp("created_at").defaultNow().notNull(),
  },
  (table) => ({
    uniqueVote: unique().on(
      table.tenantId,
      table.userId,
      table.postId,
      table.commentId,
    ),
    postIdx: index("idx_votes_post").on(table.postId),
    commentIdx: index("idx_votes_comment").on(table.commentId),
  }),
);

// Export types for TypeScript
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
