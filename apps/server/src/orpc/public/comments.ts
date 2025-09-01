import { and, count, eq, isNull } from 'drizzle-orm';
import { z } from 'zod';
import { comments } from '../../db/schema/comments';
import { protectedProcedure } from '../procedures';

export const commentsRouter = {
  create: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        content: z.string().min(1),
      })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;

      const [newComment] = await context.db
        .insert(comments)
        .values({
          feedbackId: input.feedbackId,
          authorId: userId,
          content: input.content,
        })
        .returning();
      return newComment;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).optional(),
      })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const [updatedComment] = await context.db
        .update(comments)
        .set({
          ...(input.content && { content: input.content }),
        })
        .where(eq(comments.id, input.id))
        .returning();

      if (!updatedComment) {
        throw new Error('Comment not found');
      }

      return updatedComment;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        commentId: z.string(),
      })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const [deletedComment] = await context.db
        .delete(comments)
        .where(eq(comments.id, input.commentId))
        .returning();

      if (!deletedComment) {
        throw new Error('Comment not found');
      }

      return { success: true, deletedComment };
    }),

  // For now this is only for top level comments
  getAll: protectedProcedure
    .input(z.object({ feedbackId: z.string() }))
    .output(z.any())
    .handler(async ({ input, context }) => {
      const allComments = await context.db
        .select()
        .from(comments)
        .where(
          and(
            eq(comments.feedbackId, input.feedbackId),
            isNull(comments.parentCommentId)
          )
        );
      return allComments;
    }),

  count: protectedProcedure
    .input(z.object({ feedbackId: z.string() }))
    .output(z.any())
    .handler(async ({ input, context }) => {
      const totalCount = await context.db
        .select({ count: count() })
        .from(comments)
        .where(eq(comments.feedbackId, input.feedbackId));
      return totalCount[0]?.count || 0;
    }),
};
