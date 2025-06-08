import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  ErrorSchema,
  SuccessResponseSchema,
  PaginationSchema,
  CommentSchema,
  CreateCommentSchema,
  UpdateCommentSchema,
  VoteSchema,
  CreateVoteSchema,
  UpdateVoteSchema,
  CommentStatsSchema,
  VoteStatsSchema,
  VoteCountsSchema,
} from "../schemas/common";
import {
  GetCommentsQuerySchema,
  CommentIdParamsSchema,
  PostIdParamsSchema,
  TenantIdQuerySchema,
  GetCommentsByPostQuerySchema,
  GetVotesByPostQuerySchema,
  GetVotesByCommentQuerySchema,
  VoteIdParamsSchema,
  GetUserVoteQuerySchema,
  CreateCommentResponseSchema,
  GetCommentsResponseSchema,
  GetCommentByIdResponseSchema,
  UpdateCommentResponseSchema,
  DeleteCommentResponseSchema,
  GetCommentsByPostResponseSchema,
  GetCommentStatsResponseSchema,
  CreateVoteResponseSchema,
  UpdateVoteResponseSchema,
  DeleteVoteResponseSchema,
  GetVotesByPostResponseSchema,
  GetVotesByCommentResponseSchema,
  GetVoteCountsResponseSchema,
  GetUserVoteResponseSchema,
} from "../schemas/comment-vote-schemas";

// Comment routes
export const createCommentRoute = createRoute({
  method: "post",
  path: "/comments",
  tags: ["Comments"],
  summary: "Create new comment",
  description: "Create a new comment or reply to an existing comment",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCommentSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Comment created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            comment: CommentSchema,
          }),
        },
      },
    },
    400: {
      description: "Bad request - Invalid input data",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getCommentsRoute = createRoute({
  method: "get",
  path: "/comments",
  tags: ["Comments"],
  summary: "Get comments list",
  description: "Retrieve a paginated list of comments with optional filtering",
  request: {
    query: GetCommentsQuerySchema,
  },
  responses: {
    200: {
      description: "Comments retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(CommentSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getCommentByIdRoute = createRoute({
  method: "get",
  path: "/comments/{id}",
  tags: ["Comments"],
  summary: "Get comment by ID",
  description: "Retrieve a specific comment by its ID",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Comment ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Comment retrieved successfully",
      content: {
        "application/json": {
          schema: GetCommentByIdResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid comment or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Comment not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const updateCommentRoute = createRoute({
  method: "put",
  path: "/comments/{id}",
  tags: ["Comments"],
  summary: "Update comment",
  description: "Update an existing comment's content",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Comment ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateCommentSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Comment updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            comment: CommentSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid comment or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Comment not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const deleteCommentRoute = createRoute({
  method: "delete",
  path: "/comments/{id}",
  tags: ["Comments"],
  summary: "Delete comment",
  description: "Soft delete a comment (preserves for moderation)",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Comment ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Comment deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            comment: CommentSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid comment or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Comment not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getCommentsByPostRoute = createRoute({
  method: "get",
  path: "/comments/post/{postId}",
  tags: ["Comments"],
  summary: "Get comments by post",
  description: "Retrieve all comments for a specific post with nested replies",
  request: {
    params: z.object({
      postId: z.string().transform(Number).describe("Post ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
      includeInternal: z
        .string()
        .transform((val) => val === "true")
        .optional()
        .default("false")
        .describe("Include internal comments"),
      limit: z
        .string()
        .transform(Number)
        .optional()
        .default("100")
        .describe("Number of items per page"),
      offset: z
        .string()
        .transform(Number)
        .optional()
        .default("0")
        .describe("Number of items to skip"),
    }),
  },
  responses: {
    200: {
      description: "Post comments retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(CommentSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid post or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getCommentStatsRoute = createRoute({
  method: "get",
  path: "/comments/{id}/stats",
  tags: ["Comments"],
  summary: "Get comment statistics",
  description: "Retrieve statistics for a specific comment",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Comment ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Comment statistics retrieved successfully",
      content: {
        "application/json": {
          schema: GetCommentStatsResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid comment or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Comment not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

// Vote routes
export const createVoteRoute = createRoute({
  method: "post",
  path: "/votes",
  tags: ["Votes"],
  summary: "Create new vote",
  description: "Cast a vote on a post or comment",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateVoteSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Vote created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            vote: VoteSchema,
          }),
        },
      },
    },
    400: {
      description: "Bad request - Invalid input data",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    409: {
      description: "Vote already exists for this user",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const updateVoteRoute = createRoute({
  method: "put",
  path: "/votes/{id}",
  tags: ["Votes"],
  summary: "Update vote",
  description:
    "Update an existing vote (change from upvote to downvote or vice versa)",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Vote ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateVoteSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Vote updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            vote: VoteSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid vote or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Vote not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const deleteVoteRoute = createRoute({
  method: "delete",
  path: "/votes/{id}",
  tags: ["Votes"],
  summary: "Delete vote",
  description: "Remove a vote (unvote)",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Vote ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Vote deleted successfully",
      content: {
        "application/json": {
          schema: DeleteVoteResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid vote or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Vote not found",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getVotesByPostRoute = createRoute({
  method: "get",
  path: "/votes/post/{postId}",
  tags: ["Votes"],
  summary: "Get votes by post",
  description: "Retrieve all votes for a specific post",
  request: {
    params: PostIdParamsSchema,
    query: GetVotesByPostQuerySchema,
  },
  responses: {
    200: {
      description: "Post votes retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(VoteSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid post or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getVotesByCommentRoute = createRoute({
  method: "get",
  path: "/votes/comment/{commentId}",
  tags: ["Votes"],
  summary: "Get votes by comment",
  description: "Retrieve all votes for a specific comment",
  request: {
    params: z.object({
      commentId: z.string().transform(Number).describe("Comment ID"),
    }),
    query: GetVotesByCommentQuerySchema,
  },
  responses: {
    200: {
      description: "Comment votes retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(VoteSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid comment or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getVoteCountsRoute = createRoute({
  method: "get",
  path: "/votes/counts/{entityType}/{entityId}",
  tags: ["Votes"],
  summary: "Get vote counts",
  description: "Get aggregated vote counts for a post or comment",
  request: {
    params: z.object({
      entityType: z.enum(["post", "comment"]).describe("Type of entity"),
      entityId: z.string().transform(Number).describe("Entity ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Vote counts retrieved successfully",
      content: {
        "application/json": {
          schema: GetVoteCountsResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid entity type, ID, or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});

export const getUserVoteRoute = createRoute({
  method: "get",
  path: "/votes/user/{userId}/{entityType}/{entityId}",
  tags: ["Votes"],
  summary: "Get user vote",
  description: "Check if a user has voted on a specific post or comment",
  request: {
    params: z.object({
      userId: z.string().describe("User ID"),
      entityType: z.enum(["post", "comment"]).describe("Type of entity"),
      entityId: z.string().transform(Number).describe("Entity ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "User vote retrieved successfully",
      content: {
        "application/json": {
          schema: GetUserVoteResponseSchema,
        },
      },
    },
    400: {
      description: "Invalid parameters",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    500: {
      description: "Internal server error",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
  },
});
