import { sql } from 'drizzle-orm';
import { index, pgTable, text, timestamp, unique } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { comments } from './comments';
import { feedback } from './feedback';

export const votes = pgTable(
  'votes',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    feedbackId: text('feedback_id').references(() => feedback.id, {
      onDelete: 'cascade',
    }),
    commentId: text('comment_id').references(() => comments.id, {
      onDelete: 'cascade',
    }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => ({
    uniqueVote: unique().on(table.userId, table.feedbackId, table.commentId),
    feedbackIdx: index('idx_votes_feedback').on(table.feedbackId),
    commentIdx: index('idx_votes_comment').on(table.commentId),
  })
);

export type Vote = typeof votes.$inferSelect;
export type NewVote = typeof votes.$inferInsert;
