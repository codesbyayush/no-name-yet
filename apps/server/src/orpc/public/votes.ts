import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { countVotes, createVote, deleteVote } from '@/dal/votes';
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
        })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;
      if (!userId) {
        throw new ORPCError('UNAUTHORIZED');
      }
      if (!(input.feedbackId || input.commentId)) {
        throw new ORPCError('BAD_REQUEST');
      }
      try {
        const newVote = await createVote(context.db, input, userId);
        return newVote;
      } catch (_error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  delete: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string().optional(),
        commentId: z.string().optional(),
      })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;
      if (!userId) {
        throw new ORPCError('UNAUTHORIZED');
      }
      const deletedVote = await deleteVote(context.db, input, userId);
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
      })
    )
    .handler(async ({ input, context }) => {
      if (!(input.feedbackId || input.commentId)) {
        throw new ORPCError('BAD_REQUEST');
      }
      return await countVotes(context.db, input);
    }),
};
