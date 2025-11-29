import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import { pagination } from '@/config';
import {
  createPublicPost,
  deletePublicPost,
  getPublicPost,
  getPublicPosts,
} from '@/services/posts';
import { protectedProcedure } from '../procedures';

export const postsRouter = {
  getDetailedPosts: protectedProcedure
    .input(
      z.object({
        offset: z.number().min(0).default(pagination.defaultOffset),
        take: z
          .number()
          .min(1)
          .max(pagination.maxLimit)
          .default(pagination.defaultLimit),
        sortBy: z.enum(['newest', 'oldest']).default('newest'),
        boardId: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { offset, take, sortBy, boardId } = input;
      if (!context.team) {
        throw new ORPCError('NOT_FOUND');
      }
      const userId = context.session?.user?.id;
      const { posts, hasMore } = await getPublicPosts(
        context.db,
        {
          teamId: context.team.id,
          boardId,
          offset,
          take,
          sortBy,
        },
        userId,
      );
      return {
        posts,
        teamName: context.team.name,
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
      if (!(context.team && feedbackId)) {
        throw new ORPCError('NOT_FOUND');
      }
      const userId = context.session?.user?.id;
      const post = await getPublicPost(context.db, feedbackId, userId);
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

    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;
      if (!userId) {
        throw new ORPCError('UNAUTHORIZED');
      }
      return await createPublicPost(context.db, input, userId);
    }),

  delete: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
      }),
    )

    .handler(async ({ input, context }) => {
      const deletedPost = await deletePublicPost(context.db, input.feedbackId);
      if (!deletedPost) {
        throw new ORPCError('NOT_FOUND', { message: 'Post not found' });
      }
      return { success: true, deletedPost };
    }),
};
