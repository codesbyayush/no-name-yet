import { feedbackCounters as fc } from "@/db/schema";
import { eq } from "drizzle-orm";
import { sql } from "drizzle-orm";
import { z } from "zod";
import {
	type Comment,
	type NewComment,
	comments,
} from "../../db/schema/comments";
import { protectedProcedure } from "../procedures";

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

			const [newComment] = await context.db
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
			await context.db
				.insert(fc)
				.values({
					feedbackId: input.feedbackId,
					commentCount: 1,
				})
				.onConflictDoUpdate({
					target: fc.feedbackId,
					set: { commentCount: sql`${fc.commentCount} + 1` },
				});
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

			const [updatedComment] = await context.db
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

			const [deletedComment] = await context.db
				.delete(comments)
				.where(eq(comments.id, input.id))
				.returning();

			if (!deletedComment) {
				throw new Error("Comment not found");
			}
			if (deletedComment.feedbackId) {
				await context.db
					.insert(fc)
					.values({
						feedbackId: deletedComment.feedbackId,
						commentCount: -1,
					})
					.onConflictDoUpdate({
						target: fc.feedbackId,
						set: { commentCount: sql`${fc.commentCount} - 1` },
					});
			}
			return { success: true, deletedComment };
		}),
};
