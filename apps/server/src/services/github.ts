import {
  deleteInstallationByInstallationId,
  getOrganizationIdByInstallationId,
  getOrganizationIdBySlug,
  insertOrUpdateInstallation,
} from '@/dal/integration';
import type { Database } from '@/dal/posts';
import { findFeedbackByIssueKey, updateFeedbackStatus } from '@/dal/posts';
import {
  extractIssueKeyFromBranch,
  mapPullRequestActionToStatus,
  type PullRequestAction,
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
  installation: GitHubInstallation,
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
  const orgId = await getOrganizationIdBySlug(db, account.login);
  if (orgId) {
    (row as Record<string, unknown>).organizationId = orgId;
  }

  await insertOrUpdateInstallation(db, row);
}

/**
 * Delete GitHub installation
 */
export async function deleteInstallation(
  db: Database,
  installationId: number,
): Promise<void> {
  await deleteInstallationByInstallationId(db, installationId);
}

/**
 * Get organization ID by GitHub installation ID
 */
export async function getOrganizationByInstallation(
  db: Database,
  installationId: number,
): Promise<string | null> {
  return await getOrganizationIdByInstallationId(db, installationId);
}

/**
 * Handle pull request webhook event
 */
export async function handlePullRequest(
  db: Database,
  payload: PullRequestPayload,
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
    installationId,
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
    repository.default_branch,
  );

  if (!status) {
    return;
  }

  // Update feedback status
  await updateFeedbackStatus(db, feedback.id, status);
}
