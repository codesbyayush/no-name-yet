import { eq } from 'drizzle-orm';
import type { Database } from '@/dal/posts';
import { githubInstallations, organization } from '@/db/schema';
import {
  extractIssueKeyFromBranch,
  findFeedbackByIssueKey,
  mapPullRequestActionToStatus,
  type PullRequestAction,
  updateFeedbackStatus,
} from './issue';

export type GitHubInstallation = {
  id: number;
  app_id: number;
  account: {
    login: string;
    id: number;
  };
};

export type PullRequestPayload = {
  action: PullRequestAction;
  pull_request: {
    head: { ref: string };
    base: { ref: string };
    merged: boolean;
  };
  repository: {
    default_branch: string;
  };
  installation?: { id: number };
};

/**
 * Upsert GitHub installation record
 */
export async function upsertInstallation(
  db: Database,
  installation: GitHubInstallation
): Promise<void> {
  const account = installation.account;
  const id = String(installation.id);

  const row = {
    id,
    githubInstallationId: installation.id,
    accountLogin: account.login,
    accountId: account.id,
    appId: installation.app_id,
  };

  // Try to map to organization by slug = account.login
  const [org] = await db
    .select()
    .from(organization)
    .where(eq(organization.slug, account.login))
    .limit(1);

  if (org?.id) {
    (row as Record<string, unknown>).organizationId = org.id;
  }

  try {
    await db.insert(githubInstallations).values(row);
  } catch (_insertError) {
    // Update if already exists
    await db
      .update(githubInstallations)
      .set(row)
      .where(eq(githubInstallations.githubInstallationId, installation.id));
  }
}

/**
 * Delete GitHub installation
 */
export async function deleteInstallation(
  db: Database,
  installationId: number
): Promise<void> {
  await db
    .delete(githubInstallations)
    .where(eq(githubInstallations.githubInstallationId, installationId));
}

/**
 * Get organization ID by GitHub installation ID
 */
export async function getOrganizationByInstallation(
  db: Database,
  installationId: number
): Promise<string | null> {
  const [result] = await db
    .select({ organizationId: githubInstallations.organizationId })
    .from(githubInstallations)
    .where(eq(githubInstallations.githubInstallationId, installationId))
    .limit(1);

  return result?.organizationId || null;
}

/**
 * Handle pull request webhook event
 */
export async function handlePullRequest(
  db: Database,
  payload: PullRequestPayload
): Promise<void> {
  const { action, pull_request: pr, repository } = payload;

  if (!pr) {
    return;
  }

  if (!repository) {
    return;
  }

  const branch = pr.head?.ref || '';
  const issueKey = extractIssueKeyFromBranch(branch);

  if (!issueKey) {
    return;
  }

  // Find organization via installation ID
  const installationId = payload.installation?.id;
  if (!installationId) {
    return;
  }

  const organizationId = await getOrganizationByInstallation(
    db,
    installationId
  );
  if (!organizationId) {
    return;
  }

  // Find feedback by issue key
  const feedback = await findFeedbackByIssueKey(db, issueKey, organizationId);
  if (!feedback) {
    return;
  }

  // Map PR action to status
  const status = mapPullRequestActionToStatus(
    action,
    pr.merged,
    pr.base?.ref || '',
    repository.default_branch
  );

  if (!status) {
    return;
  }

  // Update feedback status
  await updateFeedbackStatus(db, feedback.id, status);
}
