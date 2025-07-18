import { randomUUID } from "crypto";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, count, asc } from "drizzle-orm";
import { z } from "zod";
import { changelog, user } from "../../db/schema";
import { adminOnlyProcedure, publicProcedure } from "../procedures";
import { 
	blockNoteToHTML, 
	validateBlockNoteContent, 
	generateSlug, 
	generateExcerpt 
} from "../../utils/changelog";

// Input schemas
const createChangelogSchema = z.object({
	title: z.string().min(1, "Title is required").max(200, "Title too long"),
	slug: z.string().min(1, "Slug is required").max(100, "Slug too long").optional(),
	content: z.any().refine(validateBlockNoteContent, "Invalid BlockNote content"),
	excerpt: z.string().max(500, "Excerpt too long").optional(),
	version: z.string().max(50, "Version too long").optional(),
	tags: z.array(z.string()).default([]),
	metaTitle: z.string().max(200, "Meta title too long").optional(),
	metaDescription: z.string().max(500, "Meta description too long").optional(),
});

const updateChangelogSchema = z.object({
	id: z.string().min(1, "ID is required"),
	title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
	slug: z.string().min(1, "Slug is required").max(100, "Slug too long").optional(),
	content: z.any().refine(validateBlockNoteContent, "Invalid BlockNote content").optional(),
	excerpt: z.string().max(500, "Excerpt too long").optional(),
	version: z.string().max(50, "Version too long").optional(),
	tags: z.array(z.string()).optional(),
	metaTitle: z.string().max(200, "Meta title too long").optional(),
	metaDescription: z.string().max(500, "Meta description too long").optional(),
});

const paginationSchema = z.object({
	offset: z.number().min(0).default(0),
	take: z.number().min(1).max(100).default(20),
});

// Admin procedures
export const changelogAdminRouter = adminOnlyProcedure.router({
	// Create new changelog
	createChangelog: adminOnlyProcedure
		.input(createChangelogSchema)
		.handler(async ({ input, context }) => {
			const { title, content, excerpt, version, tags, metaTitle, metaDescription } = input;
			const userId = context.session?.user?.id;
			const organizationId = context.organization?.id;

			if (!userId || !organizationId) {
				throw new ORPCError("UNAUTHORIZED");
			}

			try {
				// Generate slug if not provided
				let slug = input.slug || generateSlug(title);
				
				// Ensure slug is unique within the organization
				let slugCounter = 0;
				let finalSlug = slug;
				
				while (true) {
					const existingChangelog = await context.db
						.select({ id: changelog.id })
						.from(changelog)
						.where(
							and(
								eq(changelog.organizationId, organizationId),
								eq(changelog.slug, finalSlug)
							)
						)
						.limit(1);

					if (existingChangelog.length === 0) {
						break;
					}

					slugCounter++;
					finalSlug = `${slug}-${slugCounter}`;
				}

				// Generate HTML content and excerpt
				const htmlContent = blockNoteToHTML(content);
				const finalExcerpt = excerpt || generateExcerpt(content);

				// Create the changelog
				const newChangelog = await context.db
					.insert(changelog)
					.values({
						id: randomUUID(),
						organizationId,
						title,
						slug: finalSlug,
						content,
						htmlContent,
						excerpt: finalExcerpt,
						version,
						tags,
						metaTitle,
						metaDescription,
						authorId: userId,
						status: "draft",
					})
					.returning();

				return {
					changelog: newChangelog[0],
					message: "Changelog created successfully",
				};
			} catch (error) {
				console.error("Error creating changelog:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	// List all changelogs (including drafts)
	listChangelogs: adminOnlyProcedure
		.input(
			z.object({
				...paginationSchema.shape,
				status: z.enum(["draft", "published", "archived"]).optional(),
			})
		)
		.handler(async ({ input, context }) => {
			const { offset, take, status } = input;
			const organizationId = context.organization?.id;

			if (!organizationId) {
				throw new ORPCError("UNAUTHORIZED");
			}

			try {
				// Build where conditions
				let whereConditions = eq(changelog.organizationId, organizationId);
				if (status) {
					whereConditions = and(whereConditions, eq(changelog.status, status));
				}

				// Fetch changelogs with author information
				const changelogs = await context.db
					.select({
						id: changelog.id,
						title: changelog.title,
						slug: changelog.slug,
						excerpt: changelog.excerpt,
						status: changelog.status,
						version: changelog.version,
						tags: changelog.tags,
						publishedAt: changelog.publishedAt,
						createdAt: changelog.createdAt,
						updatedAt: changelog.updatedAt,
						author: {
							id: user.id,
							name: user.name,
							email: user.email,
							image: user.image,
						},
					})
					.from(changelog)
					.leftJoin(user, eq(changelog.authorId, user.id))
					.where(whereConditions)
					.orderBy(desc(changelog.createdAt))
					.offset(offset)
					.limit(take);

				// Get total count
				const totalCountResult = await context.db
					.select({ count: count() })
					.from(changelog)
					.where(whereConditions);

				const totalCount = totalCountResult[0]?.count || 0;
				const hasMore = offset + take < totalCount;

				return {
					changelogs,
					pagination: {
						offset,
						take,
						totalCount,
						hasMore,
					},
				};
			} catch (error) {
				console.error("Error listing changelogs:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	// Get specific changelog for editing
	getChangelog: adminOnlyProcedure
		.input(z.object({ id: z.string().min(1, "ID is required") }))
		.handler(async ({ input, context }) => {
			const { id } = input;
			const organizationId = context.organization?.id;

			if (!organizationId) {
				throw new ORPCError("UNAUTHORIZED");
			}

			try {
				const changelogResult = await context.db
					.select({
						id: changelog.id,
						title: changelog.title,
						slug: changelog.slug,
						content: changelog.content,
						excerpt: changelog.excerpt,
						status: changelog.status,
						version: changelog.version,
						tags: changelog.tags,
						metaTitle: changelog.metaTitle,
						metaDescription: changelog.metaDescription,
						publishedAt: changelog.publishedAt,
						createdAt: changelog.createdAt,
						updatedAt: changelog.updatedAt,
						author: {
							id: user.id,
							name: user.name,
							email: user.email,
							image: user.image,
						},
					})
					.from(changelog)
					.leftJoin(user, eq(changelog.authorId, user.id))
					.where(
						and(
							eq(changelog.id, id),
							eq(changelog.organizationId, organizationId)
						)
					)
					.limit(1);

				if (!changelogResult.length) {
					throw new ORPCError("NOT_FOUND");
				}

				return {
					changelog: changelogResult[0],
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}
				console.error("Error fetching changelog:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	// Update changelog
	updateChangelog: adminOnlyProcedure
		.input(updateChangelogSchema)
		.handler(async ({ input, context }) => {
			const { id, ...updateData } = input;
			const organizationId = context.organization?.id;

			if (!organizationId) {
				throw new ORPCError("UNAUTHORIZED");
			}

			try {
				// Verify changelog exists and belongs to organization
				const existingChangelog = await context.db
					.select({ id: changelog.id, slug: changelog.slug })
					.from(changelog)
					.where(
						and(
							eq(changelog.id, id),
							eq(changelog.organizationId, organizationId)
						)
					)
					.limit(1);

				if (!existingChangelog.length) {
					throw new ORPCError("NOT_FOUND");
				}

				// Prepare update values
				const updateValues: any = {
					updatedAt: new Date(),
				};

				// Handle slug uniqueness if slug is being updated
				if (updateData.slug && updateData.slug !== existingChangelog[0].slug) {
					let slugCounter = 0;
					let finalSlug = updateData.slug;
					
					while (true) {
						const slugExists = await context.db
							.select({ id: changelog.id })
							.from(changelog)
							.where(
								and(
									eq(changelog.organizationId, organizationId),
									eq(changelog.slug, finalSlug)
								)
							)
							.limit(1);

						if (slugExists.length === 0) {
							break;
						}

						slugCounter++;
						finalSlug = `${updateData.slug}-${slugCounter}`;
					}

					updateValues.slug = finalSlug;
				}

				// Handle content update
				if (updateData.content) {
					updateValues.content = updateData.content;
					updateValues.htmlContent = blockNoteToHTML(updateData.content);
					
					// Auto-generate excerpt if not provided
					if (!updateData.excerpt) {
						updateValues.excerpt = generateExcerpt(updateData.content);
					}
				}

				// Add other fields
				Object.keys(updateData).forEach(key => {
					if (key !== 'id' && key !== 'slug' && key !== 'content' && updateData[key] !== undefined) {
						updateValues[key] = updateData[key];
					}
				});

				// Update the changelog
				const updatedChangelog = await context.db
					.update(changelog)
					.set(updateValues)
					.where(eq(changelog.id, id))
					.returning();

				return {
					changelog: updatedChangelog[0],
					message: "Changelog updated successfully",
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}
				console.error("Error updating changelog:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	// Publish/unpublish changelog
	publishChangelog: adminOnlyProcedure
		.input(
			z.object({
				id: z.string().min(1, "ID is required"),
				publish: z.boolean(),
			})
		)
		.handler(async ({ input, context }) => {
			const { id, publish } = input;
			const organizationId = context.organization?.id;

			if (!organizationId) {
				throw new ORPCError("UNAUTHORIZED");
			}

			try {
				// Verify changelog exists and belongs to organization
				const existingChangelog = await context.db
					.select({ 
						id: changelog.id, 
						title: changelog.title,
						content: changelog.content 
					})
					.from(changelog)
					.where(
						and(
							eq(changelog.id, id),
							eq(changelog.organizationId, organizationId)
						)
					)
					.limit(1);

				if (!existingChangelog.length) {
					throw new ORPCError("NOT_FOUND");
				}

				// Validate required fields for publishing
				if (publish) {
					const changelogData = existingChangelog[0];
					if (!changelogData.title || !changelogData.content) {
						throw new ORPCError("BAD_REQUEST");
					}
				}

				// Update status and publishedAt
				const updateValues: any = {
					status: publish ? "published" : "draft",
					updatedAt: new Date(),
				};

				if (publish) {
					updateValues.publishedAt = new Date();
				} else {
					updateValues.publishedAt = null;
				}

				const updatedChangelog = await context.db
					.update(changelog)
					.set(updateValues)
					.where(eq(changelog.id, id))
					.returning();

				return {
					changelog: updatedChangelog[0],
					message: publish ? "Changelog published successfully" : "Changelog unpublished successfully",
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}
				console.error("Error publishing changelog:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	// Delete changelog
	deleteChangelog: adminOnlyProcedure
		.input(z.object({ id: z.string().min(1, "ID is required") }))
		.handler(async ({ input, context }) => {
			const { id } = input;
			const organizationId = context.organization?.id;

			if (!organizationId) {
				throw new ORPCError("UNAUTHORIZED");
			}

			try {
				// Verify changelog exists and belongs to organization
				const existingChangelog = await context.db
					.select({ id: changelog.id })
					.from(changelog)
					.where(
						and(
							eq(changelog.id, id),
							eq(changelog.organizationId, organizationId)
						)
					)
					.limit(1);

				if (!existingChangelog.length) {
					throw new ORPCError("NOT_FOUND");
				}

				// Delete the changelog
				await context.db
					.delete(changelog)
					.where(eq(changelog.id, id));

				return {
					message: "Changelog deleted successfully",
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}
				console.error("Error deleting changelog:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),
});

// Public procedures
export const changelogPublicRouter = publicProcedure.router({
	// List published changelogs
	listPublishedChangelogs: publicProcedure
		.input(paginationSchema)
		.handler(async ({ input, context }) => {
			const { offset, take } = input;

			// Check if organization exists
			if (!context.organization) {
				throw new ORPCError("NOT_FOUND");
			}

			try {
				// Fetch published changelogs
				const changelogs = await context.db
					.select({
						id: changelog.id,
						title: changelog.title,
						slug: changelog.slug,
						htmlContent: changelog.htmlContent,
						excerpt: changelog.excerpt,
						version: changelog.version,
						tags: changelog.tags,
						publishedAt: changelog.publishedAt,
						author: {
							id: user.id,
							name: user.name,
							image: user.image,
						},
					})
					.from(changelog)
					.leftJoin(user, eq(changelog.authorId, user.id))
					.where(
						and(
							eq(changelog.organizationId, context.organization.id),
							eq(changelog.status, "published")
						)
					)
					.orderBy(desc(changelog.publishedAt))
					.offset(offset)
					.limit(take);

				// Get total count
				const totalCountResult = await context.db
					.select({ count: count() })
					.from(changelog)
					.where(
						and(
							eq(changelog.organizationId, context.organization.id),
							eq(changelog.status, "published")
						)
					);

				const totalCount = totalCountResult[0]?.count || 0;
				const hasMore = offset + take < totalCount;

				return {
					changelogs,
					organizationId: context.organization.id,
					organizationName: context.organization.name,
					pagination: {
						offset,
						take,
						totalCount,
						hasMore,
					},
				};
			} catch (error) {
				console.error("Error listing published changelogs:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),

	// Get specific published changelog
	getPublishedChangelog: publicProcedure
		.input(z.object({ slug: z.string().min(1, "Slug is required") }))
		.handler(async ({ input, context }) => {
			const { slug } = input;

			// Check if organization exists
			if (!context.organization) {
				throw new ORPCError("NOT_FOUND");
			}

			try {
				const changelogResult = await context.db
					.select({
						id: changelog.id,
						title: changelog.title,
						slug: changelog.slug,
						htmlContent: changelog.htmlContent,
						excerpt: changelog.excerpt,
						version: changelog.version,
						tags: changelog.tags,
						metaTitle: changelog.metaTitle,
						metaDescription: changelog.metaDescription,
						publishedAt: changelog.publishedAt,
						author: {
							id: user.id,
							name: user.name,
							image: user.image,
						},
					})
					.from(changelog)
					.leftJoin(user, eq(changelog.authorId, user.id))
					.where(
						and(
							eq(changelog.organizationId, context.organization.id),
							eq(changelog.slug, slug),
							eq(changelog.status, "published")
						)
					)
					.limit(1);

				if (!changelogResult.length) {
					throw new ORPCError("NOT_FOUND");
				}

				return {
					changelog: changelogResult[0],
					organizationId: context.organization.id,
					organizationName: context.organization.name,
				};
			} catch (error) {
				if (error instanceof ORPCError) {
					throw error;
				}
				console.error("Error fetching published changelog:", error);
				throw new ORPCError("INTERNAL_SERVER_ERROR");
			}
		}),
});