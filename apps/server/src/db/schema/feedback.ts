import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { boards } from './boards';

export const priorityEnum = pgEnum('priority_enum', [
  'low',
  'medium',
  'high',
  'urgent',
  'no-priority',
]);
export const statusEnum = pgEnum('status_enum', [
  'to-do',
  'in-progress',
  'completed',
  'backlog',
  'technical-review',
  'paused',
]);

// Feedback table - stores all feedback submissions
export const feedback = pgTable(
  'feedback',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    issueKey: text('issue_key').notNull().unique(),
    boardId: text('board_id')
      .notNull()
      .references(() => boards.id, { onDelete: 'cascade' }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    assigneeId: text('assignee_id').references(() => user.id, {
      onDelete: 'restrict',
    }),
    authorId: text('author_id').references(() => user.id, {
      onDelete: 'restrict',
    }),
    dueDate: timestamp('due_date'),
    status: statusEnum('status').notNull().default('to-do'),
    priority: priorityEnum('priority').default('low'),
    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    // For future features
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
  },
  (table) => [
    index('idx_feedback_board_id').on(table.boardId),
    index('idx_feedback_board_status_created').on(
      table.boardId,
      table.createdAt.desc()
    ),
    index('idx_feedback_status_created').on(table.createdAt.desc()),
    index('idx_feedback_issue_key').on(table.issueKey),
  ]
);

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
