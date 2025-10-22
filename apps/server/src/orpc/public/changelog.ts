import { ORPCError } from '@orpc/server';
import { getPublished, getPublishedBySlug } from '@/dal/changelog';
import { publicProcedure } from '../procedures';
import {
  publicGetChangelogBySlugSchema,
  publicGetChangelogsSchema,
} from './schemas';

export const changelogPublicRouter = publicProcedure.router({
  getPublished: publicProcedure
    .input(publicGetChangelogsSchema)
    .handler(async ({ input, context }) => {
      if (!context.organization) {
        throw new ORPCError('NOT_FOUND');
      }

      try {
        const { rows, totalCount } = await getPublished(
          context.db,
          context.organization.id,
          input
        );
        return {
          success: true,
          data: rows,
          organization: {
            id: context.organization.id,
            name: context.organization.name,
          },
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

  // Get single published changelog by slug
  getBySlug: publicProcedure
    .input(publicGetChangelogBySlugSchema)
    .handler(async ({ input, context }) => {
      if (!context.organization) {
        throw new ORPCError('NOT_FOUND');
      }

      try {
        const row = await getPublishedBySlug(
          context.db,
          context.organization.id,
          input.slug
        );
        if (!row) {
          throw new ORPCError('NOT_FOUND');
        }
        return {
          success: true,
          data: row,
          organization: {
            id: context.organization.id,
            name: context.organization.name,
          },
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),
});
