import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import {
  getBranchSuggestion,
  getInstallStatus,
  getInstallUrl,
  getUninstallUrl,
  linkInstallation,
  unlinkInstallation,
} from '@/services/github-admin';
import { adminOnlyProcedure } from '../../procedures';

export const githubAdminRouter = {
  getInstallStatus: adminOnlyProcedure.handler(async ({ context }) => {
    return await getInstallStatus(context.db, context.team?.id);
  }),

  getInstallUrl: adminOnlyProcedure.handler(async ({ context }) => {
    return await getInstallUrl(context.env, context.team?.id);
  }),

  linkInstallation: adminOnlyProcedure
    .input(z.object({ githubInstallationId: z.number() }))
    .handler(async ({ input, context }) => {
      return await linkInstallation(
        context.db,
        context.team?.id,
        input.githubInstallationId,
      );
    }),

  unlinkInstallation: adminOnlyProcedure.handler(async ({ context }) => {
    return await unlinkInstallation(context.db, context.team?.id);
  }),

  getUninstallUrl: adminOnlyProcedure.handler(async ({ context }) => {
    return await getUninstallUrl(context.db, context.team?.id);
  }),

  getBranchSuggestion: adminOnlyProcedure
    .input(z.object({ feedbackId: z.string() }))
    .handler(async ({ input, context }) => {
      if (!context.team) {
        throw new ORPCError('UNAUTHORIZED', { message: 'Team not found' });
      }

      const result = await getBranchSuggestion(context.db, input.feedbackId);
      if (!result) {
        throw new ORPCError('NOT_FOUND', { message: 'Issue not found' });
      }

      return result;
    }),
};
