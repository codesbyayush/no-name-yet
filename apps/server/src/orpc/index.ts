import { publicProcedure, protectedProcedure } from "./procedures";
import { db } from "../db";
import {
  boards,
  comments,
  feedback,
  user,
  votes,
  organization,
  member,
} from "../db/schema";
import { eq, and, asc, desc, count, SQL } from "drizzle-orm";
import { ORPCError } from "@orpc/server";
import { z } from "zod";
import { randomUUID } from "crypto";
import { auth } from "../lib/auth";
import { publicRouter } from "./public";
import { organizationRouter } from "./organization";
import { mixedRouter } from "./features";

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
  // New router structure
  public: publicRouter,
  organization: organizationRouter,
  mixed: mixedRouter,

  // Legacy routes (to be moved gradually)
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

  // Get boards for user's organization (for onboarding check)
  getUserBoards: protectedProcedure.handler(async ({ context }) => {
    const userId = context.session?.user?.id;

    if (!userId) {
      throw new ORPCError("UNAUTHORIZED");
    }

    try {
      // Try to get user's organization ID from user table first
      const userData = await db
        .select({ organizationId: user.organizationId })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      let userOrganizationId = userData[0]?.organizationId;

      // If user doesn't have organizationId, check if they're a member of any organization
      if (!userOrganizationId) {
        const memberData = await db
          .select({ organizationId: member.organizationId })
          .from(member)
          .where(eq(member.userId, userId))
          .limit(1);

        userOrganizationId = memberData[0]?.organizationId;
      }

      if (!userOrganizationId) {
        return { boards: [], count: 0 };
      }

      // Get boards for the organization
      const userBoards = await db
        .select({
          id: boards.id,
          name: boards.name,
          slug: boards.slug,
          description: boards.description,
          isPrivate: boards.isPrivate,
          postCount: boards.postCount,
          viewCount: boards.viewCount,
          createdAt: boards.createdAt,
          updatedAt: boards.updatedAt,
        })
        .from(boards)
        .where(eq(boards.organizationId, userOrganizationId))
        .orderBy(desc(boards.createdAt));

      return {
        boards: userBoards,
        count: userBoards.length,
      };
    } catch (error) {
      console.error("Error fetching user boards:", error);
      throw new ORPCError("INTERNAL_SERVER_ERROR");
    }
  }),

  // Create a board for user's organization (onboarding step 2)
  createBoard: protectedProcedure
    .input(
      z.object({
        name: z.string().min(1, "Board name is required"),
        slug: z.string().min(1, "Board slug is required"),
        description: z.string().optional(),
        isPrivate: z.boolean().default(false),
      }),
    )
    .handler(async ({ input, context }) => {
      const userId = context.session?.user?.id;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      console.log("Creating board for user:", userId);
      console.log("Session data:", JSON.stringify(context.session, null, 2));

      console.log("Creating board for user:", userId);
      console.log("Session data:", context.session);

      // Try to get user's organization ID from user table first
      const userData = await db
        .select({ organizationId: user.organizationId })
        .from(user)
        .where(eq(user.id, userId))
        .limit(1);

      let userOrganizationId = userData[0]?.organizationId;

      // If user doesn't have organizationId, check if they're a member of any organization
      if (!userOrganizationId) {
        const memberData = await db
          .select({ organizationId: member.organizationId })
          .from(member)
          .where(eq(member.userId, userId))
          .limit(1);

        userOrganizationId = memberData[0]?.organizationId;
      }

      // Also try to get organization from Better Auth session
      // Note: This might not be available in the current context
      if (context.session?.user) {
        console.log("User session keys:", Object.keys(context.session.user));
      }

      if (!userOrganizationId) {
        console.log("No organization found for user:", userId);
        console.log("User data:", userData[0]);

        // Check if any organizations exist for this user in member table
        const allMemberships = await db
          .select()
          .from(member)
          .where(eq(member.userId, userId));
        console.log("User memberships:", allMemberships);

        throw new ORPCError("BAD_REQUEST");
      }

      try {
        // Check if board slug is unique within the organization
        const existingBoard = await db
          .select({ id: boards.id })
          .from(boards)
          .where(
            and(
              eq(boards.organizationId, userOrganizationId),
              eq(boards.slug, input.slug),
            ),
          )
          .limit(1);

        if (existingBoard.length > 0) {
          throw new ORPCError("CONFLICT");
        }

        // Create the board
        const newBoard = await db
          .insert(boards)
          .values({
            id: randomUUID(),
            organizationId: userOrganizationId,
            name: input.name,
            slug: input.slug,
            description: input.description,
            isPrivate: input.isPrivate,
            createdAt: new Date(),
            updatedAt: new Date(),
          })
          .returning();

        return {
          board: newBoard[0],
          success: true,
        };
      } catch (error) {
        console.error("Error creating board:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get comments for a specific post with pagination
  getPostComments: publicProcedure
    .input(
      z.object({
        ...postIdSchema.shape,
        ...paginationSchema.shape,
      }),
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
            isAnonymous: comments.isAnonymous,
            anonymousName: comments.anonymousName,
            anonymousEmail: comments.anonymousEmail,
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
      }),
    )
    .handler(async ({ input, context }) => {
      const { postId, offset, take, voteType } = input;

      try {
        // Build where conditions
        let whereConditions: SQL<unknown> | undefined = eq(
          votes.feedbackId,
          postId,
        );
        if (voteType) {
          whereConditions = and(whereConditions, eq(votes.type, voteType));
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
      }),
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
              .where(
                and(eq(votes.feedbackId, post.id), eq(votes.type, "upvote")),
              );

            const downvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(
                and(eq(votes.feedbackId, post.id), eq(votes.type, "downvote")),
              );

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
          }),
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
      }),
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
              .where(
                and(eq(votes.feedbackId, post.id), eq(votes.type, "upvote")),
              );

            const downvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(
                and(eq(votes.feedbackId, post.id), eq(votes.type, "downvote")),
              );

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
          }),
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
          .where(
            and(eq(votes.feedbackId, post.id), eq(votes.type, "downvote")),
          );

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
                eq(votes.userId, context.session.user.id),
              ),
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
      }),
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
        if (
          board[0].isPrivate &&
          (!context.organization ||
            context.organization.id !== board[0].organizationId)
        ) {
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
              .where(
                and(eq(votes.feedbackId, post.id), eq(votes.type, "upvote")),
              );

            const downvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(
                and(eq(votes.feedbackId, post.id), eq(votes.type, "downvote")),
              );

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
          }),
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

  // NEW: Create a post (feedback) in a specific board
  createPost: protectedProcedure
    .input(
      z.object({
        boardId: z.string().min(1, "Board ID is required"),
        type: z.enum(["bug", "suggestion"]),
        title: z
          .string()
          .min(1, "Title is required")
          .max(200, "Title too long"),
        description: z
          .string()
          .min(1, "Description is required")
          .max(5000, "Description too long"),
        priority: z.enum(["low", "medium", "high"]).default("medium"),
        tags: z.array(z.string()).default([]),
        isAnonymous: z.boolean().default(false),
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
          .default([]),
      }),
    )
    .handler(async ({ input, context }) => {
      const {
        boardId,
        type,
        title,
        description,
        priority,
        tags,
        isAnonymous,
        attachments,
      } = input;
      const userId = context.session?.user?.id;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        // Verify board exists and user has access
        const board = await db
          .select()
          .from(boards)
          .where(eq(boards.id, boardId))
          .limit(1);

        if (!board[0]) {
          throw new ORPCError("NOT_FOUND");
        }

        // Create the post
        const newPost = await db
          .insert(feedback)
          .values({
            boardId,
            type,
            title,
            description,
            userId: isAnonymous ? null : userId,
            userEmail: isAnonymous ? null : context.session?.user?.email,
            userName: isAnonymous ? null : context.session?.user?.name,
            priority,
            tags,
            isAnonymous,
            attachments,
            status: "open",
          })
          .returning();

        return {
          post: newPost[0],
          message: "Post created successfully",
        };
      } catch (error) {
        console.error("Error creating post:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Create a comment on a post
  createComment: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string().min(1, "Post ID is required"),
        content: z
          .string()
          .min(1, "Content is required")
          .max(2000, "Content too long"),
        parentCommentId: z.string().optional(), // For replies
        isInternal: z.boolean().default(false),
      }),
    )
    .handler(async ({ input, context }) => {
      const { feedbackId, content, parentCommentId, isInternal } = input;
      const userId = context.session?.user?.id;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        // Verify post exists
        const post = await db
          .select()
          .from(feedback)
          .where(eq(feedback.id, feedbackId))
          .limit(1);

        if (!post[0]) {
          throw new ORPCError("NOT_FOUND");
        }

        // If replying to a comment, verify parent comment exists
        if (parentCommentId) {
          const parentComment = await db
            .select()
            .from(comments)
            .where(
              and(
                eq(comments.id, parentCommentId),
                eq(comments.feedbackId, feedbackId),
              ),
            )
            .limit(1);

          if (!parentComment[0]) {
            throw new ORPCError("NOT_FOUND");
          }
        }

        // Create the comment
        const newComment = await db
          .insert(comments)
          .values({
            id: randomUUID(),
            feedbackId,
            content,
            authorId: userId,
            parentCommentId: parentCommentId || null,
            isInternal,
          })
          .returning();

        // Get the comment with author info
        const commentWithAuthor = await db
          .select({
            id: comments.id,
            content: comments.content,
            feedbackId: comments.feedbackId,
            parentCommentId: comments.parentCommentId,
            isInternal: comments.isInternal,
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
          .where(eq(comments.id, newComment[0].id))
          .limit(1);

        return {
          comment: commentWithAuthor[0],
          message: "Comment created successfully",
        };
      } catch (error) {
        console.error("Error creating comment:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Vote on a post
  voteOnPost: protectedProcedure
    .input(
      z.object({
        feedbackId: z.string().min(1, "Post ID is required"),
        type: z.enum(["upvote", "downvote", "bookmark"]),
        weight: z.number().min(1).max(5).default(1),
      }),
    )
    .handler(async ({ input, context }) => {
      const { feedbackId, type, weight } = input;
      const userId = context.session?.user?.id;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        // Verify post exists
        const post = await db
          .select()
          .from(feedback)
          .where(eq(feedback.id, feedbackId))
          .limit(1);

        if (!post[0]) {
          throw new ORPCError("NOT_FOUND");
        }

        // Check if user already voted
        const existingVote = await db
          .select()
          .from(votes)
          .where(
            and(eq(votes.feedbackId, feedbackId), eq(votes.userId, userId)),
          )
          .limit(1);

        if (existingVote[0]) {
          // Update existing vote if different type
          if (existingVote[0].type !== type) {
            await db
              .update(votes)
              .set({ type, weight })
              .where(eq(votes.id, existingVote[0].id));

            return {
              message: "Vote updated successfully",
              vote: { type, weight },
            };
          } else {
            // Remove vote if same type (toggle)
            await db.delete(votes).where(eq(votes.id, existingVote[0].id));

            return {
              message: "Vote removed successfully",
              vote: null,
            };
          }
        } else {
          // Create new vote
          const newVote = await db
            .insert(votes)
            .values({
              id: randomUUID(),
              feedbackId,
              userId,
              type,
              weight,
            })
            .returning();

          return {
            message: "Vote created successfully",
            vote: newVote[0],
          };
        }
      } catch (error) {
        console.error("Error voting on post:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Vote on a comment
  voteOnComment: protectedProcedure
    .input(
      z.object({
        commentId: z.string().min(1, "Comment ID is required"),
        type: z.enum(["upvote", "downvote"]),
        weight: z.number().min(1).max(5).default(1),
      }),
    )
    .handler(async ({ input, context }) => {
      const { commentId, type, weight } = input;
      const userId = context.session?.user?.id;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        // Verify comment exists
        const comment = await db
          .select()
          .from(comments)
          .where(eq(comments.id, commentId))
          .limit(1);

        if (!comment[0]) {
          throw new ORPCError("NOT_FOUND");
        }

        // Check if user already voted on this comment
        const existingVote = await db
          .select()
          .from(votes)
          .where(and(eq(votes.commentId, commentId), eq(votes.userId, userId)))
          .limit(1);

        if (existingVote[0]) {
          // Update existing vote if different type
          if (existingVote[0].type !== type) {
            await db
              .update(votes)
              .set({ type, weight })
              .where(eq(votes.id, existingVote[0].id));

            return {
              message: "Vote updated successfully",
              vote: { type, weight },
            };
          } else {
            // Remove vote if same type (toggle)
            await db.delete(votes).where(eq(votes.id, existingVote[0].id));

            return {
              message: "Vote removed successfully",
              vote: null,
            };
          }
        } else {
          // Create new vote
          const newVote = await db
            .insert(votes)
            .values({
              id: randomUUID(),
              commentId,
              userId,
              type,
              weight,
            })
            .returning();

          return {
            message: "Vote created successfully",
            vote: newVote[0],
          };
        }
      } catch (error) {
        console.error("Error voting on comment:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get comments for a post with threading (replies support)
  getPostCommentsWithReplies: publicProcedure
    .input(
      z.object({
        feedbackId: z.string().min(1, "Post ID is required"),
        offset: z.number().min(0).default(0),
        take: z.number().min(1).max(100).default(20),
      }),
    )
    .handler(async ({ input, context }) => {
      const { feedbackId, offset, take } = input;

      try {
        // Get all comments for the post
        const allComments = await db
          .select({
            id: comments.id,
            content: comments.content,
            feedbackId: comments.feedbackId,
            parentCommentId: comments.parentCommentId,
            isInternal: comments.isInternal,
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
          .where(eq(comments.feedbackId, feedbackId))
          .orderBy(asc(comments.createdAt));

        // Get vote counts for each comment
        const commentsWithVotes = await Promise.all(
          allComments.map(async (comment) => {
            const upvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(
                and(eq(votes.commentId, comment.id), eq(votes.type, "upvote")),
              );

            const downvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(
                and(
                  eq(votes.commentId, comment.id),
                  eq(votes.type, "downvote"),
                ),
              );

            return {
              ...comment,
              stats: {
                upvotes: upvoteCountResult[0]?.count || 0,
                downvotes: downvoteCountResult[0]?.count || 0,
              },
            };
          }),
        );

        // Organize comments into threads (parent comments with their replies)
        const parentComments = commentsWithVotes.filter(
          (c) => !c.parentCommentId,
        );
        const replyComments = commentsWithVotes.filter(
          (c) => c.parentCommentId,
        );

        const threaded = parentComments.map((parent) => ({
          ...parent,
          replies: replyComments.filter(
            (reply) => reply.parentCommentId === parent.id,
          ),
        }));

        // Apply pagination to parent comments only
        const paginatedThreaded = threaded.slice(offset, offset + take);

        return {
          comments: paginatedThreaded,
          pagination: {
            offset,
            take,
            totalCount: parentComments.length,
            hasMore: offset + take < parentComments.length,
          },
        };
      } catch (error) {
        console.error("Error fetching threaded comments:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get user's votes on posts and comments for UI state
  getUserVotes: protectedProcedure
    .input(
      z.object({
        feedbackIds: z.array(z.string()).optional(),
        commentIds: z.array(z.string()).optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const { feedbackIds, commentIds } = input;
      const userId = context.session?.user?.id;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        const conditions: SQL<unknown>[] = [eq(votes.userId, userId)];

        if (feedbackIds?.length) {
          conditions.push(eq(votes.feedbackId, feedbackIds[0])); // This needs to be improved for multiple IDs
        }

        if (commentIds?.length) {
          conditions.push(eq(votes.commentId, commentIds[0])); // This needs to be improved for multiple IDs
        }

        const userVotes = await db
          .select()
          .from(votes)
          .where(and(...conditions));

        return {
          votes: userVotes,
        };
      } catch (error) {
        console.error("Error fetching user votes:", error);
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Get all posts for organization members only (includes private boards)
  getOrganizationMemberPosts: protectedProcedure
    .input(
      z.object({
        ...paginationSchema.shape,
        sortBy: z.enum(["newest", "oldest", "most_voted"]).default("newest"),
      }),
    )
    .handler(async ({ input, context }) => {
      const { offset, take, sortBy } = input;
      const userId = context.session?.user?.id;

      if (!userId) {
        throw new ORPCError("UNAUTHORIZED");
      }

      try {
        // First, get the user's organization ID
        let userOrganizationId = null;

        // Check if user has organizationId in user table
        const userData = await db
          .select({ organizationId: user.organizationId })
          .from(user)
          .where(eq(user.id, userId))
          .limit(1);

        userOrganizationId = userData[0]?.organizationId;

        // If user doesn't have organizationId, check member table
        if (!userOrganizationId) {
          const memberData = await db
            .select({ organizationId: member.organizationId })
            .from(member)
            .where(eq(member.userId, userId))
            .limit(1);

          userOrganizationId = memberData[0]?.organizationId;
        }

        if (!userOrganizationId) {
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

        // Fetch posts for the organization with author information
        // This includes both public and private boards since user is a member
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
              isPrivate: boards.isPrivate,
            },
            status: feedback.status,
          })
          .from(feedback)
          .leftJoin(user, eq(feedback.userId, user.id))
          .leftJoin(boards, eq(feedback.boardId, boards.id))
          .where(eq(boards.organizationId, userOrganizationId))
          .orderBy(orderBy)
          .offset(offset)
          .limit(take);

        // Get vote counts and comment counts for each post
        const postsWithStats = await Promise.all(
          posts.map(async (post) => {
            const upvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(
                and(eq(votes.feedbackId, post.id), eq(votes.type, "upvote")),
              );

            const downvoteCountResult = await db
              .select({ count: count() })
              .from(votes)
              .where(
                and(eq(votes.feedbackId, post.id), eq(votes.type, "downvote")),
              );

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
          }),
        );

        // Get total count for pagination metadata
        const totalCountResult = await db
          .select({ count: count() })
          .from(feedback)
          .leftJoin(boards, eq(feedback.boardId, boards.id))
          .where(eq(boards.organizationId, userOrganizationId));

        const totalCount = totalCountResult[0]?.count || 0;
        const hasMore = offset + take < totalCount;

        return {
          posts: postsWithStats,
          organizationId: userOrganizationId,
          pagination: {
            offset,
            take,
            totalCount,
            hasMore,
          },
        };
      } catch (error) {
        console.error("Error fetching organization member posts:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),

  // NEW: Publicly create a comment (anonymous or authenticated)
  publicCreateComment: publicProcedure
    .input(
      z.object({
        feedbackId: z.string().min(1, "Post ID is required"),
        content: z
          .string()
          .min(1, "Content is required")
          .max(2000, "Content too long"),
        parentCommentId: z.string().optional(), // For replies
        isInternal: z.boolean().default(false),
        anonymousName: z.string().optional(),
        anonymousEmail: z.string().optional(),
      }),
    )
    .handler(async ({ input, context }) => {
      const {
        feedbackId,
        content,
        parentCommentId,
        isInternal,
        anonymousName,
        anonymousEmail,
      } = input;
      const sessionUser = context.session?.user;
      const userId = sessionUser?.id;
      const isAnonymous = !userId;

      try {
        // Verify post exists
        const post = await db
          .select()
          .from(feedback)
          .where(eq(feedback.id, feedbackId))
          .limit(1);

        if (!post[0]) {
          throw new ORPCError("NOT_FOUND");
        }

        // If replying to a comment, verify parent comment exists
        if (parentCommentId) {
          const parentComment = await db
            .select()
            .from(comments)
            .where(
              and(
                eq(comments.id, parentCommentId),
                eq(comments.feedbackId, feedbackId),
              ),
            )
            .limit(1);

          if (!parentComment[0]) {
            throw new ORPCError("NOT_FOUND");
          }
        }

        // Create the comment
        const newComment = await db
          .insert(comments)
          .values({
            id: randomUUID(),
            feedbackId,
            content,
            authorId: userId || null,
            parentCommentId: parentCommentId || null,
            isInternal,
            isAnonymous,
            anonymousName: isAnonymous ? anonymousName || null : null,
            anonymousEmail: isAnonymous ? anonymousEmail || null : null,
          })
          .returning();

        // Get the comment with author info (if any)
        const commentWithAuthor = await db
          .select({
            id: comments.id,
            content: comments.content,
            feedbackId: comments.feedbackId,
            parentCommentId: comments.parentCommentId,
            isInternal: comments.isInternal,
            isAnonymous: comments.isAnonymous,
            anonymousName: comments.anonymousName,
            anonymousEmail: comments.anonymousEmail,
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
          .where(eq(comments.id, newComment[0].id))
          .limit(1);

        return {
          comment: commentWithAuthor[0],
          message: "Comment created successfully",
        };
      } catch (error) {
        console.error("Error creating comment:", error);
        if (error instanceof ORPCError) {
          throw error;
        }
        throw new ORPCError("INTERNAL_SERVER_ERROR");
      }
    }),
};

export type AppRouter = typeof apiRouter;
