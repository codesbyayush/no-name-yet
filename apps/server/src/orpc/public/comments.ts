import { z } from "zod";
import { eq } from "drizzle-orm";
import { protectedProcedure } from "../procedures";
import { db } from "../../db";
import {
  comments,
  type Comment,
  type NewComment,
} from "../../db/schema/comments";

export const commentsRouter = {
  create: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        parentCommentId: z.string().optional(),
        content: z.string().min(1),
        isInternal: z.boolean().default(false),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;

      const commentId = crypto.randomUUID();

      const [newComment] = await db
        .insert(comments)
        .values({
          id: commentId,
          feedbackId: input.feedbackId,
          parentCommentId: input.parentCommentId || null,
          authorId: userId,
          content: input.content,
          isInternal: input.isInternal,
        })
        .returning();

      return newComment;
    }),

  update: protectedProcedure
    .input(
      z.object({
        id: z.string(),
        content: z.string().min(1).optional(),
        isInternal: z.boolean().optional(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;

      const [updatedComment] = await db
        .update(comments)
        .set({
          ...(input.content && { content: input.content }),
          ...(input.isInternal !== undefined && {
            isInternal: input.isInternal,
          }),
          updatedAt: new Date(),
        })
        .where(eq(comments.id, input.id))
        .returning();

      if (!updatedComment) {
        throw new Error("Comment not found");
      }

      return updatedComment;
    }),

  delete: protectedProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session!.user.id;

      const [deletedComment] = await db
        .delete(comments)
        .where(eq(comments.id, input.id))
        .returning();

      if (!deletedComment) {
        throw new Error("Comment not found");
      }

      return { success: true, deletedComment };
    }),
};
