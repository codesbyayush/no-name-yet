import {
	type Vote,
	boards,
	comments,
	feedback,
	user,
	votes,
} from "@/db/schema";
import { ORPCError } from "@orpc/client";
import { and, asc, desc, eq, exists, sql } from "drizzle-orm";
import { z } from "zod";
import { protectedProcedure } from "../procedures";

export const postsRouter = {
	// Composite routes from features/index.ts
	getDetailedPosts: protectedProcedure
		.input(
			z.object({
				offset: z.number().min(0).default(0),
				take: z.number().min(1).max(100).default(20),
				sortBy: z.enum(["newest", "oldest", "most_voted"]).default("newest"),
				boardId: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { offset, take, sortBy, boardId } = input;
			if (!context.organization) {
				throw new ORPCError("NOT_FOUND");
			}
			const userId = context.session?.user?.id;
			try {
				let orderBy;
				switch (sortBy) {
					case "oldest":
						orderBy = asc(feedback.createdAt);
						break;
					case "most_voted":
						orderBy = desc(feedback.createdAt); // TODO: Sort by vote count
						break;
					default:
						orderBy = desc(feedback.createdAt);
						break;
				}
				const filters = [eq(boards.organizationId, context.organization.id)];
				if (boardId) {
					filters.push(eq(boards.id, boardId));
				}
				const posts = await context.db
					.select({
						id: feedback.id,
						title: feedback.title,
						content: feedback.description,
						boardId: feedback.boardId,
						createdAt: feedback.createdAt,
						updatedAt: feedback.updatedAt,
						status: feedback.status,
						author: {
							id: user.id,
							name: user.name,
							email: user.email,
							image: user.image,
						},
						board: {
							id: boards.id,
							name: boards.name,
							slug: boards.slug,
						},
						comments: context.db.$count(
							comments,
							eq(feedback.id, comments.feedbackId),
						),
						votes: context.db.$count(votes, eq(feedback.id, votes.feedbackId)),
						hasVoted: userId
							? exists(
									context.db
										.select()
										.from(votes)
										.where(
											and(
												eq(votes.feedbackId, feedback.id),
												eq(votes.userId, userId),
											),
										),
								)
							: sql`false`,
					})
					.from(feedback)
					.leftJoin(user, eq(feedback.userId, user.id))
					.leftJoin(boards, eq(feedback.boardId, boards.id))
					.where(and(...filters))
					.orderBy(orderBy)
					.offset(offset)
					.limit(take + 1);
				const hasMore = posts.length > take;
				return {
					posts: posts.slice(0, take),
					organizationId: context.organization.id,
					organizationName: context.organization.name,
					pagination: {
						offset,
						take,
						hasMore,
					},
				};
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	getDetailedSinglePost: protectedProcedure
		.input(
			z.object({
				feedbackId: z.string().optional(),
			}),
		)
		.handler(async ({ input, context }) => {
			const { feedbackId } = input;
			if (!(context.organization && feedbackId)) {
				throw new ORPCError("NOT_FOUND");
			}
			const userId = context.session?.user?.id;
			try {
				const post = await context.db
					.select({
						id: feedback.id,
						title: feedback.title,
						content: feedback.description,
						boardId: feedback.boardId,
						createdAt: feedback.createdAt,
						updatedAt: feedback.updatedAt,
						author: {
							id: user.id,
							name: user.name,
							email: user.email,
							image: user.image,
						},
						board: {
							id: boards.id,
							name: boards.name,
							slug: boards.slug,
						},
						totalComments: context.db.$count(
							comments,
							eq(feedback.id, comments.feedbackId),
						),
						totalVotes: context.db.$count(
							votes,
							eq(feedback.id, votes.feedbackId),
						),
						hasVoted: userId
							? exists(
									context.db
										.select()
										.from(votes)
										.where(
											and(
												eq(votes.feedbackId, feedback.id),
												eq(votes.userId, userId),
											),
										),
								)
							: sql`false`,
					})
					.from(feedback)
					.leftJoin(user, eq(feedback.userId, user.id))
					.leftJoin(boards, eq(feedback.boardId, boards.id))
					.where(eq(feedback.id, feedbackId));
				return {
					post: post[0],
					organizationId: context.organization.id,
					organizationName: context.organization.name,
				};
			} catch (error) {
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	// Standard post CRUD from public/posts.ts
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
						tags: input.tags,
						browserInfo: input.browserInfo,
						attachments: input.attachments,
						isAnonymous: false,
					})
					.returning();
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
				status: z
					.enum(["open", "in_progress", "resolved", "closed"])
					.optional(),
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
					...(input.status && { status: input.status }),
					...(input.priority && { priority: input.priority }),
					...(input.tags && { tags: input.tags }),
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
