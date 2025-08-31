import { sql } from 'drizzle-orm';
import {
  boolean,
  index,
  jsonb,
  pgEnum,
  pgTable,
  text,
  timestamp,
} from 'drizzle-orm/pg-core';
import { user } from './auth';
import { boards } from './boards';
import { organization } from './organization';
import { statuses } from './statuses';
import { tags } from './tags';

// Enum for feedback types
export const feedbackTypeEnum = pgEnum('feedback_type', ['bug', 'suggestion']);
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
    type: feedbackTypeEnum('type').notNull(),
    title: text('title').notNull(),
    description: text('description').notNull(),
    status: statusEnum('status').notNull().default('to-do'),
    statusId: text('status_id').references(() => statuses.id, {
      onDelete: 'restrict',
    }),
    assigneeId: text('assignee_id').references(() => user.id, {
      onDelete: 'restrict',
    }),
    dueDate: timestamp('due_date'),
    priority: priorityEnum('priority').default('low'),
    // Need to rethink there: user can be from tenant that we do not have in our db
    userId: text('user_id'),
    userEmail: text('user_email'),
    userName: text('user_name'),

    userAgent: text('user_agent'),
    url: text('url'),
    browserInfo: jsonb('browser_info').$type<{
      platform?: string;
      language?: string;
      cookieEnabled?: boolean;
      onLine?: boolean;
      screenResolution?: string;
      userAgent?: string;
      url?: string;
    }>(),

    // Attachments and media
    attachments: jsonb('attachments').default([]).$type<
      Array<{
        id: string;
        name: string;
        type: string; // image/png, application/pdf, etc.
        size: number;
        url: string; // S3 URL or similar
      }>
    >(),

    // AI processing results (will be added in Phase 3)
    aiAnalysis: jsonb('ai_analysis').$type<{
      category?: string;
      sentiment?: string;
      summary?: string;
      suggestedResponse?: string;
      confidence?: number;
    }>(),

    // Custom data from the user
    metadata: jsonb('metadata').$type<Record<string, unknown>>(),

    // Metadata
    createdAt: timestamp('created_at').defaultNow().notNull(),
    updatedAt: timestamp('updated_at').defaultNow().notNull(),

    // For future features
    isAnonymous: boolean('is_anonymous').default(false).notNull(),
  },
  (table) => ({
    boardsIdx: index('idx_feedback_boards').on(table.boardId),
    statusIdx: index('idx_feedback_status').on(table.statusId),
    boardStatusCreatedIdx: index('idx_feedback_board_status_created').on(
      table.boardId,
      table.statusId,
      table.createdAt.desc()
    ),
    statusCreatedIdx: index('idx_feedback_status_created').on(
      table.statusId,
      table.createdAt.desc()
    ),
    typeIdx: index('idx_feedback_type').on(table.type),
    issueKeyIdx: index('idx_feedback_issue_key').on(table.issueKey),
  })
);

export type Feedback = typeof feedback.$inferSelect;
export type NewFeedback = typeof feedback.$inferInsert;
