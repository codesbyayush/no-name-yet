import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import {
  createPublicPost,
  deletePublicPost,
  getPostById,
  getPostsWithAggregates,
} from '@/dal/posts';
import { protectedProcedure } from '../procedures';

const DEFAULT_TAKE = 20;
const MAX_TAKE = 100;

export const postsRouter = {
  getDetailedPosts: protectedProcedure
    .input(
      z.object({
        offset: z.number().min(0).default(0),
        take: z.number().min(1).max(MAX_TAKE).default(DEFAULT_TAKE),
        sortBy: z.enum(['newest', 'oldest']).default('newest'),
        boardId: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { offset, take, sortBy, boardId } = input;
      if (!context.organization) {
        throw new ORPCError('NOT_FOUND');
      }
      const userId = context.session?.user?.id;
      const { posts, hasMore } = await getPostsWithAggregates(
        context.db,
        {
          organizationId: context.organization.id,
          boardId,
          offset,
          take,
          sortBy,
        },
        userId,
      );
      return {
        posts,
        organizationName: context.organization.name,
        pagination: {
          offset,
          take,
          hasMore,
        },
      };
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
        throw new ORPCError('NOT_FOUND');
      }
      const userId = context.session?.user?.id;
      const post = await getPostById(context.db, feedbackId, userId);
      return post;
    }),

  create: protectedProcedure
    .input(
      z.object({
        boardId: z.string(),
        title: z.string(),
        description: z.string().min(1),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;
      if (!userId) {
        throw new ORPCError('UNAUTHORIZED');
      }
      return await createPublicPost(context.db, input, userId);
    }),

  update: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
        title: z.string().optional(),
        description: z.string().min(1).optional(),
      }),
    )
    .output(z.any())
    .handler(() => 'will implement'),

  delete: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const deletedPost = await deletePublicPost(context.db, input.feedbackId);
      if (!deletedPost) {
        throw new ORPCError('NOT_FOUND', { message: 'Post not found' });
      }
      return { success: true, deletedPost };
    }),
};
