import { ORPCError } from "@orpc/client";
import { z } from "zod";
import {
  createPublicPost,
  deletePublicPost,
  getPostById,
  getPostsWithAggregates,
} from "@/dal/posts";
import { protectedProcedure } from "../procedures";

const DEFAULT_TAKE = 20;
const MAX_TAKE = 100;

export const postsRouter = {
  getDetailedPosts: protectedProcedure
    .input(
      z.object({
        offset: z.number().min(0).default(0),
        take: z.number().min(1).max(MAX_TAKE).default(DEFAULT_TAKE),
        sortBy: z.enum(["newest", "oldest"]).default("newest"),
        boardId: z.string().optional(),
      })
    )
    .handler(async ({ input, context }) => {
      const { offset, take, sortBy, boardId } = input;
      if (!context.organization) {
        throw new ORPCError("NOT_FOUND");
      }
      const userId = context.session?.user?.id;
      try {
        const { posts, hasMore } = await getPostsWithAggregates(
          context.db,
          {
            organizationId: context.organization.id,
            boardId,
            offset,
            take,
            sortBy,
          },
          userId
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
      } catch (_error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
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
        throw new ORPCError("NOT_FOUND");
      }
      const userId = context.session?.user?.id;
      try {
        const post = await getPostById(context.db, feedbackId, userId);
        return post;
      } catch (_error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
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
        throw new ORPCError("UNAUTHORIZED");
      }
      try {
        return await createPublicPost(context.db, input, userId);
      } catch (_error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
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
    .handler(() => "will implement"),

  delete: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string(),
      })
    )
    .output(z.any())
    .handler(async ({ input, context }) => {
      const deletedPost = await deletePublicPost(context.db, input.feedbackId);
      if (!deletedPost) {
        throw new Error("Post not found");
      }
      return { success: true, deletedPost };
    }),
};
