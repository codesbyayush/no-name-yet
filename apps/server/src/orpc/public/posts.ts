import { ORPCError } from '@orpc/client';
import { and, asc, count, desc, eq, exists, type SQL, sql } from 'drizzle-orm';
import { z } from 'zod';
import { boards, feedback, user, votes } from '@/db/schema';
import { protectedProcedure } from '../procedures';

export const postsRouter = {
  getDetailedPosts: protectedProcedure
    .input(
      z.object({
        offset: z.number().min(0).default(0),
        take: z.number().min(1).max(100).default(20),
        sortBy: z.enum(['newest', 'oldest']).default('newest'),
        boardId: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { offset, take, sortBy, boardId } = input;
      if (!context.organization) {
        throw new ORPCError('NOT_FOUND');
      }
      const userId = context.session?.user?.id;
      try {
        let orderBy: SQL<unknown>;
        switch (sortBy) {
          case 'oldest':
            orderBy = asc(feedback.createdAt);
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
            assigneeName: user.name,
            assigneeImage: user.image,
            createdAt: feedback.createdAt,
            board: {
              id: boards.id,
              name: boards.name,
              slug: boards.slug,
            },
            hasVoted: userId
              ? exists(
                  context.db
                    .select()
                    .from(votes)
                    .where(
                      and(
                        eq(votes.feedbackId, feedback.id),
                        eq(votes.userId, userId)
                      )
                    )
                )
              : sql`false`,
          })
          .from(feedback)
          .leftJoin(boards, eq(feedback.boardId, boards.id))
          .where(and(...filters))
          .orderBy(orderBy)
          .offset(offset)
          .limit(take + 1);

        const hasMore = posts.length > take;
        return {
          posts,
          organizationName: context.organization.name,
          pagination: {
            offset,
            take,
            hasMore,
          },
        };
      } catch (_error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  getDetailedSinglePost: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { feedbackId } = input;
      if (!(context.organization && feedbackId)) {
        throw new ORPCError('NOT_FOUND');
      }
      const userId = context.session?.user?.id;
      try {
        const post = await context.db
          .select({
            id: feedback.id,
            title: feedback.title,
            content: feedback.description,
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,
            author: {
              name: user.name,
              image: user.image,
            },
            board: {
              id: boards.id,
              name: boards.name,
              slug: boards.slug,
            },
            hasVoted: userId
              ? exists(
                  context.db
                    .select()
                    .from(votes)
                    .where(
                      and(
                        eq(votes.feedbackId, feedback.id),
                        eq(votes.userId, userId)
                      )
                    )
                )
              : sql`false`,
          })
          .from(feedback)
          .leftJoin(user, eq(feedback.authorId, user.id))
          .leftJoin(boards, eq(feedback.boardId, boards.id))
          .where(eq(feedback.id, feedbackId));
        return {
          post: post[0],
          organizationId: context.organization.id,
          organizationName: context.organization.name,
        };
      } catch (_error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  create: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        title: z.string(),
        description: z.string().min(1),
      })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;
      if (!userId) {
        throw new ORPCError('UNAUTHORIZED');
      }
      try {
        const postsCount = await context.db
          .select({ count: count() })
          .from(feedback)
          .where(eq(feedback.boardId, input.boardId));

        // TODO: Implement a proper issue key generator for concurrent users
        const issueKey = `OF-${postsCount[0]?.count || 0 + 1}`;
        const [newPost] = await context.db
          .insert(feedback)
          .values({
            boardId: input.boardId,
            authorId: userId,
            title: input.title,
            description: input.description,
            issueKey,
            priority: 'no-priority',
          })
          .returning();

        return newPost;
      } catch (_error) {
        throw new ORPCError('INTERNAL_SERVER_ERROR');
      }
    }),

  update: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        title: z.string().optional(),
        description: z.string().min(1).optional(),
      })
    )
    .output(z.any())
    .handler(() => {
      return 'will implement';
    }),

  delete: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
      })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const [deletedPost] = await context.db
        .delete(feedback)
        .where(eq(feedback.id, input.feedbackId))
        .returning();
      if (!deletedPost) {
        throw new Error('Post not found');
      }
      return { success: true, deletedPost };
    }),
};
