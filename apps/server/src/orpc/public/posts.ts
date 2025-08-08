import { ORPCError } from "@orpc/client";
import { and, eq, inArray } from "drizzle-orm";
import { z } from "zod";
import {
	boards,
	feedbackTags,
	statuses,
	tags as tagsTable,
} from "../../db/schema";
import {
	type Feedback,
	type NewFeedback,
	feedback,
	feedbackTypeEnum,
} from "../../db/schema/feedback";
import { protectedProcedure } from "../procedures";

export const postsRouter = {
	create: protectedProcedure
		.input(
			z.object({
				boardId: z.string(),
				type: z.enum(["bug", "suggestion"]).default("bug"),
				title: z.string().optional(),
				description: z.string().min(1),
				url: z.string().optional(),
				priority: z.enum(["low", "medium", "high"]).default("low"),
				tags: z.array(z.string()).default([]),
				userAgent: z.string().optional(),
				browserInfo: z
					.object({
						platform: z.string().optional(),
						language: z.string().optional(),
						cookieEnabled: z.boolean().optional(),
						onLine: z.boolean().optional(),
						screenResolution: z.string().optional(),
					})
					.optional(),
				attachments: z
					.array(
						z.object({
							id: z.string(),
							name: z.string(),
							type: z.string(),
							size: z.number(),
							url: z.string(),
						}),
					)
					.default([]),
			}),
		)
		.output(z.any())
		.handler(async ({ input, context }) => {
			const userId = context.session!.user.id;
			const userEmail = context.session!.user.email;
			const userName = context.session!.user.name;

			if (!userId) {
				throw new ORPCError("UNAUTHORIZED");
			}

			try {
				// Resolve default statusId (open) for the organization's board
				const boardOrg = await context.db
					.select({ organizationId: boards.organizationId })
					.from(boards)
					.where(eq(boards.id, input.boardId))
					.limit(1);
				if (!boardOrg[0]) {
					throw new ORPCError("BAD_REQUEST");
				}
				const openStatus = await context.db
					.select({ id: statuses.id })
					.from(statuses)
					.where(
						and(
							eq(statuses.organizationId, boardOrg[0].organizationId),
							eq(statuses.key, "open"),
						),
					)
					.limit(1);
				const statusIdToUse = openStatus[0]?.id as string;
				const [newPost] = await context.db
					.insert(feedback)
					.values({
						boardId: input.boardId,
						type: input.type,
						title: input.title,
						description: input.description,
						userId,
						userEmail,
						userName,
						userAgent: input.userAgent,
						url: input.url,
						priority: input.priority,
						statusId: statusIdToUse,
						browserInfo: input.browserInfo,
						attachments: input.attachments,
						isAnonymous: false,
					})
					.returning();
				// Attach tags via junction table if any were provided
				if (input.tags.length > 0) {
					const orgId = (
						await context.db
							.select({ organizationId: boards.organizationId })
							.from(boards)
							.where(eq(boards.id, input.boardId))
							.limit(1)
					)[0]?.organizationId as string;
					const tagRows = await context.db
						.select({ id: tagsTable.id })
						.from(tagsTable)
						.where(
							and(
								eq(tagsTable.organizationId, orgId),
								inArray(tagsTable.name, input.tags),
							),
						);
					if (tagRows.length > 0) {
						await context.db.insert(feedbackTags).values(
							tagRows.map((t: { id: string }) => ({
								feedbackId: newPost.id,
								tagId: t.id,
							})),
						);
					}
				}

				return newPost;
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	update: protectedProcedure
		.input(
			z.object({
				id: z.string(),
				title: z.string().optional(),
				description: z.string().min(1).optional(),
				statusId: z.string().optional(),
				priority: z.enum(["low", "medium", "high"]).optional(),
				tags: z.array(z.string()).optional(),
				url: z.string().optional(),
				userAgent: z.string().optional(),
				browserInfo: z
					.object({
						platform: z.string().optional(),
						language: z.string().optional(),
						cookieEnabled: z.boolean().optional(),
						onLine: z.boolean().optional(),
						screenResolution: z.string().optional(),
					})
					.optional(),
				attachments: z
					.array(
						z.object({
							id: z.string(),
							name: z.string(),
							type: z.string(),
							size: z.number(),
							url: z.string(),
						}),
					)
					.optional(),
			}),
		)
		.output(z.any())
		.handler(async ({ input, context }) => {
			const userId = context.session!.user.id;

			const [updatedPost] = await context.db
				.update(feedback)
				.set({
					...(input.title && { title: input.title }),
					...(input.description && { description: input.description }),
					...(input.statusId && { statusId: input.statusId }),
					...(input.priority && { priority: input.priority }),
					...(input.url && { url: input.url }),
					...(input.userAgent && { userAgent: input.userAgent }),
					...(input.browserInfo && { browserInfo: input.browserInfo }),
					...(input.attachments && { attachments: input.attachments }),
					updatedAt: new Date(),
				})
				.where(eq(feedback.id, input.id))
				.returning();

			if (!updatedPost) {
				throw new Error("Post not found");
			}

			return updatedPost;
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

			const [deletedPost] = await context.db
				.delete(feedback)
				.where(eq(feedback.id, input.id))
				.returning();

			if (!deletedPost) {
				throw new Error("Post not found");
			}

			return { success: true, deletedPost };
		}),
};
