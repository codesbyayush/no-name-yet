import { eq } from 'drizzle-orm';
import type { Database } from '@/db';
import { feedback, githubInstallations } from '@/db/schema';

export type GitHubInstallationRow = {
  id: string;
  githubInstallationId: number;
  accountLogin: string;
  teamId: string | null;
};

/**
 * Get GitHub installation by team ID
 */
export async function getInstallationByTeamId(
  db: Database,
  teamId: string,
): Promise<GitHubInstallationRow | null> {
  const [row] = await db
    .select()
    .from(githubInstallations)
    .where(eq(githubInstallations.teamId, teamId))
    .limit(1);
  return row ?? null;
}

/**
 * Get GitHub installation by installation ID
 */
export async function getInstallationByGithubId(
  db: Database,
  githubInstallationId: number,
): Promise<GitHubInstallationRow | null> {
  const [row] = await db
    .select()
    .from(githubInstallations)
    .where(eq(githubInstallations.githubInstallationId, githubInstallationId))
    .limit(1);
  return row ?? null;
}

/**
 * Link installation to a team
 */
export async function linkInstallationToTeam(
  db: Database,
  installationId: string,
  teamId: string,
): Promise<void> {
  await db
    .update(githubInstallations)
    .set({ teamId })
    .where(eq(githubInstallations.id, installationId));
}

/**
 * Unlink installation from a team
 */
export async function unlinkInstallationFromTeam(
  db: Database,
  teamId: string,
): Promise<void> {
  await db
    .update(githubInstallations)
    .set({ teamId: null })
    .where(eq(githubInstallations.teamId, teamId));
}

/**
 * Get feedback title and issue key by ID
 */
export async function getFeedbackForBranch(
  db: Database,
  feedbackId: string,
): Promise<{ title: string | null; issueKey: string | null } | null> {
  const [row] = await db
    .select({ title: feedback.title, issueKey: feedback.issueKey })
    .from(feedback)
    .where(eq(feedback.id, feedbackId))
    .limit(1);
  return row ?? null;
}
