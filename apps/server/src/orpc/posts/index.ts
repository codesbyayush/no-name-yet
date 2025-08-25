import {
	type Vote,
	boards,
	comments,
	feedbackCounters as fc,
	feedback,
	feedbackTags,
	statuses,
	tags as tagsTable,
	user,
	votes,
} from "@/db/schema";
import { ORPCError } from "@orpc/client";
import {
	type SQL,
	and,
	asc,
	desc,
	eq,
	exists,
	inArray,
	sql,
} from "drizzle-orm";
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
				let orderBy: SQL<unknown>;
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
						issueKey: feedback.issueKey,
						boardId: feedback.boardId,
						priority: feedback.priority,
						statusId: feedback.statusId,
						statusKey: statuses.key,
						statusName: statuses.name,
						statusColor: statuses.color,
						statusOrder: statuses.order,
						assigneeId: feedback.assigneeId,
						assigneeName: user.name,
						assigneeEmail: user.email,
						assigneeImage: user.image,
						dueDate: feedback.dueDate,
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
						commentCount: fc.commentCount,
						voteCount: fc.upvoteCount,
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
					.leftJoin(statuses, eq(feedback.statusId, statuses.id))
					.leftJoin(fc, eq(fc.feedbackId, feedback.id))
					.where(and(...filters))
					.orderBy(orderBy)
					.offset(offset)
					.limit(take + 1);
				// Get tags/labels for each post
				const postsWithTags = await Promise.all(
					posts.slice(0, take).map(async (post) => {
						const tagsResult = await context.db
							.select({
								id: tagsTable.id,
								name: tagsTable.name,
								color: tagsTable.color,
							})
							.from(tagsTable)
							.innerJoin(feedbackTags, eq(tagsTable.id, feedbackTags.tagId))
							.where(eq(feedbackTags.feedbackId, post.id));

						return {
							...post,
							tags: tagsResult,
						};
					}),
				);

				const hasMore = posts.length > take;
				return {
					posts: postsWithTags,
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
						commentCount: fc.commentCount,
						voteCount: fc.upvoteCount,
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
					.leftJoin(fc, eq(fc.feedbackId, feedback.id))
					.leftJoin(statuses, eq(feedback.statusId, statuses.id))
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
				statusId: z.string().optional(),
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
				// Resolve default status if not provided
				let statusIdToUse: string | undefined = input.statusId;
				if (!statusIdToUse) {
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
					statusIdToUse = openStatus[0]?.id as string;
				}
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
							.where(eq(boards.id, newPost.boardId))
							.limit(1)
					)[0]?.organizationId as string;
					// Resolve tag ids by name scoped to org
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
				priority: z
					.enum(["low", "medium", "high", "urgent", "no_priority"])
					.optional(),
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
