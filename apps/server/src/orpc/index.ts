import { publicProcedure, protectedProcedure } from "./procedures";
import { db } from "../db";
import { boards, comments, feedback, user, votes } from "../db/schema";
import { eq, and, asc, desc, count, SQL } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { z } from "zod";

// Pagination schema for reuse
const paginationSchema = z.object({
  offset: z.number().min(0).default(0),
  take: z.number().min(1).max(100).default(20), // Limit max items to prevent abuse
});

// Post ID schema for reuse
const postIdSchema = z.object({
  postId: z.string().min(1, "Post ID is required"),
});

// Feedback ID schema for reuse
const feedbackIdSchema = z.object({
  feedbackId: z.string().min(1, "Feedback ID is required"),
});

// Board ID schema for reuse
const boardIdSchema = z.object({
  boardId: z.string().min(1, "Board ID is required"),
});

export const apiRouter = {
  // Health check - public endpoint
  healthCheck: publicProcedure.handler(async ({ context }) => {
    return {
      status: "ok",
      timestamp: new Date().toISOString(),
      version: "2.0.0",
    };
  }),

  // Get current user - protected endpoint
  getCurrentUser: protectedProcedure.handler(({ context }) => {
    return {
      user: context.session?.user,
      sessionId: context.session?.session?.id,
    };
  }),

  // Example with input validation
  echo: publicProcedure
    .input(
      z.object({
        message: z.string(),
      }),
    )
    .handler(({ input }) => {
      return {
        echo: input.message,
        timestamp: new Date().toISOString(),
      };
    }),

  // Protected endpoint with input
  createPrivateNote: protectedProcedure
    .input(
      z.object({
        title: z.string().min(1),
        content: z.string(),
      }),
    )
    .handler(({ input, context }) => {
      return {
        id: Math.random().toString(36).substr(2, 9),
        title: input.title,
        content: input.content,
        authorId: context.session?.user?.id,
        createdAt: new Date().toISOString(),
      };
    }),

  // Get all public boards for the current organization
  getAllPublicBoards: publicProcedure.handler(async ({ context }) => {
    // Check if organization exists
    if (!context.organization) {
      throw new ORPCError("NOT_FOUND");
    }

    try {
      // Fetch all public boards for the organization
      const publicBoards = await db
        .select({
          id: boards.id,
          name: boards.name,
          slug: boards.slug,
          description: boards.description,
          postCount: boards.postCount,
          viewCount: boards.viewCount,
          createdAt: boards.createdAt,
          updatedAt: boards.updatedAt,
        })
        .from(boards)
        .where(
          and(
            eq(boards.organizationId, context.organization.id),
            eq(boards.isPrivate, false),
          ),
        )
        .orderBy(asc(boards.createdAt));

      return {
        boards: publicBoards,
        organizationId: context.organization.id,
        organizationName: context.organization.name,
      };
    } catch (error) {
      console.error("Error fetching public boards:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }
  }),

  // NEW: Get comments for a specific post with pagination
  getPostComments: publicProcedure
    .input(
      z.object({
        ...postIdSchema.shape,
        ...paginationSchema.shape,
      })
    )
    .handler(async ({ input, context }) => {
      const { postId, offset, take } = input;

      try {
        // Fetch comments with author information
        const comm = await db
          .select({
            id: comments.id,
            content: comments.content,
            createdAt: comments.createdAt,
            updatedAt: comments.updatedAt,
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
          })
          .from(comments)
          .leftJoin(user, eq(comments.authorId, user.id))
          .where(eq(comments.feedbackId, postId))
          .orderBy(asc(comments.createdAt))
          .offset(offset)
          .limit(take);

        // Get total count for pagination metadata
        const totalCountResult = await db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.feedbackId, postId));

        const totalCount = totalCountResult[0]?.count || 0;
        const hasMore = offset + take < totalCount;

        return {
          comments: comm,
          pagination: {
            offset,
            take,
            totalCount,
            hasMore,
          },
        };
      } catch (error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get votes for a specific post with pagination
  getPostVotes: publicProcedure
    .input(
      z.object({
        ...postIdSchema.shape,
        ...paginationSchema.shape,
        voteType: z.enum(["upvote", "downvote"]).optional(), // Filter by vote type
      })
    )
    .handler(async ({ input, context }) => {
      const { postId, offset, take, voteType } = input;

      try {
        // Build where conditions
        let whereConditions: SQL<unknown> | undefined = eq(votes.feedbackId, postId);
        if (voteType) {
          whereConditions = and(
            whereConditions,
            eq(votes.type, voteType)
          );
        }

        // Fetch votes with voter information
        const voteResult = await db
          .select({
            id: votes.id,
            type: votes.type,
            createdAt: votes.createdAt,
            voter: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
          })
          .from(votes)
          .leftJoin(user, eq(votes.userId, user.id))
          .where(whereConditions)
          .orderBy(desc(votes.createdAt))
          .offset(offset)
          .limit(take);

        // Get total count and vote breakdown
        const totalCountResult = await db
          .select({ count: count() })
          .from(votes)
          .where(whereConditions);

        const upvoteCountResult = await db
          .select({ count: count() })
          .from(votes)
          .where(and(eq(votes.feedbackId, postId), eq(votes.type, "upvote")));

        const downvoteCountResult = await db
          .select({ count: count() })
          .from(votes)
          .where(and(eq(votes.feedbackId, postId), eq(votes.type, "downvote")));

        const totalCount = totalCountResult[0]?.count || 0;
        const upvoteCount = upvoteCountResult[0]?.count || 0;
        const downvoteCount = downvoteCountResult[0]?.count || 0;
        const hasMore = offset + take < totalCount;

        return {
          votes: voteResult,
          voteCounts: {
            upvotes: upvoteCount,
            downvotes: downvoteCount,
            total: upvoteCount + downvoteCount,
          },
          pagination: {
            offset,
            take,
            totalCount,
            hasMore,
          },
        };
      } catch (error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get all posts for a specific feedback with pagination
  getFeedbackPosts: publicProcedure
    .input(
      z.object({
        ...feedbackIdSchema.shape,
        ...paginationSchema.shape,
        sortBy: z.enum(["newest", "oldest", "most_voted"]).default("newest"),
      })
    )
    .handler(async ({ input, context }) => {
      const { feedbackId, offset, take, sortBy } = input;

      try {
        // Determine sort order
        let orderBy;
        switch (sortBy) {
          case "oldest":
            orderBy = asc(feedback.createdAt);
            break;
          case "most_voted":
            // This would require a more complex query with vote counts
            // For now, defaulting to newest
            orderBy = desc(feedback.createdAt);
            break;
          case "newest":
          default:
            orderBy = desc(feedback.createdAt);
            break;
        }

        // Fetch posts with author information and vote counts
        const posts = await db
          .select({
            id: feedback.id,
            title: feedback.title,
            content: feedback.description,
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
          })
          .from(feedback)
          .leftJoin(user, eq(feedback.userId, user.id))
          .where(eq(feedback.userId, feedbackId))
          .orderBy(orderBy)
          .offset(offset)
          .limit(take);

        // Get vote counts for each post (this could be optimized with a single query)
        const postsWithVotes = await Promise.all(
          posts.map(async (post) => {
            const upvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(and(eq(votes.feedbackId, post.id), eq(votes.type, "upvote")));

            const downvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(and(eq(votes.feedbackId, post.id), eq(votes.type, "downvote")));

            const commentCountResult = await db
              .select({ count: count() })
              .from(comments)
              .where(eq(comments.feedbackId, post.id));

            return {
              ...post,
              stats: {
                upvotes: upvoteCountResult[0]?.count || 0,
                downvotes: downvoteCountResult[0]?.count || 0,
                comments: commentCountResult[0]?.count || 0,
              },
            };
          })
        );

        // Get total count for pagination metadata
        const totalCountResult = await db
          .select({ count: count() })
          .from(feedback)
          .where(eq(feedback.id, feedbackId));

        const totalCount = totalCountResult[0]?.count || 0;
        const hasMore = offset + take < totalCount;

        return {
          posts: postsWithVotes,
          pagination: {
            offset,
            take,
            totalCount,
            hasMore,
          },
        };
      } catch (error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get user's vote on a specific post (useful for UI state)
  getUserPostVote: protectedProcedure
    .input(postIdSchema)
    .handler(async ({ input, context }) => {
      const { postId } = input;
      const userId = context.session?.user?.id;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        const userVote = await db
          .select()
          .from(votes)
          .where(and(eq(votes.feedbackId, postId), eq(votes.userId, userId)))
          .limit(1);

        return {
          vote: userVote[0] || null,
        };
      } catch (error) {
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get all posts for the current organization with pagination
  getOrganizationPosts: publicProcedure
    .input(
      z.object({
        ...paginationSchema.shape,
        sortBy: z.enum(["newest", "oldest", "most_voted"]).default("newest"),
      })
    )
    .handler(async ({ input, context }) => {
      const { offset, take, sortBy } = input;

      // Check if organization exists
      if (!context.organization) {
        throw new ORPCError("NOT_FOUND");
      }

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

        // Fetch posts for the organization with author information
        const posts = await db
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
          })
          .from(feedback)
          .leftJoin(user, eq(feedback.userId, user.id))
          .leftJoin(boards, eq(feedback.boardId, boards.id))
          .where(eq(boards.organizationId, context.organization.id))
          .orderBy(orderBy)
          .offset(offset)
          .limit(take);

        // Get vote counts and comment counts for each post
        const postsWithStats = await Promise.all(
          posts.map(async (post) => {
            const upvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(and(eq(votes.feedbackId, post.id), eq(votes.type, "upvote")));

            const downvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(and(eq(votes.feedbackId, post.id), eq(votes.type, "downvote")));

            const commentCountResult = await db
              .select({ count: count() })
              .from(comments)
              .where(eq(comments.feedbackId, post.id));

            return {
              ...post,
              stats: {
                upvotes: upvoteCountResult[0]?.count || 0,
                downvotes: downvoteCountResult[0]?.count || 0,
                comments: commentCountResult[0]?.count || 0,
              },
            };
          })
        );

        // Get total count for pagination metadata
        const totalCountResult = await db
          .select({ count: count() })
          .from(feedback)
          .leftJoin(boards, eq(feedback.boardId, boards.id))
          .where(eq(boards.organizationId, context.organization.id));

        const totalCount = totalCountResult[0]?.count || 0;
        const hasMore = offset + take < totalCount;

        return {
          posts: postsWithStats,
          organizationId: context.organization.id,
          organizationName: context.organization.name,
          pagination: {
            offset,
            take,
            totalCount,
            hasMore,
          },
        };
      } catch (error) {
        console.error("Error fetching organization posts:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get a specific post by ID
  getPostById: publicProcedure
    .input(postIdSchema)
    .handler(async ({ input, context }) => {
      const { postId } = input;

      try {
        // Fetch the post with author and board information
        const postResult = await db
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
              organizationId: boards.organizationId,
            },
          })
          .from(feedback)
          .leftJoin(user, eq(feedback.userId, user.id))
          .leftJoin(boards, eq(feedback.boardId, boards.id))
          .where(eq(feedback.id, postId))
          .limit(1);

        if (!postResult.length) {
          throw new ORPCError("NOT_FOUND");
        }

        const post = postResult[0];

        // Get vote counts
        const upvoteCountResult = await db
          .select({ count: count() })
          .from(votes)
          .where(and(eq(votes.feedbackId, post.id), eq(votes.type, "upvote")));

        const downvoteCountResult = await db
          .select({ count: count() })
          .from(votes)
          .where(and(eq(votes.feedbackId, post.id), eq(votes.type, "downvote")));

        // Get comment count
        const commentCountResult = await db
          .select({ count: count() })
          .from(comments)
          .where(eq(comments.feedbackId, post.id));

        // Get user's vote if they're authenticated
        let userVote = null;
        if (context.session?.user?.id) {
          const userVoteResult = await db
            .select({
              type: votes.type,
            })
            .from(votes)
            .where(
              and(
                eq(votes.feedbackId, post.id),
                eq(votes.userId, context.session.user.id)
              )
            )
            .limit(1);

          userVote = userVoteResult[0] || null;
        }

        return {
          ...post,
          stats: {
            upvotes: upvoteCountResult[0]?.count || 0,
            downvotes: downvoteCountResult[0]?.count || 0,
            comments: commentCountResult[0]?.count || 0,
          },
          userVote,
        };
      } catch (error) {
        if (error instanceof ORPCError) {
          throw error;
        }
        console.error("Error fetching post:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get all posts for a specific board with pagination
  getBoardPosts: publicProcedure
    .input(
      z.object({
        ...boardIdSchema.shape,
        ...paginationSchema.shape,
        sortBy: z.enum(["newest", "oldest", "most_voted"]).default("newest"),
      })
    )
    .handler(async ({ input, context }) => {
      const { boardId, offset, take, sortBy } = input;

      try {
        // First verify the board exists and is accessible
        const board = await db
          .select({
            id: boards.id,
            name: boards.name,
            slug: boards.slug,
            description: boards.description,
            isPrivate: boards.isPrivate,
            organizationId: boards.organizationId,
          })
          .from(boards)
          .where(eq(boards.id, boardId))
          .limit(1);

        if (!board[0]) {
          throw new ORPCError("NOT_FOUND");
        }

        // Check if board is private and user has access
        if (board[0].isPrivate && (!context.organization || context.organization.id !== board[0].organizationId)) {
          throw new ORPCError("FORBIDDEN");
        }

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

        // Fetch posts for the board with author information
        const posts = await db
          .select({
            id: feedback.id,
            title: feedback.title,
            content: feedback.description,
            createdAt: feedback.createdAt,
            updatedAt: feedback.updatedAt,
            author: {
              id: user.id,
              name: user.name,
              email: user.email,
              image: user.image,
            },
          })
          .from(feedback)
          .leftJoin(user, eq(feedback.userId, user.id))
          .where(eq(feedback.boardId, boardId))
          .orderBy(orderBy)
          .offset(offset)
          .limit(take);

        // Get vote counts and comment counts for each post
        const postsWithStats = await Promise.all(
          posts.map(async (post) => {
            const upvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(and(eq(votes.feedbackId, post.id), eq(votes.type, "upvote")));

            const downvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(and(eq(votes.feedbackId, post.id), eq(votes.type, "downvote")));

            const commentCountResult = await db
              .select({ count: count() })
              .from(comments)
              .where(eq(comments.feedbackId, post.id));

            return {
              ...post,
              stats: {
                upvotes: upvoteCountResult[0]?.count || 0,
                downvotes: downvoteCountResult[0]?.count || 0,
                comments: commentCountResult[0]?.count || 0,
              },
            };
          })
        );

        // Get total count for pagination metadata
        const totalCountResult = await db
          .select({ count: count() })
          .from(feedback)
          .where(eq(feedback.boardId, boardId));

        const totalCount = totalCountResult[0]?.count || 0;
        const hasMore = offset + take < totalCount;

        return {
          posts: postsWithStats,
          board: board[0],
          pagination: {
            offset,
            take,
            totalCount,
            hasMore,
          },
        };
      } catch (error) {
        console.error("Error fetching board posts:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),
};

export type AppRouter = typeof apiRouter;
