import { ServerBlockNoteEditor } from '@blocknote/server-util';
import { ORPCError } from '@orpc/server';
import { and, eq, inArray } from 'drizzle-orm';
import {
  deleteById,
  ensureUniqueSlug,
  getAll,
  getByIdForOrg,
  insert,
  updateById,
  updateManyByIds,
} from '@/dal/changelog';
import { changelog } from '../../db/schema/changelog';
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
          const editor = ServerBlockNoteEditor.create();
          htmlContent = await editor
            .blocksToFullHTML(input.content)
            .then((s) => s)
            .catch(() => htmlContent);
        }

        // Set publishedAt if status is published and not provided
        let publishedAt = input.publishedAt;
        if (input.status === 'published' && !publishedAt) {
          publishedAt = new Date();
        }

        const newRow = await insert(context.db, {
          organizationId,
          title: input.title,
          slug: finalSlug,
          content: input.content,
          htmlContent,
          status: input.status,
          publishedAt,
          authorId: userId,
          tagId: input.tagId,
        });

        return {
          success: true,
          data: newRow,
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
        const result = await getByIdForOrg(
          context.db,
          organizationId,
          input.id
        );

        if (!result) {
          throw new ORPCError('NOT_FOUND');
        }

        return {
          success: true,
          data: result,
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
        const { rows: results, totalCount } = await getAll(
          context.db,
          organizationId,
          input
        );

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
        const existing = await getByIdForOrg(context.db, organizationId, id);
        if (!existing) {
          throw new ORPCError('NOT_FOUND');
        }

        const updateValues: Record<string, unknown> = {
          updatedAt: new Date(),
        };

        // Handle slug update with uniqueness check
        if (updates.slug && updates.slug !== existing.slug) {
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
            const editor = ServerBlockNoteEditor.create();
            updateValues.htmlContent = await editor
              .blocksToFullHTML(updates.content)
              .then((s) => s)
              .catch(() => updateValues.htmlContent);
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
            existing.status !== 'published'
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

        const updated = await updateById(context.db, id, updateValues);

        return {
          success: true,
          data: updated,
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
          .select({ id: changelog.id })
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

        const updateValues: Record<string, unknown> = {
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

        const updatedChangelogs = await updateManyByIds(
          context.db,
          input.ids,
          updateValues
        );

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

        await deleteById(context.db, input.id);

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
