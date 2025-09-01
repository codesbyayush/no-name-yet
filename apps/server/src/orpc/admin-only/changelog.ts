import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { ORPCError } from '@orpc/server';
import { and, asc, count, desc, eq, inArray } from 'drizzle-orm';
import { changelog, tags, user } from '../../db/schema';
import { adminOnlyProcedure } from '../procedures';
import {
  createChangelogSchema,
  deleteChangelogSchema,
  getAllChangelogsSchema,
  getChangelogSchema,
  updateAllChangelogsSchema,
  updateChangelogSchema,
} from '../public/schemas';

// Helper functions
const generateSlug = (title: string): string => {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
    .replace(/\s+/g, '-') // Replace spaces with hyphens
    .replace(/-+/g, '-') // Replace multiple hyphens with single
    .trim();
};

const ensureUniqueSlug = async (
  db: any, // TODO: Type this properly with Drizzle DB type
  organizationId: string,
  baseSlug: string,
  excludeId?: string
): Promise<string> => {
  let slug = baseSlug;
  let counter = 0;

  while (true) {
    const whereConditions = [
      eq(changelog.organizationId, organizationId),
      eq(changelog.slug, slug),
    ];

    if (excludeId) {
      whereConditions.push(eq(changelog.id, excludeId));
    }

    const existing = await db
      .select({ id: changelog.id })
      .from(changelog)
      .where(and(...whereConditions))
      .limit(1);

    if (existing.length === 0) {
      break;
    }

    counter++;
    slug = `${baseSlug}-${counter}`;
  }

  return slug;
};

export const changelogAdminRouter = adminOnlyProcedure.router({
  // CREATE - Add new changelog
  add: adminOnlyProcedure
    .input(createChangelogSchema)
    .handler(async ({ input, context }) => {
      const userId = context.session?.user?.id;
      const organizationId = context.organization?.id;

      if (!(userId && organizationId)) {
        throw new ORPCError('UNAUTHORIZED');
      }

      try {
        // Generate slug if not provided
        let slug = input.slug;
        if (!slug && input.title) {
          slug = generateSlug(input.title);
        }

        if (!slug) {
          throw new ORPCError('BAD_REQUEST');
        }

        // Ensure slug is unique
        const finalSlug = await ensureUniqueSlug(
          context.db,
          organizationId,
          slug
        );

        // Generate HTML content from blocks if content is provided
        let htmlContent = input.htmlContent;
        if (input.content && !htmlContent) {
          try {
            const editor = ServerBlockNoteEditor.create();
            htmlContent = await editor.blocksToFullHTML(input.content);
          } catch (_error) {
            // Log warning for HTML generation failure but continue
          }
        }

        // Set publishedAt if status is published and not provided
        let publishedAt = input.publishedAt;
        if (input.status === 'published' && !publishedAt) {
          publishedAt = new Date();
        }

        const newChangelog = await context.db
          .insert(changelog)
          .values({
            organizationId,
            title: input.title,
            slug: finalSlug,
            content: input.content,
            htmlContent,
            status: input.status,
            publishedAt,
            authorId: userId,
            tagId: input.tagId,
          })
          .returning();

        return {
          success: true,
          data: newChangelog[0],
          message: 'Changelog created successfully',
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  // READ - Get single changelog
  get: adminOnlyProcedure
    .input(getChangelogSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError('UNAUTHORIZED');
      }

      try {
        const result = await context.db
          .select({
            id: changelog.id,
            organizationId: changelog.organizationId,
            title: changelog.title,
            slug: changelog.slug,
            content: changelog.content,
            htmlContent: changelog.htmlContent,
            excerpt: changelog.excerpt,
            status: changelog.status,
            publishedAt: changelog.publishedAt,
            authorId: changelog.authorId,
            tagId: changelog.tagId,
            createdAt: changelog.createdAt,
            updatedAt: changelog.updatedAt,
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
            tag: {
              id: tags.id,
              name: tags.name,
            },
          })
          .from(changelog)
          .leftJoin(user, eq(changelog.authorId, user.id))
          .leftJoin(tags, eq(changelog.tagId, tags.id))
          .where(
            and(
              eq(changelog.id, input.id),
              eq(changelog.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!result.length) {
          throw new ORPCError('NOT_FOUND');
        }

        return {
          success: true,
          data: result[0],
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  // READ - Get all changelogs with filtering
  getAll: adminOnlyProcedure
    .input(getAllChangelogsSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError('UNAUTHORIZED');
      }

      try {
        const whereConditions = [eq(changelog.organizationId, organizationId)];

        if (input.status) {
          whereConditions.push(eq(changelog.status, input.status));
        }

        if (input.tagId) {
          whereConditions.push(eq(changelog.tagId, input.tagId));
        }

        // Determine sort order
        let orderBy: any; // TODO: Type this properly with Drizzle order type
        switch (input.sortBy) {
          case 'oldest':
            orderBy = asc(changelog.createdAt);
            break;
          case 'title':
            orderBy = asc(changelog.title);
            break;
          default:
            orderBy = desc(changelog.createdAt);
            break;
        }

        const results = await context.db
          .select({
            id: changelog.id,
            title: changelog.title,
            slug: changelog.slug,
            excerpt: changelog.excerpt,
            status: changelog.status,
            publishedAt: changelog.publishedAt,
            createdAt: changelog.createdAt,
            updatedAt: changelog.updatedAt,
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
            tag: {
              id: tags.id,
              name: tags.name,
            },
          })
          .from(changelog)
          .leftJoin(user, eq(changelog.authorId, user.id))
          .leftJoin(tags, eq(changelog.tagId, tags.id))
          .where(and(...whereConditions))
          .orderBy(orderBy)
          .offset(input.offset)
          .limit(input.limit);

        // Get total count
        const totalCountResult = await context.db
          .select({ count: count() })
          .from(changelog)
          .where(and(...whereConditions));

        const totalCount = totalCountResult[0]?.count || 0;

        return {
          success: true,
          data: results,
          pagination: {
            offset: input.offset,
            limit: input.limit,
            total: totalCount,
            hasMore: input.offset + input.limit < totalCount,
          },
        };
      } catch (_error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  // UPDATE - Update single changelog
  update: adminOnlyProcedure
    .input(updateChangelogSchema)
    .handler(async ({ input, context }) => {
      const { id, ...updates } = input;
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError('UNAUTHORIZED');
      }

      try {
        // Verify changelog exists and belongs to organization
        const existing = await context.db
          .select({
            id: changelog.id,
            slug: changelog.slug,
            status: changelog.status,
          })
          .from(changelog)
          .where(
            and(
              eq(changelog.id, id),
              eq(changelog.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!existing.length) {
          throw new ORPCError('NOT_FOUND');
        }

        const updateValues: any = {
          updatedAt: new Date(),
        };

        // Handle slug update with uniqueness check
        if (updates.slug && updates.slug !== existing[0].slug) {
          updateValues.slug = await ensureUniqueSlug(
            context.db,
            organizationId,
            updates.slug,
            id
          );
        }

        // Handle content update and HTML generation
        if (updates.content !== undefined) {
          updateValues.content = updates.content;

          if (!updates.htmlContent) {
            try {
              const editor = ServerBlockNoteEditor.create();
              updateValues.htmlContent = await editor.blocksToFullHTML(
                updates.content
              );
            } catch (_error) {}
          }
        }

        if (updates.htmlContent !== undefined) {
          updateValues.htmlContent = updates.htmlContent;
        }

        // Handle status change and publishedAt
        if (updates.status !== undefined) {
          updateValues.status = updates.status;

          if (
            updates.status === 'published' &&
            existing[0].status !== 'published'
          ) {
            updateValues.publishedAt = updates.publishedAt || new Date();
          } else if (updates.status !== 'published') {
            updateValues.publishedAt = null;
          }
        }

        // Handle explicit publishedAt update
        if (updates.publishedAt !== undefined) {
          updateValues.publishedAt = updates.publishedAt;
        }

        // Add other direct updates
        const directUpdateFields = [
          'title',
          'excerpt',
          'tagId',
          'metaTitle',
          'metaDescription',
        ];
        for (const field of directUpdateFields) {
          if (updates[field as keyof typeof updates] !== undefined) {
            updateValues[field] = updates[field as keyof typeof updates];
          }
        }

        const updatedChangelog = await context.db
          .update(changelog)
          .set(updateValues)
          .where(eq(changelog.id, id))
          .returning();

        return {
          success: true,
          data: updatedChangelog[0],
          message: 'Changelog updated successfully',
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  // UPDATE - Update multiple changelogs
  updateAll: adminOnlyProcedure
    .input(updateAllChangelogsSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError('UNAUTHORIZED');
      }

      try {
        // Verify all changelogs exist and belong to organization
        const existing = await context.db
          .select({ id: changelog.id, status: changelog.status })
          .from(changelog)
          .where(
            and(
              inArray(changelog.id, input.ids),
              eq(changelog.organizationId, organizationId)
            )
          );

        if (existing.length !== input.ids.length) {
          throw new ORPCError('NOT_FOUND');
        }

        const updateValues: Record<string, any> = {
          updatedAt: new Date(),
        };

        // Handle status update with publishedAt logic
        if (input.updates.status !== undefined) {
          updateValues.status = input.updates.status;

          if (input.updates.status === 'published') {
            updateValues.publishedAt = input.updates.publishedAt || new Date();
          } else if (
            input.updates.status === 'draft' ||
            input.updates.status === 'archived'
          ) {
            updateValues.publishedAt = null;
          }
        }

        // Handle explicit publishedAt update
        if (input.updates.publishedAt !== undefined) {
          updateValues.publishedAt = input.updates.publishedAt;
        }

        // Handle tagId update
        if (input.updates.tagId !== undefined) {
          updateValues.tagId = input.updates.tagId;
        }

        const updatedChangelogs = await context.db
          .update(changelog)
          .set(updateValues)
          .where(
            and(
              inArray(changelog.id, input.ids),
              eq(changelog.organizationId, organizationId)
            )
          )
          .returning();

        return {
          success: true,
          data: updatedChangelogs,
          message: `${updatedChangelogs.length} changelogs updated successfully`,
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  // DELETE - Delete single changelog
  delete: adminOnlyProcedure
    .input(deleteChangelogSchema)
    .handler(async ({ input, context }) => {
      const organizationId = context.organization?.id;

      if (!organizationId) {
        throw new ORPCError('UNAUTHORIZED');
      }

      try {
        // Verify changelog exists and belongs to organization
        const existing = await context.db
          .select({ id: changelog.id })
          .from(changelog)
          .where(
            and(
              eq(changelog.id, input.id),
              eq(changelog.organizationId, organizationId)
            )
          )
          .limit(1);

        if (!existing.length) {
          throw new ORPCError('NOT_FOUND');
        }

        await context.db.delete(changelog).where(eq(changelog.id, input.id));

        return {
          success: true,
          message: 'Changelog deleted successfully',
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
});
