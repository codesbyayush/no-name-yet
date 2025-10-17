import {
  index,
  pgTable,
  primaryKey,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { feedback } from './feedback';
import { tags } from './tags';

// Junction table for many-to-many between feedback and tags
export const feedbackTags = pgTable(
  'feedback_tags',
  {
    feedbackId: text('feedback_id')
      .notNull()
      .references(() => feedback.id, { onDelete: 'cascade' }),
    tagId: text('tag_id')
      .notNull()
      .references(() => tags.id, { onDelete: 'cascade' }),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    primaryKey({ columns: [table.feedbackId, table.tagId] }),
    index('idx_feedback_tags_feedback_id').on(table.feedbackId),
    index('idx_feedback_tags_tag_id').on(table.tagId),
  ]
);

export type FeedbackTag = typeof feedbackTags.$inferSelect;
export type NewFeedbackTag = typeof feedbackTags.$inferInsert;
