import { db } from "@/db";
import {
  type Vote,
  boards,
  comments,
  feedback,
  user,
  votes,
} from "@/db/schema";
import { ORPCError } from "@orpc/client";
import { and, asc, count, desc, eq, exists, isNull, sql } from "drizzle-orm";
import { z } from "zod/v4";
import { protectedProcedure } from "../procedures";

const paginationSchema = z.object({
  offset: z.number().min(0).default(0),
  take: z.number().min(1).max(100).default(20), // Limit max items to prevent abuse
});

export const mixedRouter = {
  getDetailedPosts: protectedProcedure
    .input(
      z.object({
        ...paginationSchema.shape,
        sortBy: z.enum(["newest", "oldest", "most_voted"]).default("newest"),
        boardId: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { offset, take, sortBy, boardId } = input;

      // Check if organization exists
      if (!context.organization) {
        throw new ORPCError("NOT_FOUND");
      }

      const userId = context.session?.user?.id;

      try {
        // Determine sort order
        let orderBy;
        switch (sortBy) {
          case "oldest":
            orderBy = asc(feedback.createdAt);
            break;
          case "most_voted":
            orderBy = desc(feedback.createdAt); // TODO: Sort by vote count
            break;
          case "newest":
          default:
            orderBy = desc(feedback.createdAt);
            break;
        }

        const filters = [eq(boards.organizationId, context.organization.id)];

        if (boardId) {
          filters.push(eq(boards.id, boardId));
        }

        // Fetch posts for the organization with author information
        const posts = await db
          .select({
            id: feedback.id,
            title: feedback.title,
            content: feedback.description,
            boardId: feedback.boardId,
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,
            status: feedback.status,
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
            board: {
              id: boards.id,
              name: boards.name,
              slug: boards.slug,
            },
            comments: db.$count(comments, eq(feedback.id, comments.feedbackId)),
            votes: db.$count(votes, eq(feedback.id, votes.feedbackId)),
            hasVoted: userId
              ? exists(
                  db
                    .select()
                    .from(votes)
                    .where(
                      and(
                        eq(votes.feedbackId, feedback.id),
                        eq(votes.userId, userId),
                      ),
                    ),
                )
              : sql`false`,
          })
          .from(feedback)
          .leftJoin(user, eq(feedback.userId, user.id))
          .leftJoin(boards, eq(feedback.boardId, boards.id))
          .where(and(...filters))
          .orderBy(orderBy)
          .offset(offset)
          .limit(take + 1);

        const hasMore = posts.length > take;

        return {
          posts: posts.slice(0, take),
          organizationId: context.organization.id,
          organizationName: context.organization.name,
          pagination: {
            offset,
            take,
            hasMore,
          },
        };
      } catch (error) {
        console.error("Error fetching organization posts:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  getDetailedSinglePost: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { feedbackId } = input;

      // Check if organization exists
      if (!context.organization || !feedbackId) {
        throw new ORPCError("NOT_FOUND");
      }

      const userId = context.session?.user?.id;

      try {
        // Fetch posts for the organization with author information
        const post = await db
          .select({
            id: feedback.id,
            title: feedback.title,
            content: feedback.description,
            boardId: feedback.boardId,
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
            board: {
              id: boards.id,
              name: boards.name,
              slug: boards.slug,
            },
            totalComments: db.$count(
              comments,
              eq(feedback.id, comments.feedbackId),
            ),
            totalVotes: db.$count(votes, eq(feedback.id, votes.feedbackId)),
            hasVoted: userId
              ? exists(
                  db
                    .select()
                    .from(votes)
                    .where(
                      and(
                        eq(votes.feedbackId, feedback.id),
                        eq(votes.userId, userId),
                      ),
                    ),
                )
              : sql`false`,
          })
          .from(feedback)
          .leftJoin(user, eq(feedback.userId, user.id))
          .leftJoin(boards, eq(feedback.boardId, boards.id))
          .where(eq(feedback.id, feedbackId));

        return {
          post: post[0],
          organizationId: context.organization.id,
          organizationName: context.organization.name,
        };
      } catch (error) {
        console.error("Error fetching organization posts:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),
};
