import { count, eq } from 'drizzle-orm';
import { z } from 'zod';
import {
  feedback,
  githubInstallations,
  githubRepositories,
} from '../../../db/schema';
import { signInstallState } from '../../../lib/state';
import { buildBranchName } from '../../../utils/slug';
import { adminOnlyProcedure } from '../../procedures';

export const githubAdminRouter = {
  getInstallStatus: adminOnlyProcedure.handler(async ({ context }) => {
    if (!context.organization) {
      return { linked: false };
    }
    const rows = await context.db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.organizationId, context.organization.id))
      .limit(1);
    const installation = rows[0];
    if (!installation) {
      return { linked: false };
    }
    const repoCountRows = await context.db
      .select({ c: count() })
      .from(githubRepositories)
      .where(eq(githubRepositories.installationId, installation.id));
    return {
      linked: true,
      installationId: installation.githubInstallationId,
      accountLogin: installation.accountLogin,
      repoCount: repoCountRows[0]?.c || 0,
    };
  }),

  getInstallUrl: adminOnlyProcedure.handler(async ({ context }) => {
    const base = `https://github.com/apps/${context.env.GITHUB_APP_NAME}/installations/new`;
    const nonce = crypto.randomUUID();
    const state = await signInstallState(context.env, {
      orgId: context.organization?.id,
      returnTo: `${context.env.FRONTEND_URL}/settings/integrations`,
      nonce,
      ts: Math.floor(Date.now() / 1000),
    });
    const url = `${base}?state=${encodeURIComponent(state)}`;
    return { url };
  }),

  linkInstallation: adminOnlyProcedure
    .input(z.object({ githubInstallationId: z.number() }))
    .handler(async ({ input, context }) => {
      if (!context.organization) {
        return { success: false };
      }
      const rows = await context.db
        .select()
        .from(githubInstallations)
        .where(
          eq(
            githubInstallations.githubInstallationId,
            input.githubInstallationId
          )
        )
        .limit(1);
      const installation = rows[0];
      if (!installation) {
        return { success: false };
      }
      if (
        installation.organizationId &&
        installation.organizationId !== context.organization.id
      ) {
        return { success: false };
      }
      await context.db
        .update(githubInstallations)
        .set({ organizationId: context.organization.id })
        .where(eq(githubInstallations.id, installation.id));
      return { success: true };
    }),

  unlinkInstallation: adminOnlyProcedure.handler(async ({ context }) => {
    if (!context.organization) {
      return { success: false };
    }
    await context.db
      .update(githubInstallations)
      .set({ organizationId: null })
      .where(eq(githubInstallations.organizationId, context.organization.id));
    return { success: true };
  }),

  getUninstallUrl: adminOnlyProcedure.handler(async ({ context }) => {
    // If we have a linked installation, prefer the org-specific settings URL; otherwise fallback
    let installationId: number | null = null;
    let accountLogin: string | null = null;
    if (context.organization) {
      const rows = await context.db
        .select({
          githubInstallationId: githubInstallations.githubInstallationId,
          accountLogin: githubInstallations.accountLogin,
        })
        .from(githubInstallations)
        .where(eq(githubInstallations.organizationId, context.organization.id))
        .limit(1);
      if (rows[0]) {
        installationId = rows[0].githubInstallationId as number;
        accountLogin = rows[0].accountLogin as string;
      }
    }
    if (installationId && accountLogin) {
      return {
        url: `https://github.com/settings/installations/${installationId}`,
      };
    }
    return { url: 'https://github.com/settings/installations' };
  }),

  getBranchSuggestion: adminOnlyProcedure
    .input(z.object({ feedbackId: z.string() }))
    .handler(async ({ input, context }) => {
      if (!context.organization) {
        throw new Error('Org required');
      }
      const rows = await context.db
        .select({ title: feedback.title, issueKey: feedback.issueKey })
        .from(feedback)
        .where(eq(feedback.id, input.feedbackId))
        .limit(1);
      const row = rows[0];
      if (!row?.issueKey) {
        throw new Error('Issue not found');
      }
      const branch = buildBranchName({
        issueKey: row.issueKey,
        title: row.title || undefined,
        assigneeName: null,
      });
      return { branch };
    }),
};
