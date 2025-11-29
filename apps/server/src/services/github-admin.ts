import {
  getFeedbackForBranch,
  getInstallationByGithubId,
  getInstallationByTeamId,
  linkInstallationToTeam,
  unlinkInstallationFromTeam,
} from '@/dal/github-integration';
import type { Database } from '@/db';
import type { AppEnv } from '@/lib/env';
import { signInstallState } from '@/lib/state';
import { buildBranchName } from '@/utils/slug';

export type InstallStatusResult =
  | { linked: false }
  | { linked: true; installationId: number; accountLogin: string };

/**
 * Get installation status for a team
 */
export async function getInstallStatus(
  db: Database,
  teamId: string | undefined,
): Promise<InstallStatusResult> {
  if (!teamId) {
    return { linked: false };
  }

  const installation = await getInstallationByTeamId(db, teamId);
  if (!installation) {
    return { linked: false };
  }

  return {
    linked: true,
    installationId: installation.githubInstallationId,
    accountLogin: installation.accountLogin,
  };
}

/**
 * Generate GitHub App installation URL with signed state
 */
export async function getInstallUrl(
  env: AppEnv,
  teamId: string | undefined,
): Promise<{ url: string }> {
  const base = `https://github.com/apps/${env.GH_APP_NAME}/installations/new`;
  const nonce = crypto.randomUUID();
  const SECONDS_PER_MILLISECOND = 1000;
  const unixSeconds = Math.floor(Date.now() / SECONDS_PER_MILLISECOND);

  const state = await signInstallState(env, {
    teamId,
    returnTo: `${env.FRONTEND_URL}/settings/integrations`,
    nonce,
    ts: unixSeconds,
  });

  const url = `${base}?state=${encodeURIComponent(state)}`;
  return { url };
}

/**
 * Link a GitHub installation to a team
 */
export async function linkInstallation(
  db: Database,
  teamId: string | undefined,
  githubInstallationId: number,
): Promise<{ success: boolean }> {
  if (!teamId) {
    return { success: false };
  }

  const installation = await getInstallationByGithubId(
    db,
    githubInstallationId,
  );
  if (!installation) {
    return { success: false };
  }

  // If already linked to another team, deny
  if (installation.teamId && installation.teamId !== teamId) {
    return { success: false };
  }

  await linkInstallationToTeam(db, installation.id, teamId);
  return { success: true };
}

/**
 * Unlink GitHub installation from a team
 */
export async function unlinkInstallation(
  db: Database,
  teamId: string | undefined,
): Promise<{ success: boolean }> {
  if (!teamId) {
    return { success: false };
  }

  await unlinkInstallationFromTeam(db, teamId);
  return { success: true };
}

/**
 * Get the GitHub settings URL for uninstalling
 */
export async function getUninstallUrl(
  db: Database,
  teamId: string | undefined,
): Promise<{ url: string }> {
  if (teamId) {
    const installation = await getInstallationByTeamId(db, teamId);
    if (installation) {
      return {
        url: `https://github.com/settings/installations/${installation.githubInstallationId}`,
      };
    }
  }

  return { url: 'https://github.com/settings/installations' };
}

/**
 * Get branch name suggestion for a feedback item
 */
export async function getBranchSuggestion(
  db: Database,
  feedbackId: string,
): Promise<{ branch: string } | null> {
  const feedbackData = await getFeedbackForBranch(db, feedbackId);
  if (!feedbackData?.issueKey) {
    return null;
  }

  const branch = buildBranchName({
    issueKey: feedbackData.issueKey,
    title: feedbackData.title || undefined,
    assigneeName: null,
  });

  return { branch };
}
