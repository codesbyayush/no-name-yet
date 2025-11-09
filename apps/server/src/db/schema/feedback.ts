import { sql } from 'drizzle-orm';
import {
  index,
  integer,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { boards } from './boards';
import { team } from './organization';

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
  'pending',
]);

// Feedback table - stores all feedback submissions
export const feedback = pgTable(
  'feedback',
  {
    id: text('id').primaryKey().default(sql`gen_random_uuid()::text`),
    issueKey: text('issue_key').unique(),
    boardId: text('board_id').references(() => boards.id, {
      onDelete: 'cascade',
    }),
    teamId: text('team_id').references(() => team.id, {
      onDelete: 'cascade',
    }),
    title: text('title').notNull(),
    description: text('description').notNull(),
    assigneeId: text('assignee_id').references(() => user.id, {
      onDelete: 'restrict',
    }),
    authorId: text('author_id')
      .references(() => user.id, {
        onDelete: 'restrict',
      })
      .notNull(),
    dueDate: timestamp('due_date'),
    completedAt: timestamp('completed_at'),
    status: statusEnum('status').notNull().default('to-do'),
    priority: priorityEnum('priority').default('low').notNull(),
    tags: text('tags').array(),
    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),
  },
  (table) => [
    index('idx_feedback_board_id').on(table.boardId),
    index('idx_feedback_board_status_created').on(
      table.boardId,
      table.createdAt.desc(),
    ),
    index('idx_feedback_status_created').on(table.createdAt.desc()),
    index('idx_feedback_issue_key').on(table.issueKey),
    index('idx_feedback_assignee_status').on(table.assigneeId, table.status),
  ],
);

export const teamSerials = pgTable('team_serials', {
  teamId: text('team_id').primaryKey(),
  nextSerial: integer('next_serial').notNull().default(1),
});

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
