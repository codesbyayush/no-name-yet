import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import {
  createComment,
  deleteComment,
  getCommentCount,
  getPostComments,
  updateComment,
} from '@/services/comments';
import { protectedProcedure } from '../procedures';

export const commentsRouter = {
  create: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        content: z.string().min(1),
      }),
    )

    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;
      return await createComment(context.db, input, userId);
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).optional(),
      }),
    )

    .handler(async ({ input, context }) => {
      const updatedComment = await updateComment(context.db, input);
      if (!updatedComment) {
        throw new ORPCError('NOT_FOUND', { message: 'Comment not found' });
      }
      return updatedComment;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      }),
    )

    .handler(async ({ input, context }) => {
      const deletedComment = await deleteComment(context.db, input.commentId);
      if (!deletedComment) {
        throw new ORPCError('NOT_FOUND', { message: 'Comment not found' });
      }
      return { success: true, deletedComment };
    }),

  // For now this is only for top level comments
  getAll: protectedProcedure
    .input(z.object({ feedbackId: z.string() }))
    .handler(async ({ input, context }) =>
      getPostComments(context.db, input.feedbackId),
    ),

  count: protectedProcedure
    .input(z.object({ feedbackId: z.string() }))

    .handler(async ({ input, context }) =>
      getCommentCount(context.db, input.feedbackId),
    ),
};
