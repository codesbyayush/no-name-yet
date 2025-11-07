import { ORPCError } from '@orpc/server';
import { z } from 'zod';
import {
  createAdminPost,
  deleteAdminPost,
  getAdminAllPosts,
  getAdminDetailedPosts,
  getAdminDetailedSinglePost,
  updateAdminPost,
} from '@/dal/posts';
import { adminOnlyProcedure } from '../procedures';

const DEFAULT_TAKE = 20;
const MAX_TAKE = 100;

export const postsRouter = {
  getDetailedPosts: adminOnlyProcedure
    .input(
      z.object({
        offset: z.number().min(0).default(0),
        take: z.number().min(1).max(MAX_TAKE).default(DEFAULT_TAKE),
        sortBy: z.enum(['newest', 'oldest', 'most_voted']).default('newest'),
        boardId: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { offset, take, sortBy, boardId } = input;
      if (!context.organization) {
        throw new ORPCError('NOT_FOUND');
      }
      const userId = context.session?.user?.id;
      const { posts, hasMore } = await getAdminDetailedPosts(
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
        organizationId: context.organization.id,
        organizationName: context.organization.name,
        pagination: {
          offset,
          take,
          hasMore,
        },
      };
    }),

  getDetailedSinglePost: adminOnlyProcedure
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
      const post = await getAdminDetailedSinglePost(
        context.db,
        feedbackId,
        userId,
      );
      return {
        post,
        organizationId: context.organization.id,
        organizationName: context.organization.name,
      };
    }),

  // Standard post CRUD from public/posts.ts
  create: adminOnlyProcedure
    .input(
      z.object({
        boardId: z.string().optional(),
        type: z.enum(['bug', 'suggestion']).default('bug'),
        title: z.string(),
        description: z.string().min(1),
        priority: z
          .enum([
            'low',
            'medium',
            'high',
            'urgent',
            'no_priority',
            'no-priority',
          ])
          .default('no_priority'),
        tags: z.array(z.string()).default([]),
        status: z
          .enum([
            'to-do',
            'in-progress',
            'completed',
            'backlog',
            'technical-review',
            'paused',
          ])
          .default('to-do'),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const userId = context.session?.user.id;
      const teamId = context.session?.session.activeTeamId;
      if (!userId) {
        throw new ORPCError('UNAUTHORIZED');
      }
      if (!teamId) {
        throw new ORPCError('NOT_FOUND');
      }
      const newPost = await createAdminPost(context.db, input, userId, teamId);
      return newPost;
    }),

  update: adminOnlyProcedure
    .input(
      z.object({
        id: z.string(),
        title: z.string().optional(),
        description: z.string().min(1).optional(),
        status: z
          .enum([
            'to-do',
            'in-progress',
            'completed',
            'backlog',
            'technical-review',
            'paused',
            'pending',
          ])
          .optional(),
        priority: z
          .enum([
            'low',
            'medium',
            'high',
            'urgent',
            'no_priority',
            'no-priority',
          ])
          .optional(),
        tags: z.array(z.string()).optional(),
        url: z.string().optional(),
        userAgent: z.string().optional(),
        browserInfo: z
          .object({
            platform: z.string().optional(),
            language: z.string().optional(),
            cookieEnabled: z.boolean().optional(),
            onLine: z.boolean().optional(),
            screenResolution: z.string().optional(),
          })
          .optional(),
        attachments: z
          .array(
            z.object({
              id: z.string(),
              name: z.string(),
              type: z.string(),
              size: z.number(),
              url: z.string(),
            }),
          )
          .optional(),
        assigneeId: z.string().optional().nullable(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const _userId = context.session?.user.id;
      const updatedPost = await updateAdminPost(context.db, input);
      if (!updatedPost) {
        throw new ORPCError('NOT_FOUND', { message: 'Post not found' });
      }
      return updatedPost;
    }),

  delete: adminOnlyProcedure
    .input(
      z.object({
        id: z.string(),
      }),
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const _userId = context.session?.user.id;
      const deletedPost = await deleteAdminPost(context.db, input.id);
      if (!deletedPost) {
        throw new ORPCError('NOT_FOUND', { message: 'Post not found' });
      }
      return { success: true, deletedPost };
    }),

  getAll: adminOnlyProcedure.handler(async ({ context }) => {
    const posts = await getAdminAllPosts(context.db);
    return posts;
  }),
};
