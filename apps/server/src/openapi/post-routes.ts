import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  ErrorSchema,
  SuccessResponseSchema,
  PaginationSchema,
  PostSchema,
  CreatePostSchema,
  UpdatePostSchema,
  PostStatsSchema,
} from "./schemas";

// Create post route
export const createPostRoute = createRoute({
  method: "post",
  path: "/posts",
  tags: ["Posts"],
  summary: "Create new post",
  description: "Create a new post with AI-ready content and sentiment analysis",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePostSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Post created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            post: PostSchema,
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

// Get posts route
export const getPostsRoute = createRoute({
  method: "get",
  path: "/posts",
  tags: ["Posts"],
  summary: "Get posts list",
  description: "Retrieve a paginated list of posts with optional filtering",
  request: {
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID to filter posts"),
      boardId: z
        .string()
        .transform(Number)
        .optional()
        .describe("Filter by board ID"),
      authorId: z
        .string()
        .optional()
        .describe("Filter by author ID"),
      status: z
        .enum(["draft", "published", "archived", "deleted"])
        .optional()
        .describe("Filter by post status"),
      priority: z
        .string()
        .transform(Number)
        .optional()
        .describe("Filter by priority level"),
      limit: z
        .string()
        .transform(Number)
        .optional()
        .default("50")
        .describe("Number of items per page"),
      offset: z
        .string()
        .transform(Number)
        .optional()
        .default("0")
        .describe("Number of items to skip"),
      search: z
        .string()
        .optional()
        .describe("Search query for post title/content"),
    }),
  },
  responses: {
    200: {
      description: "Posts retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(PostSchema),
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

// Get post by ID route
export const getPostByIdRoute = createRoute({
  method: "get",
  path: "/posts/{id}",
  tags: ["Posts"],
  summary: "Get post by ID",
  description: "Retrieve a specific post by its ID",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Post ID"),
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
      description: "Post retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: PostSchema,
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
    404: {
      description: "Post not found",
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

// Get post by slug route
export const getPostBySlugRoute = createRoute({
  method: "get",
  path: "/posts/slug/{slug}",
  tags: ["Posts"],
  summary: "Get post by slug",
  description: "Retrieve a specific post by its slug identifier",
  request: {
    params: z.object({
      slug: z.string().describe("Post slug"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
      boardId: z
        .string()
        .transform(Number)
        .optional()
        .describe("Board ID for additional context"),
    }),
  },
  responses: {
    200: {
      description: "Post retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: PostSchema,
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
    404: {
      description: "Post not found",
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

// Update post route
export const updatePostRoute = createRoute({
  method: "put",
  path: "/posts/{id}",
  tags: ["Posts"],
  summary: "Update post",
  description: "Update an existing post's content and metadata",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Post ID"),
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
          schema: UpdatePostSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Post updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            post: PostSchema,
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
    404: {
      description: "Post not found",
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

// Delete post route
export const deletePostRoute = createRoute({
  method: "delete",
  path: "/posts/{id}",
  tags: ["Posts"],
  summary: "Delete post",
  description: "Soft delete a post (sets status to deleted)",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Post ID"),
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
      description: "Post deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            post: PostSchema,
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
    404: {
      description: "Post not found",
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

// Update post sentiment route
export const updatePostSentimentRoute = createRoute({
  method: "post",
  path: "/posts/{id}/sentiment",
  tags: ["Posts"],
  summary: "Update post sentiment",
  description: "Update the AI sentiment score for a post",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Post ID"),
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
          schema: z.object({
            sentimentScore: z
              .number()
              .min(-1)
              .max(1)
              .describe("Sentiment score between -1 (negative) and 1 (positive)"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Post sentiment updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            post: PostSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid post or tenant ID, or invalid sentiment score",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Post not found",
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

// Get posts by board route
export const getPostsByBoardRoute = createRoute({
  method: "get",
  path: "/posts/board/{boardId}",
  tags: ["Posts"],
  summary: "Get posts by board",
  description: "Retrieve all posts belonging to a specific board",
  request: {
    params: z.object({
      boardId: z.string().transform(Number).describe("Board ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
      status: z
        .enum(["draft", "published", "archived", "deleted"])
        .optional()
        .describe("Filter by post status"),
      limit: z
        .string()
        .transform(Number)
        .optional()
        .default("50")
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
      description: "Board posts retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(PostSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid board or tenant ID",
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

// Get post statistics route
export const getPostStatsRoute = createRoute({
  method: "get",
  path: "/posts/{id}/stats",
  tags: ["Posts"],
  summary: "Get post statistics",
  description: "Retrieve statistics for a specific post including votes and comments",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Post ID"),
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
      description: "Post statistics retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: PostStatsSchema,
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
    404: {
      description: "Post not found",
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

// Search posts route
export const searchPostsRoute = createRoute({
  method: "get",
  path: "/posts/search",
  tags: ["Posts"],
  summary: "Search posts",
  description: "Search for posts by title or content",
  request: {
    query: z.object({
      q: z.string().min(1).describe("Search query"),
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
      boardId: z
        .string()
        .transform(Number)
        .optional()
        .describe("Filter by board ID"),
      status: z
        .enum(["draft", "published", "archived", "deleted"])
        .optional()
        .describe("Filter by post status"),
      limit: z
        .string()
        .transform(Number)
        .optional()
        .default("20")
        .describe("Number of results to return"),
    }),
  },
  responses: {
    200: {
      description: "Post search completed successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(PostSchema),
            query: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Missing search query or invalid tenant ID",
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
