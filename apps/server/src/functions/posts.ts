import { db } from "../db";
import { posts, boards, type Post, type NewPost } from "../db/schema";
import { eq, and, isNull, desc, asc, count, like } from "drizzle-orm";

export interface CreatePostData {
  tenantId: number;
  boardId: number;
  authorId: string;
  title: string;
  slug: string;
  content: string;
  status?: "draft" | "published" | "archived" | "deleted";
  priority?: number;
  customFields?: Record<string, any>;
  contentVector?: Record<string, any>; // AI embeddings as JSON until pgvector is set up
}

export interface UpdatePostData {
  title?: string;
  slug?: string;
  content?: string;
  status?: "draft" | "published" | "archived" | "deleted";
  priority?: number;
  customFields?: Record<string, any>;
  contentVector?: Record<string, any>;
  sentimentScore?: number;
}

export interface PostFilters {
  tenantId: number;
  boardId?: number;
  authorId?: string;
  status?: "draft" | "published" | "archived" | "deleted";
  isDeleted?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
  priority?: number;
}

export class PostFunctions {
  static async createPost(postData: CreatePostData): Promise<Post> {
    try {
      // Check if slug already exists for this board
      const existingPost = await db.query.posts.findFirst({
        where: and(
          eq(posts.tenantId, postData.tenantId),
          eq(posts.boardId, postData.boardId),
          eq(posts.slug, postData.slug),
          isNull(posts.deletedAt)
        ),
      });

      if (existingPost) {
        throw new Error("A post with this slug already exists in this board");
      }

      const [newPost] = await db
        .insert(posts)
        .values({
          tenantId: postData.tenantId,
          boardId: postData.boardId,
          authorId: postData.authorId,
          title: postData.title,
          slug: postData.slug,
          content: postData.content,
          status: postData.status || "draft",
          priority: postData.priority || 0,
          customFields: postData.customFields,
          contentVector: postData.contentVector,
          upvotes: 0,
          downvotes: 0,
        })
        .returning();

      // If post is published, increment board post count
      if (newPost.status === "published") {
        await db
          .update(boards)
          .set({
            postCount: boards.postCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(boards.id, postData.boardId));
      }

      return newPost;
    } catch (error) {
      throw new Error(`Failed to create post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPostById(postId: number, tenantId: number): Promise<Post | null> {
    try {
      const post = await db.query.posts.findFirst({
        where: and(
          eq(posts.id, postId),
          eq(posts.tenantId, tenantId),
          isNull(posts.deletedAt)
        ),
      });

      return post || null;
    } catch (error) {
      throw new Error(`Failed to get post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPostBySlug(slug: string, boardId: number, tenantId: number): Promise<Post | null> {
    try {
      const post = await db.query.posts.findFirst({
        where: and(
          eq(posts.slug, slug),
          eq(posts.boardId, boardId),
          eq(posts.tenantId, tenantId),
          isNull(posts.deletedAt)
        ),
      });

      return post || null;
    } catch (error) {
      throw new Error(`Failed to get post by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPostsByBoard(boardId: number, tenantId: number, filters: Partial<PostFilters> = {}): Promise<Post[]> {
    try {
      const conditions = [
        eq(posts.boardId, boardId),
        eq(posts.tenantId, tenantId),
        isNull(posts.deletedAt)
      ];

      if (filters.status) {
        conditions.push(eq(posts.status, filters.status));
      }

      if (filters.authorId) {
        conditions.push(eq(posts.authorId, filters.authorId));
      }

      if (filters.priority !== undefined) {
        conditions.push(eq(posts.priority, filters.priority));
      }

      let postsList = await db.query.posts.findMany({
        where: and(...conditions),
        orderBy: [desc(posts.priority), desc(posts.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        postsList = postsList.filter(post =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm)
        );
      }

      return postsList;
    } catch (error) {
      throw new Error(`Failed to get posts by board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPostsByTenant(filters: PostFilters): Promise<Post[]> {
    try {
      const conditions = [
        eq(posts.tenantId, filters.tenantId),
        isNull(posts.deletedAt)
      ];

      if (filters.boardId) {
        conditions.push(eq(posts.boardId, filters.boardId));
      }

      if (filters.status) {
        conditions.push(eq(posts.status, filters.status));
      }

      if (filters.authorId) {
        conditions.push(eq(posts.authorId, filters.authorId));
      }

      if (filters.priority !== undefined) {
        conditions.push(eq(posts.priority, filters.priority));
      }

      let postsList = await db.query.posts.findMany({
        where: and(...conditions),
        orderBy: [desc(posts.priority), desc(posts.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        postsList = postsList.filter(post =>
          post.title.toLowerCase().includes(searchTerm) ||
          post.content.toLowerCase().includes(searchTerm)
        );
      }

      return postsList;
    } catch (error) {
      throw new Error(`Failed to get posts by tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updatePost(postId: number, tenantId: number, updateData: UpdatePostData): Promise<Post> {
    try {
      // Get current post to check status change
      const currentPost = await this.getPostById(postId, tenantId);
      if (!currentPost) {
        throw new Error("Post not found");
      }

      // If updating slug, check for conflicts
      if (updateData.slug) {
        const existingPost = await db.query.posts.findFirst({
          where: and(
            eq(posts.tenantId, tenantId),
            eq(posts.boardId, currentPost.boardId),
            eq(posts.slug, updateData.slug),
            isNull(posts.deletedAt)
          ),
        });

        if (existingPost && existingPost.id !== postId) {
          throw new Error("A post with this slug already exists in this board");
        }
      }

      const [updatedPost] = await db
        .update(posts)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(posts.id, postId),
          eq(posts.tenantId, tenantId),
          isNull(posts.deletedAt)
        ))
        .returning();

      if (!updatedPost) {
        throw new Error("Post not found or already deleted");
      }

      // Handle board post count changes for status updates
      if (updateData.status && updateData.status !== currentPost.status) {
        const boardId = currentPost.boardId;

        if (currentPost.status === "published" && updateData.status !== "published") {
          // Post was published, now it's not - decrement count
          await db
            .update(boards)
            .set({
              postCount: boards.postCount - 1,
              updatedAt: new Date(),
            })
            .where(eq(boards.id, boardId));
        } else if (currentPost.status !== "published" && updateData.status === "published") {
          // Post wasn't published, now it is - increment count
          await db
            .update(boards)
            .set({
              postCount: boards.postCount + 1,
              updatedAt: new Date(),
            })
            .where(eq(boards.id, boardId));
        }
      }

      return updatedPost;
    } catch (error) {
      throw new Error(`Failed to update post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async softDeletePost(postId: number, tenantId: number): Promise<Post> {
    try {
      const currentPost = await this.getPostById(postId, tenantId);
      if (!currentPost) {
        throw new Error("Post not found");
      }

      const [deletedPost] = await db
        .update(posts)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(posts.id, postId),
          eq(posts.tenantId, tenantId),
          isNull(posts.deletedAt)
        ))
        .returning();

      if (!deletedPost) {
        throw new Error("Post not found or already deleted");
      }

      // If post was published, decrement board post count
      if (currentPost.status === "published") {
        await db
          .update(boards)
          .set({
            postCount: boards.postCount - 1,
            updatedAt: new Date(),
          })
          .where(eq(boards.id, currentPost.boardId));
      }

      return deletedPost;
    } catch (error) {
      throw new Error(`Failed to delete post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async restorePost(postId: number, tenantId: number): Promise<Post> {
    try {
      const [restoredPost] = await db
        .update(posts)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(and(
          eq(posts.id, postId),
          eq(posts.tenantId, tenantId)
        ))
        .returning();

      if (!restoredPost) {
        throw new Error("Post not found");
      }

      // If post is published, increment board post count
      if (restoredPost.status === "published") {
        await db
          .update(boards)
          .set({
            postCount: boards.postCount + 1,
            updatedAt: new Date(),
          })
          .where(eq(boards.id, restoredPost.boardId));
      }

      return restoredPost;
    } catch (error) {
      throw new Error(`Failed to restore post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async incrementUpvotes(postId: number): Promise<void> {
    try {
      await db
        .update(posts)
        .set({
          upvotes: posts.upvotes + 1,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));
    } catch (error) {
      throw new Error(`Failed to increment upvotes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async decrementUpvotes(postId: number): Promise<void> {
    try {
      await db
        .update(posts)
        .set({
          upvotes: posts.upvotes - 1,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));
    } catch (error) {
      throw new Error(`Failed to decrement upvotes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async incrementDownvotes(postId: number): Promise<void> {
    try {
      await db
        .update(posts)
        .set({
          downvotes: posts.downvotes + 1,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));
    } catch (error) {
      throw new Error(`Failed to increment downvotes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async decrementDownvotes(postId: number): Promise<void> {
    try {
      await db
        .update(posts)
        .set({
          downvotes: posts.downvotes - 1,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));
    } catch (error) {
      throw new Error(`Failed to decrement downvotes: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateSentimentScore(postId: number, sentimentScore: number): Promise<void> {
    try {
      await db
        .update(posts)
        .set({
          sentimentScore,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));
    } catch (error) {
      throw new Error(`Failed to update sentiment score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTopPosts(tenantId: number, boardId?: number, limit = 10): Promise<Post[]> {
    try {
      const conditions = [
        eq(posts.tenantId, tenantId),
        eq(posts.status, "published"),
        isNull(posts.deletedAt)
      ];

      if (boardId) {
        conditions.push(eq(posts.boardId, boardId));
      }

      const topPosts = await db.query.posts.findMany({
        where: and(...conditions),
        orderBy: [desc(posts.upvotes), desc(posts.priority)],
        limit,
      });

      return topPosts;
    } catch (error) {
      throw new Error(`Failed to get top posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPostStats(postId: number, tenantId: number) {
    try {
      const post = await this.getPostById(postId, tenantId);
      if (!post) {
        throw new Error("Post not found");
      }

      // In a real implementation, you'd join with comments, votes, etc.
      return {
        id: post.id,
        title: post.title,
        upvotes: post.upvotes,
        downvotes: post.downvotes,
        score: (post.upvotes || 0) - (post.downvotes || 0),
        priority: post.priority,
        status: post.status,
        sentimentScore: post.sentimentScore,
        createdAt: post.createdAt,
        updatedAt: post.updatedAt,
      };
    } catch (error) {
      throw new Error(`Failed to get post stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTenantPostStats(tenantId: number) {
    try {
      const allPosts = await db.query.posts.findMany({
        where: and(
          eq(posts.tenantId, tenantId),
          isNull(posts.deletedAt)
        ),
        columns: {
          id: true,
          status: true,
          priority: true,
          upvotes: true,
          downvotes: true,
          createdAt: true,
        },
      });

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        total: allPosts.length,
        byStatus: allPosts.reduce((acc, post) => {
          acc[post.status] = (acc[post.status] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalUpvotes: allPosts.reduce((sum, p) => sum + (p.upvotes || 0), 0),
        totalDownvotes: allPosts.reduce((sum, p) => sum + (p.downvotes || 0), 0),
        highPriority: allPosts.filter(p => (p.priority || 0) > 5).length,
        newThisWeek: allPosts.filter(p => p.createdAt > oneWeekAgo).length,
        newThisMonth: allPosts.filter(p => p.createdAt > oneMonthAgo).length,
      };
    } catch (error) {
      throw new Error(`Failed to get tenant post stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async searchPosts(query: string, tenantId: number, boardId?: number, limit = 20): Promise<Post[]> {
    try {
      const conditions = [
        eq(posts.tenantId, tenantId),
        eq(posts.status, "published"),
        isNull(posts.deletedAt)
      ];

      if (boardId) {
        conditions.push(eq(posts.boardId, boardId));
      }

      const postsList = await db.query.posts.findMany({
        where: and(...conditions),
        orderBy: [desc(posts.priority), desc(posts.upvotes)],
        limit,
      });

      // Filter by query (basic string matching)
      const searchTerm = query.toLowerCase();
      return postsList.filter(post =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.content.toLowerCase().includes(searchTerm) ||
        post.slug.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      throw new Error(`Failed to search posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
