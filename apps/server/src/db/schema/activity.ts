import { sql } from 'drizzle-orm';
import {
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { feedback } from './feedback';

// Activity action types
export const activityActionEnum = pgEnum('activity_action', [
  'created',
  'updated',
  'deleted',
  'status_changed',
  'priority_changed',
  'assigned',
  'unassigned',
  'tag_added',
  'tag_removed',
  'board_changed',
  'due_date_changed',
  'completed',
  'description_changed',
  'title_changed',
]);

// Activity log table - tracks all changes to tickets/feedback
export const activityLog = pgTable(
  'activity_log',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    feedbackId: text('feedback_id')
      .notNull()
      .references(() => feedback.id, { onDelete: 'cascade' }),
    userId: text('user_id')
      .notNull()
      .references(() => user.id, { onDelete: 'restrict' }),
    action: activityActionEnum('action').notNull(),
    // Field that was changed (e.g., 'status', 'priority', 'assigneeId', 'tags')
    field: text('field'),
    // Old and new values stored as JSONB to handle different data types
    oldValue: jsonb('old_value'),
    newValue: jsonb('new_value'),
    // Additional metadata for the activity (e.g., comment, reason)
    metadata: jsonb('metadata'),
    createdAt: timestamp('created_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_activity_log_feedback_id').on(table.feedbackId),
    index('idx_activity_log_feedback_created').on(
      table.feedbackId,
      table.createdAt.desc(),
    ),
    index('idx_activity_log_user_id').on(table.userId),
    index('idx_activity_log_action').on(table.action),
    index('idx_activity_log_created_at').on(table.createdAt.desc()),
  ],
);

// Export types for TypeScript
export type ActivityLog = typeof activityLog.$inferSelect;
export type NewActivityLog = typeof activityLog.$inferInsert;
