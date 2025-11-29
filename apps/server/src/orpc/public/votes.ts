import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { addVote, getVoteCount, removeVote } from '@/services/votes';
import { protectedProcedure } from '../procedures';

export const votesRouter = {
  create: protectedProcedure
    .input(
      z
        .object({
          feedbackId: z.string().optional(),
          commentId: z.string().optional(),
        })
        .refine((data) => data.feedbackId || data.commentId, {
          message: 'Either feedbackId or commentId must be provided',
        }),
    )

    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;
      if (!userId) {
        throw new ORPCError('UNAUTHORIZED');
      }
      if (!(input.feedbackId || input.commentId)) {
        throw new ORPCError('BAD_REQUEST');
      }
      try {
        const newVote = await addVote(context.db, input, userId);
        return newVote;
      } catch (error) {
        context.logger.error('Failed to add vote', {
          scope: 'votes',
          context: {
            userId,
            feedbackId: input.feedbackId,
            commentId: input.commentId,
          },
          error,
        });
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string().optional(),
        commentId: z.string().optional(),
      }),
    )

    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;
      if (!userId) {
        throw new ORPCError('UNAUTHORIZED');
      }
      const deletedVote = await removeVote(context.db, input, userId);
      if (!deletedVote) {
        throw new ORPCError('NOT_FOUND', { message: 'Vote not found' });
      }
      return { success: true, deletedVote };
    }),

  count: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string().optional(),
        commentId: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      if (!(input.feedbackId || input.commentId)) {
        throw new ORPCError('BAD_REQUEST');
      }
      return await getVoteCount(context.db, input);
    }),
};
