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

type ChangelogUpdates = {
  slug?: string;
  content?: unknown;
  htmlContent?: string | null;
  status?: 'draft' | 'published' | 'archived' | string;
  publishedAt?: Date | string | null;
  title?: string;
  excerpt?: string | null;
  tagId?: string | null;
  metaTitle?: string | null;
  metaDescription?: string | null;
};

type DbType = Parameters<typeof ensureUniqueSlug>[0];

async function applySlugUpdate(params: {
  updates: ChangelogUpdates;
  existing: { id: string; slug: string };
  organizationId: string;
  db: DbType;
  accumulator: Record<string, unknown>;
}) {
  const { updates, existing, organizationId, db, accumulator } = params;
  if (updates.slug && updates.slug !== existing.slug) {
    accumulator.slug = await ensureUniqueSlug(
      db,
      organizationId,
      updates.slug,
      existing.id,
    );
  }
}

async function applyContentUpdates(params: {
  updates: ChangelogUpdates;
  accumulator: Record<string, unknown>;
}) {
  const { updates, accumulator } = params;
  if (updates.content !== undefined) {
    accumulator.content = updates.content;
    if (!updates.htmlContent && Array.isArray(updates.content)) {
      const editor = ServerBlockNoteEditor.create();
      accumulator.htmlContent = await editor
        .blocksToFullHTML(updates.content)
        .then((s) => s)
        .catch(() => accumulator.htmlContent);
    }
  }
}

function applyHtmlUpdate(params: {
  updates: ChangelogUpdates;
  accumulator: Record<string, unknown>;
}) {
  const { updates, accumulator } = params;
  if (updates.htmlContent !== undefined) {
    accumulator.htmlContent = updates.htmlContent;
  }
}

function applyStatusAndPublishedAt(params: {
  updates: ChangelogUpdates;
  existingStatus: string;
  accumulator: Record<string, unknown>;
}) {
  const { updates, existingStatus, accumulator } = params;
  if (updates.status !== undefined) {
    accumulator.status = updates.status;
    if (updates.status === 'published' && existingStatus !== 'published') {
      accumulator.publishedAt = updates.publishedAt || new Date();
    } else if (updates.status !== 'published') {
      accumulator.publishedAt = null;
    }
  }
}

function applyPublishedAtOverride(params: {
  updates: ChangelogUpdates;
  accumulator: Record<string, unknown>;
}) {
  const { updates, accumulator } = params;
  if (updates.publishedAt !== undefined) {
    accumulator.publishedAt = updates.publishedAt;
  }
}

function applyDirectFields(params: {
  updates: ChangelogUpdates;
  accumulator: Record<string, unknown>;
}) {
  const { updates, accumulator } = params;
  const directUpdateFields = [
    'title',
    'excerpt',
    'tagId',
    'metaTitle',
    'metaDescription',
  ] as const;
  for (const field of directUpdateFields) {
    if (updates[field] !== undefined) {
      accumulator[field] = updates[field];
    }
  }
}

async function computeUpdateValues(options: {
  updates: ChangelogUpdates;
  existing: { id: string; slug: string; status: string };
  organizationId: string;
  db: DbType;
}) {
  const { updates, existing, organizationId, db } = options;
  const updateValues: Record<string, unknown> = { updatedAt: new Date() };

  await applySlugUpdate({
    updates,
    existing: { id: existing.id, slug: existing.slug },
    organizationId,
    db,
    accumulator: updateValues,
  });

  await applyContentUpdates({ updates, accumulator: updateValues });
  applyHtmlUpdate({ updates, accumulator: updateValues });
  applyStatusAndPublishedAt({
    updates,
    existingStatus: existing.status,
    accumulator: updateValues,
  });
  applyPublishedAtOverride({ updates, accumulator: updateValues });
  applyDirectFields({ updates, accumulator: updateValues });

  return updateValues;
}

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
          slug,
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
          input.id,
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
          input,
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

        const updateValues = await computeUpdateValues({
          updates,
          existing: { id, slug: existing.slug, status: existing.status },
          organizationId,
          db: context.db,
        });

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
              eq(changelog.organizationId, organizationId),
            ),
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
          updateValues,
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
              eq(changelog.organizationId, organizationId),
            ),
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
