import { eq } from 'drizzle-orm';
import type { Database } from '@/dal/posts';
import { githubInstallations, organization } from '@/db/schema';

export async function getOrganizationIdBySlug(
  db: Database,
  slug: string
): Promise<string | null> {
  const [org] = await db
    .select({ id: organization.id })
    .from(organization)
    .where(eq(organization.slug, slug))
    .limit(1);
  return org?.id ?? null;
}

export type GitHubInstallationRow = {
  id: string;
  githubInstallationId: number;
  accountLogin: string;
  accountId: number;
  appId: number;
  organizationId?: string;
};

export async function insertOrUpdateInstallation(
  db: Database,
  row: GitHubInstallationRow
): Promise<void> {
  try {
    await db.insert(githubInstallations).values(row);
  } catch (_insertError) {
    await db
      .update(githubInstallations)
      .set(row)
      .where(
        eq(githubInstallations.githubInstallationId, row.githubInstallationId)
      );
  }
}

export async function deleteInstallationByInstallationId(
  db: Database,
  installationId: number
): Promise<void> {
  await db
    .delete(githubInstallations)
    .where(eq(githubInstallations.githubInstallationId, installationId));
}

export async function getOrganizationIdByInstallationId(
  db: Database,
  installationId: number
): Promise<string | null> {
  const [result] = await db
    .select({ organizationId: githubInstallations.organizationId })
    .from(githubInstallations)
    .where(eq(githubInstallations.githubInstallationId, installationId))
    .limit(1);
  return result?.organizationId ?? null;
}
