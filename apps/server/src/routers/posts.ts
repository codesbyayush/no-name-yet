import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { PostFunctions } from "../functions/posts";

const postsRouter = new Hono();

// Validation schemas
const createPostSchema = z.object({
  tenantId: z.number(),
  boardId: z.number(),
  authorId: z.string(),
  title: z.string().min(1, "Post title is required"),
  slug: z.string().min(1, "Post slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  content: z.string().min(1, "Post content is required"),
  status: z.enum(["draft", "published", "archived", "deleted"]).optional().default("draft"),
  priority: z.number().min(0).max(10).optional().default(0),
  customFields: z.record(z.any()).optional(),
  contentVector: z.record(z.any()).optional(),
});

const updatePostSchema = z.object({
  title: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional(),
  content: z.string().min(1).optional(),
  status: z.enum(["draft", "published", "archived", "deleted"]).optional(),
  priority: z.number().min(0).max(10).optional(),
  customFields: z.record(z.any()).optional(),
  contentVector: z.record(z.any()).optional(),
  sentimentScore: z.number().min(-1).max(1).optional(),
});

const getPostsQuerySchema = z.object({
  tenantId: z.string().transform(Number),
  boardId: z.string().transform(Number).optional(),
  authorId: z.string().optional(),
  status: z.enum(["draft", "published", "archived", "deleted"]).optional(),
  priority: z.string().transform(Number).optional(),
  limit: z.string().transform(Number).optional().default("50"),
  offset: z.string().transform(Number).optional().default("0"),
  search: z.string().optional(),
});

const updateSentimentSchema = z.object({
  sentimentScore: z.number().min(-1).max(1),
});

// POST /api/posts - Create a new post
postsRouter.post(
  "/",
  zValidator("json", createPostSchema),
  async (c) => {
    try {
      const postData = c.req.valid("json");

      const newPost = await PostFunctions.createPost(postData);

      return c.json({
        success: true,
        message: "Post created successfully",
        post: newPost,
      }, 201);

    } catch (error) {
      console.error("Error creating post:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to create post",
      }, 500);
    }
  }
);

// GET /api/posts - Get posts with filters
postsRouter.get(
  "/",
  zValidator("query", getPostsQuerySchema),
  async (c) => {
    try {
      const filters = c.req.valid("query");

      const posts = await PostFunctions.getPostsByTenant(filters);

      return c.json({
        success: true,
        data: posts,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: posts.length,
        },
      });

    } catch (error) {
      console.error("Error fetching posts:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to fetch posts",
      }, 500);
    }
  }
);

// GET /api/posts/:id - Get specific post by ID
postsRouter.get("/:id", async (c) => {
  try {
    const postId = parseInt(c.req.param("id"));
    const tenantId = parseInt(c.req.query("tenantId") || "0");

    if (isNaN(postId)) {
      return c.json({
        error: "Invalid post ID",
        message: "Post ID must be a number",
      }, 400);
    }

    if (isNaN(tenantId) || tenantId === 0) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Valid tenant ID is required",
      }, 400);
    }

    const post = await PostFunctions.getPostById(postId, tenantId);

    if (!post) {
      return c.json({
        error: "Post not found",
        message: "The specified post does not exist",
      }, 404);
    }

    return c.json({
      success: true,
      data: post,
    });

  } catch (error) {
    console.error("Error fetching post:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch post",
    }, 500);
  }
});

// GET /api/posts/slug/:slug - Get post by slug
postsRouter.get("/slug/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const boardId = parseInt(c.req.query("boardId") || "0");
    const tenantId = parseInt(c.req.query("tenantId") || "0");

    if (isNaN(boardId) || boardId === 0) {
      return c.json({
        error: "Invalid board ID",
        message: "Valid board ID is required",
      }, 400);
    }

    if (isNaN(tenantId) || tenantId === 0) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Valid tenant ID is required",
      }, 400);
    }

    const post = await PostFunctions.getPostBySlug(slug, boardId, tenantId);

    if (!post) {
      return c.json({
        error: "Post not found",
        message: "The specified post does not exist",
      }, 404);
    }

    return c.json({
      success: true,
      data: post,
    });

  } catch (error) {
    console.error("Error fetching post by slug:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch post",
    }, 500);
  }
});

// GET /api/posts/board/:boardId - Get posts by board
postsRouter.get("/board/:boardId", async (c) => {
  try {
    const boardId = parseInt(c.req.param("boardId"));
    const tenantId = parseInt(c.req.query("tenantId") || "0");
    const status = c.req.query("status") as "draft" | "published" | "archived" | "deleted" | undefined;
    const authorId = c.req.query("authorId");
    const priority = c.req.query("priority") ? parseInt(c.req.query("priority")!) : undefined;
    const limit = parseInt(c.req.query("limit") || "50");
    const offset = parseInt(c.req.query("offset") || "0");
    const search = c.req.query("search");

    if (isNaN(boardId)) {
      return c.json({
        error: "Invalid board ID",
        message: "Board ID must be a number",
      }, 400);
    }

    if (isNaN(tenantId) || tenantId === 0) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Valid tenant ID is required",
      }, 400);
    }

    const posts = await PostFunctions.getPostsByBoard(boardId, tenantId, {
      status,
      authorId,
      priority,
      limit,
      offset,
      search,
    });

    return c.json({
      success: true,
      data: posts,
      pagination: {
        limit,
        offset,
        total: posts.length,
      },
    });

  } catch (error) {
    console.error("Error fetching posts by board:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch posts",
    }, 500);
  }
});

// PUT /api/posts/:id - Update post
postsRouter.put(
  "/:id",
  zValidator("json", updatePostSchema),
  async (c) => {
    try {
      const postId = parseInt(c.req.param("id"));
      const tenantId = parseInt(c.req.query("tenantId") || "0");
      const updateData = c.req.valid("json");

      if (isNaN(postId)) {
        return c.json({
          error: "Invalid post ID",
          message: "Post ID must be a number",
        }, 400);
      }

      if (isNaN(tenantId) || tenantId === 0) {
        return c.json({
          error: "Invalid tenant ID",
          message: "Valid tenant ID is required",
        }, 400);
      }

      const updatedPost = await PostFunctions.updatePost(postId, tenantId, updateData);

      return c.json({
        success: true,
        message: "Post updated successfully",
        post: updatedPost,
      });

    } catch (error) {
      console.error("Error updating post:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to update post",
      }, 500);
    }
  }
);

// DELETE /api/posts/:id - Soft delete post
postsRouter.delete("/:id", async (c) => {
  try {
    const postId = parseInt(c.req.param("id"));
    const tenantId = parseInt(c.req.query("tenantId") || "0");

    if (isNaN(postId)) {
      return c.json({
        error: "Invalid post ID",
        message: "Post ID must be a number",
      }, 400);
    }

    if (isNaN(tenantId) || tenantId === 0) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Valid tenant ID is required",
      }, 400);
    }

    const deletedPost = await PostFunctions.softDeletePost(postId, tenantId);

    return c.json({
      success: true,
      message: "Post deleted successfully",
      post: deletedPost,
    });

  } catch (error) {
    console.error("Error deleting post:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to delete post",
    }, 500);
  }
});

// POST /api/posts/:id/restore - Restore deleted post
postsRouter.post("/:id/restore", async (c) => {
  try {
    const postId = parseInt(c.req.param("id"));
    const tenantId = parseInt(c.req.query("tenantId") || "0");

    if (isNaN(postId)) {
      return c.json({
        error: "Invalid post ID",
        message: "Post ID must be a number",
      }, 400);
    }

    if (isNaN(tenantId) || tenantId === 0) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Valid tenant ID is required",
      }, 400);
    }

    const restoredPost = await PostFunctions.restorePost(postId, tenantId);

    return c.json({
      success: true,
      message: "Post restored successfully",
      post: restoredPost,
    });

  } catch (error) {
    console.error("Error restoring post:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to restore post",
    }, 500);
  }
});

// POST /api/posts/:id/upvote - Increment upvotes
postsRouter.post("/:id/upvote", async (c) => {
  try {
    const postId = parseInt(c.req.param("id"));

    if (isNaN(postId)) {
      return c.json({
        error: "Invalid post ID",
        message: "Post ID must be a number",
      }, 400);
    }

    await PostFunctions.incrementUpvotes(postId);

    return c.json({
      success: true,
      message: "Upvote added successfully",
    });

  } catch (error) {
    console.error("Error adding upvote:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to add upvote",
    }, 500);
  }
});

// POST /api/posts/:id/downvote - Increment downvotes
postsRouter.post("/:id/downvote", async (c) => {
  try {
    const postId = parseInt(c.req.param("id"));

    if (isNaN(postId)) {
      return c.json({
        error: "Invalid post ID",
        message: "Post ID must be a number",
      }, 400);
    }

    await PostFunctions.incrementDownvotes(postId);

    return c.json({
      success: true,
      message: "Downvote added successfully",
    });

  } catch (error) {
    console.error("Error adding downvote:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to add downvote",
    }, 500);
  }
});

// POST /api/posts/:id/sentiment - Update sentiment score
postsRouter.post(
  "/:id/sentiment",
  zValidator("json", updateSentimentSchema),
  async (c) => {
    try {
      const postId = parseInt(c.req.param("id"));
      const { sentimentScore } = c.req.valid("json");

      if (isNaN(postId)) {
        return c.json({
          error: "Invalid post ID",
          message: "Post ID must be a number",
        }, 400);
      }

      await PostFunctions.updateSentimentScore(postId, sentimentScore);

      return c.json({
        success: true,
        message: "Sentiment score updated successfully",
      });

    } catch (error) {
      console.error("Error updating sentiment score:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to update sentiment score",
      }, 500);
    }
  }
);

// GET /api/posts/top/:tenantId - Get top voted posts
postsRouter.get("/top/:tenantId", async (c) => {
  try {
    const tenantId = parseInt(c.req.param("tenantId"));
    const boardId = c.req.query("boardId") ? parseInt(c.req.query("boardId")!) : undefined;
    const limit = parseInt(c.req.query("limit") || "10");

    if (isNaN(tenantId)) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Tenant ID must be a number",
      }, 400);
    }

    const topPosts = await PostFunctions.getTopPosts(tenantId, boardId, limit);

    return c.json({
      success: true,
      data: topPosts,
    });

  } catch (error) {
    console.error("Error fetching top posts:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch top posts",
    }, 500);
  }
});

// GET /api/posts/:id/stats - Get post statistics
postsRouter.get("/:id/stats", async (c) => {
  try {
    const postId = parseInt(c.req.param("id"));
    const tenantId = parseInt(c.req.query("tenantId") || "0");

    if (isNaN(postId)) {
      return c.json({
        error: "Invalid post ID",
        message: "Post ID must be a number",
      }, 400);
    }

    if (isNaN(tenantId) || tenantId === 0) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Valid tenant ID is required",
      }, 400);
    }

    const stats = await PostFunctions.getPostStats(postId, tenantId);

    return c.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error("Error fetching post stats:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch post stats",
    }, 500);
  }
});

// GET /api/posts/stats/tenant/:tenantId - Get tenant post statistics
postsRouter.get("/stats/tenant/:tenantId", async (c) => {
  try {
    const tenantId = parseInt(c.req.param("tenantId"));

    if (isNaN(tenantId)) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Tenant ID must be a number",
      }, 400);
    }

    const stats = await PostFunctions.getTenantPostStats(tenantId);

    return c.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error("Error fetching tenant post stats:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch tenant post stats",
    }, 500);
  }
});

// GET /api/posts/search/:tenantId - Search posts
postsRouter.get("/search/:tenantId", async (c) => {
  try {
    const tenantId = parseInt(c.req.param("tenantId"));
    const query = c.req.query("q") || "";
    const boardId = c.req.query("boardId") ? parseInt(c.req.query("boardId")!) : undefined;
    const limit = parseInt(c.req.query("limit") || "20");

    if (isNaN(tenantId)) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Tenant ID must be a number",
      }, 400);
    }

    if (!query) {
      return c.json({
        error: "Missing search query",
        message: "Search query (q) is required",
      }, 400);
    }

    const posts = await PostFunctions.searchPosts(query, tenantId, boardId, limit);

    return c.json({
      success: true,
      data: posts,
      query,
    });

  } catch (error) {
    console.error("Error searching posts:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to search posts",
    }, 500);
  }
});

export { postsRouter };
