import { ORPCError } from "@orpc/server";
import { z } from "zod";
import {
  countPublicComments as dalCountPublic,
  createComment as dalCreateComment,
  deleteComment as dalDeleteComment,
  listTopLevelComments as dalListTopLevel,
  updateComment as dalUpdateComment,
} from "@/dal/comments";
import { protectedProcedure } from "../procedures";

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
      return await dalCreateComment(context.db, input, userId);
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
      const updatedComment = await dalUpdateComment(context.db, input);
      if (!updatedComment) {
        throw new ORPCError("NOT_FOUND", { message: "Comment not found" });
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
      const deletedComment = await dalDeleteComment(
        context.db,
        input.commentId
      );
      if (!deletedComment) {
        throw new ORPCError("NOT_FOUND", { message: "Comment not found" });
      }
      return { success: true, deletedComment };
    }),

  // For now this is only for top level comments
  getAll: protectedProcedure
    .input(z.object({ feedbackId: z.string() }))
    .handler(async ({ input, context }) =>
      dalListTopLevel(context.db, input.feedbackId)
    ),

  count: protectedProcedure
    .input(z.object({ feedbackId: z.string() }))
    .output(z.any())
    .handler(async ({ input, context }) =>
      dalCountPublic(context.db, input.feedbackId)
    ),
};
