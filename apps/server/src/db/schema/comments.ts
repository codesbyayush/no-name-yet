import { sql } from 'drizzle-orm';
import { boolean, index, pgTable, text, timestamp, uniqueIndex } from 'drizzle-orm/pg-core';
import { user } from './auth';
import { feedback } from './feedback';

export const comments = pgTable(
  'comments',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    feedbackId: text('feedback_id')
      .notNull()
      .references(() => feedback.id, { onDelete: 'cascade' }),
    parentCommentId: text('parent_comment_id').references(
      (): any => comments.id
    ),
    authorId: text('author_id').references(() => user.id, {
      onDelete: 'cascade',
    }),
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
    content: text('content').notNull(),
    isInternal: boolean('is_internal').default(false),
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
    deletedAt: timestamp('deleted_at'),
  },
  (table) => ([
    uniqueIndex('idx_comments_feedback_id').on(table.feedbackId),
    index('idx_comments_feedback_created').on(table.feedbackId, table.createdAt),
    index('idx_comments_parent_comment_id').on(table.parentCommentId),
  ])
);

// Export types for TypeScript
export type Comment = typeof comments.$inferSelect;
export type NewComment = typeof comments.$inferInsert;
