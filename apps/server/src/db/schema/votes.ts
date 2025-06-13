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
// import { posts } from "./posts";
import { comments } from "./comments";
import { user } from "./auth";
import { feedback } from "./feedback";

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
    id: text("id").primaryKey(),
    feedbackId: text("feedback_id").references(() => feedback.id, {
      onDelete: "cascade",
    }),
    commentId: text("comment_id").references(() => comments.id, {
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
    uniqueVote: unique().on(table.userId, table.feedbackId, table.commentId),
    feedbackIdx: index("idx_votes_feedback").on(table.feedbackId),
    commentIdx: index("idx_votes_comment").on(table.commentId),
  }),
);

// Export types for TypeScript
export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
