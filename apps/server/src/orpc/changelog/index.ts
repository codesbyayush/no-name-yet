import { randomUUID } from "crypto";
import { ORPCError } from "@orpc/server";
import { and, desc, eq, count, asc } from "drizzle-orm";
import { z } from "zod";
import { changelog, user } from "../../db/schema";
import { 
  blockNoteToHTML, 
  generateSlug, 
  generateExcerpt, 
  validateBlockNoteContent, 
  validateChangelogMetadata,
  ensureUniqueSlug 
} from "../../utils/changelog";
import { adminOnlyProcedure, publicProcedure } from "../procedures";

// Pagination schema
const paginationSchema = z.object({
  offset: z.number().min(0).default(0),
  take: z.number().min(1).max(100).default(20),
});

// Admin changelog procedures
export const changelogAdminRouter = {
  // Create new changelog
  createChangelog: adminOnlyProcedure
    .input(z.object({
      title: z.string().min(1).max(200),
      slug: z.string().min(1).max(100).optional(),
      content: z.any(), // BlockNote JSON content
      excerpt: z.string().max(500).optional(),
      version: z.string().max(50).optional(),
      tags: z.array(z.string().max(50)).max(10).default([]),
      metaTitle: z.string().max(200).optional(),
      metaDescription: z.string().max(500).optional(),
    }))
    .handler(async ({ input, context }) => {
      const userId = context.session?.user?.id;
      const organizationId = context.organization?.id;

      if (!userId || !organizationId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        // Validate BlockNote content
        const contentValidation = validateBlockNoteContent(input.content);
        if (!contentValidation.isValid) {
          throw new ORPCError("BAD_REQUEST", contentValidation.error);
        }

        // Generate slug if not provided
        let slug = input.slug || generateSlug(input.title);
        
        // Ensure slug uniqueness within organization
        const existingSlugs = await context.db
          .select({ slug: changelog.slug })
          .from(changelog)
          .where(eq(changelog.organizationId, organizationId));
        
        slug = ensureUniqueSlug(slug, existingSlugs.map(s => s.slug));

        // Validate metadata
        const metadataValidation = validateChangelogMetadata({
          title: input.title,
          slug,
          excerpt: input.excerpt,
          version: input.version,
          tags: input.tags,
        });

        if (!metadataValidation.isValid) {
          throw new ORPCError("BAD_REQUEST", metadataValidation.errors.join(", "));
        }

        // Generate HTML content and excerpt
        const htmlContent = blockNoteToHTML(input.content);
        const excerpt = input.excerpt || generateExcerpt(input.content);

        // Create changelog
        const newChangelog = await context.db
          .insert(changelog)
          .values({
            id: randomUUID(),
            organizationId,
            authorId: userId,
            title: input.title,
            slug,
            content: input.content,
            htmlContent,
            excerpt,
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
    .input(z.object({
      ...paginationSchema.shape,
      status: z.enum(["draft", "published", "archived"]).optional(),
    }))
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
    .input(z.object({ id: z.string() }))
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
        console.error("Error getting changelog:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to get changelog");
      }
    }),

  // Update changelog
  updateChangelog: adminOnlyProcedure
    .input(z.object({
      id: z.string(),
      title: z.string().min(1).max(200).optional(),
      slug: z.string().min(1).max(100).optional(),
      content: z.any().optional(), // BlockNote JSON content
      excerpt: z.string().max(500).optional(),
      version: z.string().max(50).optional(),
      tags: z.array(z.string().max(50)).max(10).optional(),
      metaTitle: z.string().max(200).optional(),
      metaDescription: z.string().max(500).optional(),
    }))
    .handler(async ({ input, context }) => {
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        const { id, ...updates } = input;

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

        // Prepare update data
        const updateData: any = {
          updatedAt: new Date(),
        };

        // Handle content update
        if (updates.content) {
          const contentValidation = validateBlockNoteContent(updates.content);
          if (!contentValidation.isValid) {
            throw new ORPCError("BAD_REQUEST", contentValidation.error);
          }
          updateData.content = updates.content;
          updateData.htmlContent = blockNoteToHTML(updates.content);
        }

        // Handle other updates
        if (updates.title) updateData.title = updates.title;
        if (updates.excerpt) updateData.excerpt = updates.excerpt;
        if (updates.version) updateData.version = updates.version;
        if (updates.tags) updateData.tags = updates.tags;
        if (updates.metaTitle) updateData.metaTitle = updates.metaTitle;
        if (updates.metaDescription) updateData.metaDescription = updates.metaDescription;

        // Handle slug update with uniqueness check
        if (updates.slug) {
          const existingSlugs = await context.db
            .select({ slug: changelog.slug })
            .from(changelog)
            .where(
              and(
                eq(changelog.organizationId, organizationId),
                // Exclude current changelog from uniqueness check
                // Note: Using != instead of <> for compatibility
                eq(changelog.id, id) // This will be excluded in the filter
              )
            );
          
          // Filter out current changelog's slug
          const otherSlugs = existingSlugs
            .map(s => s.slug)
            .filter(s => s !== existingChangelog[0].slug);
          
          updateData.slug = ensureUniqueSlug(updates.slug, otherSlugs);
        }

        // Validate metadata if any metadata fields are being updated
        if (updates.title || updates.slug || updates.excerpt || updates.version || updates.tags) {
          const metadataToValidate = {
            title: updates.title || existingChangelog[0].title,
            slug: updateData.slug || existingChangelog[0].slug,
            excerpt: updates.excerpt || existingChangelog[0].excerpt,
            version: updates.version || existingChangelog[0].version,
            tags: updates.tags || existingChangelog[0].tags,
          };

          const metadataValidation = validateChangelogMetadata(metadataToValidate);
          if (!metadataValidation.isValid) {
            throw new ORPCError("BAD_REQUEST", metadataValidation.errors.join(", "));
          }
        }

        // Update changelog
        const updatedChangelog = await context.db
          .update(changelog)
          .set(updateData)
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
    .input(z.object({
      id: z.string(),
      publish: z.boolean(),
    }))
    .handler(async ({ input, context }) => {
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        const { id, publish } = input;

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

        // Validate required fields for publishing
        if (publish) {
          const current = existingChangelog[0];
          if (!current.title || !current.content) {
            throw new ORPCError("BAD_REQUEST", "Title and content are required for publishing");
          }
        }

        // Update status and publishedAt
        const updateData: any = {
          status: publish ? "published" : "draft",
          publishedAt: publish ? new Date() : null,
          updatedAt: new Date(),
        };

        const updatedChangelog = await context.db
          .update(changelog)
          .set(updateData)
          .where(eq(changelog.id, id))
          .returning();

        return {
          changelog: updatedChangelog[0],
          message: publish ? "Changelog published successfully" : "Changelog unpublished successfully",
        };
      } catch (error) {
        console.error("Error publishing changelog:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to publish changelog");
      }
    }),

  // Delete changelog
  deleteChangelog: adminOnlyProcedure
    .input(z.object({ id: z.string() }))
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
    .input(z.object({ slug: z.string() }))
    .handler(async ({ input, context }) => {
      if (!context.organization) {
        throw new ORPCError("NOT_FOUND", "Organization not found");
      }

      try {
        const changelogResult = await context.db
          .select({
            id: changelog.id,
            title: changelog.title,
            slug: changelog.slug,
            htmlContent: changelog.htmlContent, // Return pre-rendered HTML
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
        console.error("Error getting published changelog:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR", "Failed to get changelog");
      }
    }),
};