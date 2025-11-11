import { desc, eq } from 'drizzle-orm';
import { activityLog, user } from '@/db/schema';
import type { Database } from './posts';

export type ActivityAction =
  | 'created'
  | 'updated'
  | 'deleted'
  | 'status_changed'
  | 'priority_changed'
  | 'assigned'
  | 'unassigned'
  | 'tag_added'
  | 'tag_removed'
  | 'board_changed'
  | 'due_date_changed'
  | 'completed'
  | 'description_changed'
  | 'title_changed';

export type CreateActivityLogInput = {
  feedbackId: string;
  userId: string;
  action: ActivityAction;
  field?: string;
  oldValue?: unknown;
  newValue?: unknown;
  metadata?: Record<string, unknown>;
};

/**
 * Creates an activity log entry
 */
export async function createActivityLog(
  db: Database,
  input: CreateActivityLogInput,
) {
  const [logEntry] = await db
    .insert(activityLog)
    .values({
      feedbackId: input.feedbackId,
      userId: input.userId,
      action: input.action,
      field: input.field ?? null,
      oldValue: input.oldValue
        ? JSON.parse(JSON.stringify(input.oldValue))
        : null,
      newValue: input.newValue
        ? JSON.parse(JSON.stringify(input.newValue))
        : null,
      metadata: input.metadata
        ? JSON.parse(JSON.stringify(input.metadata))
        : null,
    })
    .returning();

  return logEntry;
}

/**
 * Gets activity history for a specific feedback/ticket
 */
export async function getActivityHistoryByFeedbackId(
  db: Database,
  feedbackId: string,
) {
  const activities = await db
    .select()
    .from(activityLog)
    .where(eq(activityLog.feedbackId, feedbackId))
    .orderBy(desc(activityLog.createdAt));

  return activities;
}
