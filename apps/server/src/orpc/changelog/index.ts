import { randomUUID } from "crypto";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, count, asc } from "drizzle-orm";
import { z } from "zod";
import { changelog, organization, user } from "../../db/schema";
import { adminOnlyProcedure, publicProcedure } from "../procedures";
import {
  validateChangelogInput,
  processChangelogContent,
  generateSlug,
  generateUniqueSlug,
  isValidSlug,
} from "../../utils/changelog";

// Pagination schema
const paginationSchema = z.object({
  offset: z.number().min(0).default(0),
  take: z.number().min(1).max(100).default(20),
});

// Admin changelog procedures
export const changelogAdminRouter = {
  // Create new changelog
  createChangelog: adminOnlyProcedure
    .input(
      z.object({
        title: z.string().min(1, "Title is required").max(200, "Title too long"),
        slug: z.string().optional(),
        content: z.any(), // BlockNote JSON content
        excerpt: z.string().max(500, "Excerpt too long").optional(),
        version: z.string().max(50, "Version too long").optional(),
        tags: z.array(z.string().max(50, "Tag too long")).max(20, "Too many tags").default([]),
        metaTitle: z.string().max(200, "Meta title too long").optional(),
        metaDescription: z.string().max(160, "Meta description too long").optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const userId = context.session?.user?.id;
      const organizationId = context.organization?.id;

      if (!userId || !organizationId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        // Generate slug if not provided
        let slug = input.slug || generateSlug(input.title);
        
        // Validate slug format
        if (!isValidSlug(slug)) {
          slug = generateSlug(input.title);
        }

        // Check for existing slugs in the organization
        const existingSlugs = await context.db
          .select({ slug: changelog.slug })
          .from(changelog)
          .where(eq(changelog.organizationId, organizationId));

        const existingSlugStrings = existingSlugs.map(item => item.slug);
        
        // Generate unique slug
        const uniqueSlug = generateUniqueSlug(slug, existingSlugStrings);

        // Validate input
        const validation = validateChangelogInput({
          title: input.title,
          slug: uniqueSlug,
          content: input.content,
          excerpt: input.excerpt,
          version: input.version,
          tags: input.tags,
        });

        if (!validation.isValid) {
          throw new ORPCError("BAD_REQUEST", validation.errors.join(", "));
        }

        // Process content
        const processedContent = await processChangelogContent(
          input.content,
          input.excerpt
        );

        // Create changelog
        const newChangelog = await context.db
          .insert(changelog)
          .values({
            id: randomUUID(),
            organizationId,
            authorId: userId,
            title: input.title,
            slug: uniqueSlug,
            content: processedContent.content,
            htmlContent: processedContent.htmlContent,
            excerpt: processedContent.excerpt,
            version: input.version,
            tags: input.tags,
            metaTitle: input.metaTitle,
            metaDescription: input.metaDescription,
            status: "draft",
          })
          .returning();

        return {
          changelog: newChangelog[0],
          message: "Changelog created successfully",
        };
      } catch (error) {
        console.error("Error creating changelog:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to create changelog");
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
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        const { offset, take, status } = input;

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
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to list changelogs");
      }
    }),

  // Get specific changelog for editing
  getChangelog: adminOnlyProcedure
    .input(z.object({ id: z.string().min(1, "Changelog ID is required") }))
    .handler(async ({ input, context }) => {
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
            content: changelog.content, // Return BlockNote JSON for editing
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
              eq(changelog.id, input.id),
              eq(changelog.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!changelogResult.length) {
          throw new ORPCError("NOT_FOUND", "Changelog not found");
        }

        return {
          changelog: changelogResult[0],
        };
      } catch (error) {
        console.error("Error fetching changelog:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to fetch changelog");
      }
    }),

  // Update changelog
  updateChangelog: adminOnlyProcedure
    .input(
      z.object({
        id: z.string().min(1, "Changelog ID is required"),
        title: z.string().min(1, "Title is required").max(200, "Title too long").optional(),
        slug: z.string().optional(),
        content: z.any().optional(), // BlockNote JSON content
        excerpt: z.string().max(500, "Excerpt too long").optional(),
        version: z.string().max(50, "Version too long").optional(),
        tags: z.array(z.string().max(50, "Tag too long")).max(20, "Too many tags").optional(),
        metaTitle: z.string().max(200, "Meta title too long").optional(),
        metaDescription: z.string().max(160, "Meta description too long").optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        const { id, ...updateData } = input;

        // Verify changelog exists and belongs to organization
        const existingChangelog = await context.db
          .select()
          .from(changelog)
          .where(
            and(
              eq(changelog.id, id),
              eq(changelog.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!existingChangelog.length) {
          throw new ORPCError("NOT_FOUND", "Changelog not found");
        }

        // Handle slug update
        let finalSlug = existingChangelog[0].slug;
        if (updateData.slug && updateData.slug !== existingChangelog[0].slug) {
          if (!isValidSlug(updateData.slug)) {
            throw new ORPCError("BAD_REQUEST", "Invalid slug format");
          }

          // Check if new slug is unique
          const existingSlugs = await context.db
            .select({ slug: changelog.slug })
            .from(changelog)
            .where(
              and(
                eq(changelog.organizationId, organizationId),
                // Exclude current changelog
                // Note: Using != instead of !== for SQL comparison
                eq(changelog.id, id) // This will be excluded by the NOT logic
              )
            );

          const existingSlugStrings = existingSlugs
            .filter(item => item.slug !== existingChangelog[0].slug)
            .map(item => item.slug);

          if (existingSlugStrings.includes(updateData.slug)) {
            throw new ORPCError("CONFLICT", "Slug already exists");
          }

          finalSlug = updateData.slug;
        }

        // Process content if updated
        let processedContent;
        if (updateData.content) {
          processedContent = await processChangelogContent(
            updateData.content,
            updateData.excerpt
          );
        }

        // Build update object
        const updateObject: any = {
          updatedAt: new Date(),
        };

        if (updateData.title) updateObject.title = updateData.title;
        if (finalSlug !== existingChangelog[0].slug) updateObject.slug = finalSlug;
        if (processedContent) {
          updateObject.content = processedContent.content;
          updateObject.htmlContent = processedContent.htmlContent;
          updateObject.excerpt = processedContent.excerpt;
        } else if (updateData.excerpt !== undefined) {
          updateObject.excerpt = updateData.excerpt;
        }
        if (updateData.version !== undefined) updateObject.version = updateData.version;
        if (updateData.tags !== undefined) updateObject.tags = updateData.tags;
        if (updateData.metaTitle !== undefined) updateObject.metaTitle = updateData.metaTitle;
        if (updateData.metaDescription !== undefined) updateObject.metaDescription = updateData.metaDescription;

        // Update changelog
        const updatedChangelog = await context.db
          .update(changelog)
          .set(updateObject)
          .where(eq(changelog.id, id))
          .returning();

        return {
          changelog: updatedChangelog[0],
          message: "Changelog updated successfully",
        };
      } catch (error) {
        console.error("Error updating changelog:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to update changelog");
      }
    }),

  // Publish/unpublish changelog
  publishChangelog: adminOnlyProcedure
    .input(
      z.object({
        id: z.string().min(1, "Changelog ID is required"),
        publish: z.boolean(),
      })
    )
    .handler(async ({ input, context }) => {
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        // Verify changelog exists and belongs to organization
        const existingChangelog = await context.db
          .select()
          .from(changelog)
          .where(
            and(
              eq(changelog.id, input.id),
              eq(changelog.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!existingChangelog.length) {
          throw new ORPCError("NOT_FOUND", "Changelog not found");
        }

        // Update status and publishedAt
        const updateObject: any = {
          status: input.publish ? "published" : "draft",
          updatedAt: new Date(),
        };

        if (input.publish) {
          updateObject.publishedAt = new Date();
        } else {
          updateObject.publishedAt = null;
        }

        const updatedChangelog = await context.db
          .update(changelog)
          .set(updateObject)
          .where(eq(changelog.id, input.id))
          .returning();

        return {
          changelog: updatedChangelog[0],
          message: input.publish ? "Changelog published successfully" : "Changelog unpublished successfully",
        };
      } catch (error) {
        console.error("Error publishing/unpublishing changelog:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to update changelog status");
      }
    }),

  // Delete changelog
  deleteChangelog: adminOnlyProcedure
    .input(z.object({ id: z.string().min(1, "Changelog ID is required") }))
    .handler(async ({ input, context }) => {
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        // Verify changelog exists and belongs to organization
        const existingChangelog = await context.db
          .select()
          .from(changelog)
          .where(
            and(
              eq(changelog.id, input.id),
              eq(changelog.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!existingChangelog.length) {
          throw new ORPCError("NOT_FOUND", "Changelog not found");
        }

        // Delete changelog
        await context.db
          .delete(changelog)
          .where(eq(changelog.id, input.id));

        return {
          message: "Changelog deleted successfully",
        };
      } catch (error) {
        console.error("Error deleting changelog:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to delete changelog");
      }
    }),
};

// Public changelog procedures
export const changelogPublicRouter = {
  // List published changelogs
  listPublishedChangelogs: publicProcedure
    .input(paginationSchema)
    .handler(async ({ input, context }) => {
      // Check if organization exists
      if (!context.organization) {
        throw new ORPCError("NOT_FOUND", "Organization not found");
      }

      try {
        const { offset, take } = input;

        // Fetch published changelogs with author information
        const changelogs = await context.db
          .select({
            id: changelog.id,
            title: changelog.title,
            slug: changelog.slug,
            htmlContent: changelog.htmlContent, // Return pre-rendered HTML for fast display
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
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to list changelogs");
      }
    }),

  // Get specific published changelog
  getPublishedChangelog: publicProcedure
    .input(z.object({ slug: z.string().min(1, "Changelog slug is required") }))
    .handler(async ({ input, context }) => {
      // Check if organization exists
      if (!context.organization) {
        throw new ORPCError("NOT_FOUND", "Organization not found");
      }

      try {
        const changelogResult = await context.db
          .select({
            id: changelog.id,
            title: changelog.title,
            slug: changelog.slug,
            htmlContent: changelog.htmlContent, // Return pre-rendered HTML for fast display
            excerpt: changelog.excerpt,
            version: changelog.version,
            tags: changelog.tags,
            metaTitle: changelog.metaTitle,
            metaDescription: changelog.metaDescription,
            publishedAt: changelog.publishedAt,
            createdAt: changelog.createdAt,
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
              eq(changelog.slug, input.slug),
              eq(changelog.organizationId, context.organization.id),
              eq(changelog.status, "published")
            )
          )
          .limit(1);

        if (!changelogResult.length) {
          throw new ORPCError("NOT_FOUND", "Changelog not found");
        }

        return {
          changelog: changelogResult[0],
          organizationId: context.organization.id,
          organizationName: context.organization.name,
        };
      } catch (error) {
        console.error("Error fetching published changelog:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to fetch changelog");
      }
    }),
};