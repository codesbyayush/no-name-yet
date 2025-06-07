import { db } from "../db";
import { comments, posts, type Comment, type NewComment } from "../db/schema";
import { eq, and, isNull, desc, asc, count } from "drizzle-orm";

export interface CreateCommentData {
  tenantId: number;
  postId: number;
  parentCommentId?: number;
  authorId: string;
  content: string;
  isInternal?: boolean;
}

export interface UpdateCommentData {
  content?: string;
  isInternal?: boolean;
  sentimentScore?: number;
}

export interface CommentFilters {
  tenantId: number;
  postId?: number;
  authorId?: string;
  parentCommentId?: number;
  isInternal?: boolean;
  isDeleted?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export class CommentFunctions {
  static async createComment(commentData: CreateCommentData): Promise<Comment> {
    try {
      // Verify post exists
      const post = await db.query.posts.findFirst({
        where: and(
          eq(posts.id, commentData.postId),
          eq(posts.tenantId, commentData.tenantId),
          isNull(posts.deletedAt)
        ),
      });

      if (!post) {
        throw new Error("Post not found or deleted");
      }

      // If parent comment specified, verify it exists and belongs to the same post
      if (commentData.parentCommentId) {
        const parentComment = await db.query.comments.findFirst({
          where: and(
            eq(comments.id, commentData.parentCommentId),
            eq(comments.postId, commentData.postId),
            eq(comments.tenantId, commentData.tenantId),
            isNull(comments.deletedAt)
          ),
        });

        if (!parentComment) {
          throw new Error("Parent comment not found or doesn't belong to this post");
        }
      }

      const [newComment] = await db
        .insert(comments)
        .values({
          tenantId: commentData.tenantId,
          postId: commentData.postId,
          parentCommentId: commentData.parentCommentId,
          authorId: commentData.authorId,
          content: commentData.content,
          isInternal: commentData.isInternal || false,
        })
        .returning();

      return newComment;
    } catch (error) {
      throw new Error(`Failed to create comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCommentById(commentId: number, tenantId: number): Promise<Comment | null> {
    try {
      const comment = await db.query.comments.findFirst({
        where: and(
          eq(comments.id, commentId),
          eq(comments.tenantId, tenantId),
          isNull(comments.deletedAt)
        ),
      });

      return comment || null;
    } catch (error) {
      throw new Error(`Failed to get comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCommentsByPost(postId: number, tenantId: number, filters: Partial<CommentFilters> = {}): Promise<Comment[]> {
    try {
      const conditions = [
        eq(comments.postId, postId),
        eq(comments.tenantId, tenantId),
        isNull(comments.deletedAt)
      ];

      if (filters.authorId) {
        conditions.push(eq(comments.authorId, filters.authorId));
      }

      if (filters.parentCommentId !== undefined) {
        if (filters.parentCommentId === null) {
          conditions.push(isNull(comments.parentCommentId));
        } else {
          conditions.push(eq(comments.parentCommentId, filters.parentCommentId));
        }
      }

      if (filters.isInternal !== undefined) {
        conditions.push(eq(comments.isInternal, filters.isInternal));
      }

      let commentsList = await db.query.comments.findMany({
        where: and(...conditions),
        orderBy: [asc(comments.createdAt)],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      });

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        commentsList = commentsList.filter(comment =>
          comment.content.toLowerCase().includes(searchTerm)
        );
      }

      return commentsList;
    } catch (error) {
      throw new Error(`Failed to get comments by post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCommentsByTenant(filters: CommentFilters): Promise<Comment[]> {
    try {
      const conditions = [
        eq(comments.tenantId, filters.tenantId),
        isNull(comments.deletedAt)
      ];

      if (filters.postId) {
        conditions.push(eq(comments.postId, filters.postId));
      }

      if (filters.authorId) {
        conditions.push(eq(comments.authorId, filters.authorId));
      }

      if (filters.parentCommentId !== undefined) {
        if (filters.parentCommentId === null) {
          conditions.push(isNull(comments.parentCommentId));
        } else {
          conditions.push(eq(comments.parentCommentId, filters.parentCommentId));
        }
      }

      if (filters.isInternal !== undefined) {
        conditions.push(eq(comments.isInternal, filters.isInternal));
      }

      let commentsList = await db.query.comments.findMany({
        where: and(...conditions),
        orderBy: [desc(comments.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        commentsList = commentsList.filter(comment =>
          comment.content.toLowerCase().includes(searchTerm)
        );
      }

      return commentsList;
    } catch (error) {
      throw new Error(`Failed to get comments by tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateComment(commentId: number, tenantId: number, updateData: UpdateCommentData): Promise<Comment> {
    try {
      const [updatedComment] = await db
        .update(comments)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(comments.id, commentId),
          eq(comments.tenantId, tenantId),
          isNull(comments.deletedAt)
        ))
        .returning();

      if (!updatedComment) {
        throw new Error("Comment not found or already deleted");
      }

      return updatedComment;
    } catch (error) {
      throw new Error(`Failed to update comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async softDeleteComment(commentId: number, tenantId: number): Promise<Comment> {
    try {
      const [deletedComment] = await db
        .update(comments)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(comments.id, commentId),
          eq(comments.tenantId, tenantId),
          isNull(comments.deletedAt)
        ))
        .returning();

      if (!deletedComment) {
        throw new Error("Comment not found or already deleted");
      }

      return deletedComment;
    } catch (error) {
      throw new Error(`Failed to delete comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async restoreComment(commentId: number, tenantId: number): Promise<Comment> {
    try {
      const [restoredComment] = await db
        .update(comments)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(and(
          eq(comments.id, commentId),
          eq(comments.tenantId, tenantId)
        ))
        .returning();

      if (!restoredComment) {
        throw new Error("Comment not found");
      }

      return restoredComment;
    } catch (error) {
      throw new Error(`Failed to restore comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCommentThread(parentCommentId: number, tenantId: number): Promise<Comment[]> {
    try {
      const threadComments = await db.query.comments.findMany({
        where: and(
          eq(comments.parentCommentId, parentCommentId),
          eq(comments.tenantId, tenantId),
          isNull(comments.deletedAt)
        ),
        orderBy: [asc(comments.createdAt)],
      });

      return threadComments;
    } catch (error) {
      throw new Error(`Failed to get comment thread: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTopLevelComments(postId: number, tenantId: number, limit = 50): Promise<Comment[]> {
    try {
      const topLevelComments = await db.query.comments.findMany({
        where: and(
          eq(comments.postId, postId),
          eq(comments.tenantId, tenantId),
          isNull(comments.parentCommentId),
          isNull(comments.deletedAt)
        ),
        orderBy: [asc(comments.createdAt)],
        limit,
      });

      return topLevelComments;
    } catch (error) {
      throw new Error(`Failed to get top level comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCommentCount(postId: number, tenantId: number, includeInternal = false): Promise<number> {
    try {
      const conditions = [
        eq(comments.postId, postId),
        eq(comments.tenantId, tenantId),
        isNull(comments.deletedAt)
      ];

      if (!includeInternal) {
        conditions.push(eq(comments.isInternal, false));
      }

      const commentCount = await db.query.comments.findMany({
        where: and(...conditions),
        columns: { id: true },
      });

      return commentCount.length;
    } catch (error) {
      throw new Error(`Failed to get comment count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateSentimentScore(commentId: number, sentimentScore: number): Promise<void> {
    try {
      await db
        .update(comments)
        .set({
          sentimentScore,
          updatedAt: new Date(),
        })
        .where(eq(comments.id, commentId));
    } catch (error) {
      throw new Error(`Failed to update sentiment score: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCommentStats(tenantId: number, postId?: number) {
    try {
      const conditions = [
        eq(comments.tenantId, tenantId),
        isNull(comments.deletedAt)
      ];

      if (postId) {
        conditions.push(eq(comments.postId, postId));
      }

      const allComments = await db.query.comments.findMany({
        where: and(...conditions),
        columns: {
          id: true,
          isInternal: true,
          parentCommentId: true,
          sentimentScore: true,
          createdAt: true,
        },
      });

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        total: allComments.length,
        public: allComments.filter(c => !c.isInternal).length,
        internal: allComments.filter(c => c.isInternal).length,
        topLevel: allComments.filter(c => !c.parentCommentId).length,
        replies: allComments.filter(c => c.parentCommentId).length,
        averageSentiment: allComments
          .filter(c => c.sentimentScore !== null)
          .reduce((sum, c, _, arr) => sum + (c.sentimentScore || 0) / arr.length, 0),
        newThisWeek: allComments.filter(c => c.createdAt > oneWeekAgo).length,
        newThisMonth: allComments.filter(c => c.createdAt > oneMonthAgo).length,
      };
    } catch (error) {
      throw new Error(`Failed to get comment stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async searchComments(query: string, tenantId: number, postId?: number, includeInternal = false, limit = 20): Promise<Comment[]> {
    try {
      const conditions = [
        eq(comments.tenantId, tenantId),
        isNull(comments.deletedAt)
      ];

      if (postId) {
        conditions.push(eq(comments.postId, postId));
      }

      if (!includeInternal) {
        conditions.push(eq(comments.isInternal, false));
      }

      const commentsList = await db.query.comments.findMany({
        where: and(...conditions),
        orderBy: [desc(comments.createdAt)],
        limit,
      });

      // Filter by query (basic string matching)
      const searchTerm = query.toLowerCase();
      return commentsList.filter(comment =>
        comment.content.toLowerCase().includes(searchTerm)
      );
    } catch (error) {
      throw new Error(`Failed to search comments: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getCommentsByAuthor(authorId: string, tenantId: number, limit = 50): Promise<Comment[]> {
    try {
      const userComments = await db.query.comments.findMany({
        where: and(
          eq(comments.authorId, authorId),
          eq(comments.tenantId, tenantId),
          isNull(comments.deletedAt)
        ),
        orderBy: [desc(comments.createdAt)],
        limit,
      });

      return userComments;
    } catch (error) {
      throw new Error(`Failed to get comments by author: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
