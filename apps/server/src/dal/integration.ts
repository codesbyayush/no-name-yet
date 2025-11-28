import { eq } from 'drizzle-orm';
import type { Database } from '@/dal/posts';
import { githubInstallations, team } from '@/db/schema';

export async function getTeamIdBySlug(
  db: Database,
  slug: string,
): Promise<string | null> {
  const [t] = await db
    .select({ id: team.id })
    .from(team)
    .where(eq(team.slug, slug))
    .limit(1);
  return t?.id ?? null;
}

export type GitHubInstallationRow = {
  id: string;
  githubInstallationId: number;
  accountLogin: string;
  accountId: number;
  appId: number;
  teamId?: string;
};

export async function insertOrUpdateInstallation(
  db: Database,
  row: GitHubInstallationRow,
): Promise<void> {
  try {
    await db.insert(githubInstallations).values(row);
  } catch (_insertError) {
    await db
      .update(githubInstallations)
      .set(row)
      .where(
        eq(githubInstallations.githubInstallationId, row.githubInstallationId),
      );
  }
}

export async function deleteInstallationByInstallationId(
  db: Database,
  installationId: number,
): Promise<void> {
  await db
    .delete(githubInstallations)
    .where(eq(githubInstallations.githubInstallationId, installationId));
}

export async function getTeamIdByInstallationId(
  db: Database,
  installationId: number,
): Promise<string | null> {
  const [result] = await db
    .select({ teamId: githubInstallations.teamId })
    .from(githubInstallations)
    .where(eq(githubInstallations.githubInstallationId, installationId))
    .limit(1);
  return result?.teamId ?? null;
}
