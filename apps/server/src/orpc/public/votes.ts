import { ORPCError } from '@orpc/server';
import { and, count, eq, type SQL } from 'drizzle-orm';
import { z } from 'zod';
import { votes } from '../../db/schema/votes';
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
      if (!(input.feedbackId || input.commentId)) {
        throw new ORPCError('BAD_REQUEST');
      }

      try {
        const [newVote] = await context.db
          .insert(votes)
          .values({
            feedbackId: input.feedbackId,
            commentId: input.commentId,
            userId,
          })
          .returning();

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

      const filters = [eq(votes.userId, userId)];

      if (input.feedbackId) {
        filters.push(eq(votes.feedbackId, input.feedbackId));
      } else if (input.commentId) {
        filters.push(eq(votes.commentId, input.commentId));
      }

      const [deletedVote] = await context.db
        .delete(votes)
        .where(and(...filters))
        .returning();

      if (!deletedVote) {
        throw new Error('Vote not found');
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
      const filter: SQL[] = [];
      if (input.feedbackId) {
        filter.push(eq(votes.feedbackId, input.feedbackId));
      } else if (input.commentId) {
        filter.push(eq(votes.commentId, input.commentId));
      } else {
        throw new Error('Resource not found');
      }

      const totalCount = await context.db
        .select({ count: count() })
        .from(votes)
        .where(and(...filter));

      return totalCount[0]?.count || 0;
    }),
};
