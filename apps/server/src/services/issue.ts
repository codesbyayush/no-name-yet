import { and, count, eq } from "drizzle-orm";
import type { Database } from "@/dal/posts";
import { boards, feedback } from "@/db/schema";

export type IssueStatus =
  | "to-do"
  | "in-progress"
  | "technical-review"
  | "completed"
  | "backlog"
  | "paused";

export type PullRequestAction =
  | "opened"
  | "reopened"
  | "ready_for_review"
  | "closed";

/**
 * Generate a unique issue key for a board
 * Format: OF-{count + 1}
 */
export async function generateIssueKey(
  db: Database,
  boardId: string
): Promise<string> {
  const postsCount = await db
    .select({ count: count() })
    .from(feedback)
    .where(eq(feedback.boardId, boardId));

  return `OF-${(postsCount[0]?.count ?? 0) + 1}`;
}

// Regex pattern for issue key extraction - defined at module level for performance
const ISSUE_KEY_PATTERN = /^(?:[a-z0-9][a-z0-9-]*\/)?([a-z0-9]+-\d+)(?:\/.*)?$/;

/**
 * Extract issue key from Git branch name
 * Supports patterns like:
 * - "pe-102/title" -> "pe-102"
 * - "ayush/pe-102/title" -> "pe-102"
 * - "feature/OF-123/description" -> "OF-123"
 */
export function extractIssueKeyFromBranch(branchName: string): string | null {
  const m = branchName.toLowerCase().match(ISSUE_KEY_PATTERN);
  return m ? m[1] : null;
}

/**
 * Map GitHub PR action to issue status
 */
export function mapPullRequestActionToStatus(
  action: PullRequestAction,
  isMerged: boolean,
  baseBranch: string,
  defaultBranch = "main"
): IssueStatus | null {
  if (action === "opened" || action === "reopened") {
    return "in-progress";
  }

  if (action === "ready_for_review") {
    return "technical-review";
  }

  if (action === "closed" && isMerged) {
    const isDefaultBranch =
      baseBranch.toLowerCase() === defaultBranch.toLowerCase();
    return isDefaultBranch ? "completed" : "paused";
  }

  return null;
}

/**
 * Find feedback by issue key within an organization
 */
export async function findFeedbackByIssueKey(
  db: Database,
  issueKey: string,
  organizationId: string
): Promise<{ id: string } | null> {
  // issueKey is stored lowercase, compare directly
  const [result] = await db
    .select({ id: feedback.id })
    .from(feedback)
    .leftJoin(boards, eq(boards.id, feedback.boardId))
    .where(
      and(
        eq(feedback.issueKey, issueKey.toLowerCase()),
        eq(boards.organizationId, organizationId)
      )
    )
    .limit(1);

  return result || null;
}

/**
 * Update feedback status by ID
 */
export async function updateFeedbackStatus(
  db: Database,
  feedbackId: string,
  status: IssueStatus
): Promise<void> {
  await db
    .update(feedback)
    .set({ status, updatedAt: new Date() })
    .where(eq(feedback.id, feedbackId));
}
