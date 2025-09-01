import { ORPCError } from '@orpc/server';
import { and, asc, count, desc, eq } from 'drizzle-orm';
import { changelog, tags, user } from '../../db/schema';
import { publicProcedure } from '../procedures';
import {
  publicGetChangelogBySlugSchema,
  publicGetChangelogsSchema,
} from './schemas';

export const changelogPublicRouter = publicProcedure.router({
  // Get published changelogs
  getPublished: publicProcedure
    .input(publicGetChangelogsSchema)
    .handler(async ({ input, context }) => {
      if (!context.organization) {
        throw new ORPCError('NOT_FOUND');
      }

      try {
        const whereConditions = [
          eq(changelog.organizationId, context.organization.id),
          eq(changelog.status, 'published'),
        ];

        if (input.tagId) {
          whereConditions.push(eq(changelog.tagId, input.tagId));
        }

        // Determine sort order
        let orderBy: any; // TODO: Type this properly with Drizzle order type
        switch (input.sortBy) {
          case 'oldest':
            orderBy = asc(changelog.publishedAt);
            break;
          case 'title':
            orderBy = asc(changelog.title);
            break;
          default:
            orderBy = desc(changelog.publishedAt);
            break;
        }

        const results = await context.db
          .select({
            id: changelog.id,
            title: changelog.title,
            slug: changelog.slug,
            htmlContent: changelog.htmlContent,
            excerpt: changelog.excerpt,
            publishedAt: changelog.publishedAt,
            metaTitle: changelog.metaTitle,
            metaDescription: changelog.metaDescription,
            author: {
              id: user.id,
              name: user.name,
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
        const result = await context.db
          .select({
            id: changelog.id,
            title: changelog.title,
            slug: changelog.slug,
            htmlContent: changelog.htmlContent,
            excerpt: changelog.excerpt,
            publishedAt: changelog.publishedAt,
            metaTitle: changelog.metaTitle,
            metaDescription: changelog.metaDescription,
            author: {
              id: user.id,
              name: user.name,
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
              eq(changelog.organizationId, context.organization.id),
              eq(changelog.slug, input.slug),
              eq(changelog.status, 'published')
            )
          )
          .limit(1);

        if (!result.length) {
          throw new ORPCError('NOT_FOUND');
        }

        return {
          success: true,
          data: result[0],
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
