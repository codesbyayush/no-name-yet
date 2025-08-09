import { integer, pgTable, text } from "drizzle-orm/pg-core";

// Single-row counters per feedback (can be sharded later if needed)
export const feedbackCounters = pgTable("feedback_counters", {
	feedbackId: text("feedback_id").primaryKey(),
	upvoteCount: integer("upvote_count").notNull().default(0),
	commentCount: integer("comment_count").notNull().default(0),
});

export type FeedbackCountersRow = typeof feedbackCounters.$inferSelect;
export type NewFeedbackCountersRow = typeof feedbackCounters.$inferInsert;
