import { ORPCError } from '@orpc/server';
import { eq } from 'drizzle-orm';
import { z } from 'zod';
import { feedback, githubInstallations } from '../../../db/schema';
import { signInstallState } from '../../../lib/state';
import { buildBranchName } from '../../../utils/slug';
import { adminOnlyProcedure } from '../../procedures';

export const githubAdminRouter = {
  getInstallStatus: adminOnlyProcedure.handler(async ({ context }) => {
    if (!context.team) {
      return { linked: false };
    }
    const rows = await context.db
      .select()
      .from(githubInstallations)
      .where(eq(githubInstallations.teamId, context.team.id))
      .limit(1);
    const installation = rows[0];
    if (!installation) {
      return { linked: false };
    }
    return {
      linked: true,
      installationId: installation.githubInstallationId,
      accountLogin: installation.accountLogin,
    };
  }),

  getInstallUrl: adminOnlyProcedure.handler(async ({ context }) => {
    const base = `https://github.com/apps/${context.env.GH_APP_NAME}/installations/new`;
    const nonce = crypto.randomUUID();
    const SECONDS_PER_MILLISECOND = 1000 as const;
    const UNIX_SECONDS = Math.floor(Date.now() / SECONDS_PER_MILLISECOND);
    const state = await signInstallState(context.env, {
      teamId: context.team?.id,
      returnTo: `${context.env.FRONTEND_URL}/settings/integrations`,
      nonce,
      ts: UNIX_SECONDS,
    });
    const url = `${base}?state=${encodeURIComponent(state)}`;
    return { url };
  }),

  linkInstallation: adminOnlyProcedure
    .input(z.object({ githubInstallationId: z.number() }))
    .handler(async ({ input, context }) => {
      if (!context.team) {
        return { success: false };
      }
      const rows = await context.db
        .select()
        .from(githubInstallations)
        .where(
          eq(
            githubInstallations.githubInstallationId,
            input.githubInstallationId,
          ),
        )
        .limit(1);
      const installation = rows[0];
      if (!installation) {
        return { success: false };
      }
      if (installation.teamId && installation.teamId !== context.team.id) {
        return { success: false };
      }
      await context.db
        .update(githubInstallations)
        .set({ teamId: context.team.id })
        .where(eq(githubInstallations.id, installation.id));
      return { success: true };
    }),

  unlinkInstallation: adminOnlyProcedure.handler(async ({ context }) => {
    if (!context.team) {
      return { success: false };
    }
    await context.db
      .update(githubInstallations)
      .set({ teamId: null })
      .where(eq(githubInstallations.teamId, context.team.id));
    return { success: true };
  }),

  getUninstallUrl: adminOnlyProcedure.handler(async ({ context }) => {
    // If we have a linked installation, prefer the org-specific settings URL; otherwise fallback
    let installationId: number | null = null;
    let accountLogin: string | null = null;
    if (context.team) {
      const rows = await context.db
        .select({
          githubInstallationId: githubInstallations.githubInstallationId,
          accountLogin: githubInstallations.accountLogin,
        })
        .from(githubInstallations)
        .where(eq(githubInstallations.teamId, context.team.id))
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
      if (!context.team) {
        throw new ORPCError('UNAUTHORIZED');
      }
      const rows = await context.db
        .select({ title: feedback.title, issueKey: feedback.issueKey })
        .from(feedback)
        .where(eq(feedback.id, input.feedbackId))
        .limit(1);
      const row = rows[0];
      if (!row?.issueKey) {
        throw new ORPCError('NOT_FOUND', { message: 'Issue not found' });
      }
      const branch = buildBranchName({
        issueKey: row.issueKey,
        title: row.title || undefined,
        assigneeName: null,
      });
      return { branch };
    }),
};
