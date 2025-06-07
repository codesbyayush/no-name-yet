import { db } from "../db";
import { votes, posts, comments, type Vote, type NewVote } from "../db/schema";
import { eq, and, isNull, desc, asc, count } from "drizzle-orm";

export interface CreateVoteData {
  tenantId: number;
  postId?: number;
  commentId?: number;
  userId: string;
  type: "upvote" | "downvote" | "bookmark";
  weight?: number;
}

export interface VoteFilters {
  tenantId: number;
  postId?: number;
  commentId?: number;
  userId?: string;
  type?: "upvote" | "downvote" | "bookmark";
  limit?: number;
  offset?: number;
}

export class VoteFunctions {
  static async createVote(voteData: CreateVoteData): Promise<Vote> {
    try {
      // Validate that either postId or commentId is provided, but not both
      if (!voteData.postId && !voteData.commentId) {
        throw new Error("Either postId or commentId must be provided");
      }

      if (voteData.postId && voteData.commentId) {
        throw new Error("Cannot vote on both post and comment simultaneously");
      }

      // Verify the target exists
      if (voteData.postId) {
        const post = await db.query.posts.findFirst({
          where: and(
            eq(posts.id, voteData.postId),
            eq(posts.tenantId, voteData.tenantId),
            isNull(posts.deletedAt)
          ),
        });

        if (!post) {
          throw new Error("Post not found or deleted");
        }
      }

      if (voteData.commentId) {
        const comment = await db.query.comments.findFirst({
          where: and(
            eq(comments.id, voteData.commentId),
            eq(comments.tenantId, voteData.tenantId),
            isNull(comments.deletedAt)
          ),
        });

        if (!comment) {
          throw new Error("Comment not found or deleted");
        }
      }

      // Check if user already voted on this item
      const existingVote = await db.query.votes.findFirst({
        where: and(
          eq(votes.tenantId, voteData.tenantId),
          eq(votes.userId, voteData.userId),
          voteData.postId ? eq(votes.postId, voteData.postId) : isNull(votes.postId),
          voteData.commentId ? eq(votes.commentId, voteData.commentId) : isNull(votes.commentId)
        ),
      });

      if (existingVote) {
        throw new Error("User has already voted on this item");
      }

      const [newVote] = await db
        .insert(votes)
        .values({
          tenantId: voteData.tenantId,
          postId: voteData.postId,
          commentId: voteData.commentId,
          userId: voteData.userId,
          type: voteData.type,
          weight: voteData.weight || 1,
        })
        .returning();

      // Update vote counts on the target
      if (voteData.postId) {
        await this.updatePostVoteCounts(voteData.postId);
      }

      return newVote;
    } catch (error) {
      throw new Error(`Failed to create vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getVoteById(voteId: number, tenantId: number): Promise<Vote | null> {
    try {
      const vote = await db.query.votes.findFirst({
        where: and(
          eq(votes.id, voteId),
          eq(votes.tenantId, tenantId)
        ),
      });

      return vote || null;
    } catch (error) {
      throw new Error(`Failed to get vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getUserVote(userId: string, tenantId: number, postId?: number, commentId?: number): Promise<Vote | null> {
    try {
      const conditions = [
        eq(votes.tenantId, tenantId),
        eq(votes.userId, userId)
      ];

      if (postId) {
        conditions.push(eq(votes.postId, postId));
        conditions.push(isNull(votes.commentId));
      } else if (commentId) {
        conditions.push(eq(votes.commentId, commentId));
        conditions.push(isNull(votes.postId));
      } else {
        throw new Error("Either postId or commentId must be provided");
      }

      const vote = await db.query.votes.findFirst({
        where: and(...conditions),
      });

      return vote || null;
    } catch (error) {
      throw new Error(`Failed to get user vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getVotesByPost(postId: number, tenantId: number, filters: Partial<VoteFilters> = {}): Promise<Vote[]> {
    try {
      const conditions = [
        eq(votes.postId, postId),
        eq(votes.tenantId, tenantId),
        isNull(votes.commentId)
      ];

      if (filters.type) {
        conditions.push(eq(votes.type, filters.type));
      }

      if (filters.userId) {
        conditions.push(eq(votes.userId, filters.userId));
      }

      const votesList = await db.query.votes.findMany({
        where: and(...conditions),
        orderBy: [desc(votes.createdAt)],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      });

      return votesList;
    } catch (error) {
      throw new Error(`Failed to get votes by post: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getVotesByComment(commentId: number, tenantId: number, filters: Partial<VoteFilters> = {}): Promise<Vote[]> {
    try {
      const conditions = [
        eq(votes.commentId, commentId),
        eq(votes.tenantId, tenantId),
        isNull(votes.postId)
      ];

      if (filters.type) {
        conditions.push(eq(votes.type, filters.type));
      }

      if (filters.userId) {
        conditions.push(eq(votes.userId, filters.userId));
      }

      const votesList = await db.query.votes.findMany({
        where: and(...conditions),
        orderBy: [desc(votes.createdAt)],
        limit: filters.limit || 100,
        offset: filters.offset || 0,
      });

      return votesList;
    } catch (error) {
      throw new Error(`Failed to get votes by comment: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getVotesByUser(userId: string, tenantId: number, filters: Partial<VoteFilters> = {}): Promise<Vote[]> {
    try {
      const conditions = [
        eq(votes.userId, userId),
        eq(votes.tenantId, tenantId)
      ];

      if (filters.type) {
        conditions.push(eq(votes.type, filters.type));
      }

      if (filters.postId) {
        conditions.push(eq(votes.postId, filters.postId));
      }

      if (filters.commentId) {
        conditions.push(eq(votes.commentId, filters.commentId));
      }

      const votesList = await db.query.votes.findMany({
        where: and(...conditions),
        orderBy: [desc(votes.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      return votesList;
    } catch (error) {
      throw new Error(`Failed to get votes by user: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateVote(voteId: number, tenantId: number, newType: "upvote" | "downvote" | "bookmark"): Promise<Vote> {
    try {
      const existingVote = await this.getVoteById(voteId, tenantId);
      if (!existingVote) {
        throw new Error("Vote not found");
      }

      const [updatedVote] = await db
        .update(votes)
        .set({
          type: newType,
        })
        .where(and(
          eq(votes.id, voteId),
          eq(votes.tenantId, tenantId)
        ))
        .returning();

      if (!updatedVote) {
        throw new Error("Failed to update vote");
      }

      // Update vote counts on the target
      if (updatedVote.postId) {
        await this.updatePostVoteCounts(updatedVote.postId);
      }

      return updatedVote;
    } catch (error) {
      throw new Error(`Failed to update vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteVote(voteId: number, tenantId: number): Promise<void> {
    try {
      const existingVote = await this.getVoteById(voteId, tenantId);
      if (!existingVote) {
        throw new Error("Vote not found");
      }

      await db
        .delete(votes)
        .where(and(
          eq(votes.id, voteId),
          eq(votes.tenantId, tenantId)
        ));

      // Update vote counts on the target
      if (existingVote.postId) {
        await this.updatePostVoteCounts(existingVote.postId);
      }
    } catch (error) {
      throw new Error(`Failed to delete vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async deleteUserVote(userId: string, tenantId: number, postId?: number, commentId?: number): Promise<void> {
    try {
      const existingVote = await this.getUserVote(userId, tenantId, postId, commentId);
      if (!existingVote) {
        throw new Error("Vote not found");
      }

      await this.deleteVote(existingVote.id, tenantId);
    } catch (error) {
      throw new Error(`Failed to delete user vote: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getVoteCounts(postId?: number, commentId?: number, tenantId?: number) {
    try {
      if (!postId && !commentId) {
        throw new Error("Either postId or commentId must be provided");
      }

      const conditions = [];

      if (tenantId) {
        conditions.push(eq(votes.tenantId, tenantId));
      }

      if (postId) {
        conditions.push(eq(votes.postId, postId));
        conditions.push(isNull(votes.commentId));
      } else if (commentId) {
        conditions.push(eq(votes.commentId, commentId));
        conditions.push(isNull(votes.postId));
      }

      const allVotes = await db.query.votes.findMany({
        where: and(...conditions),
        columns: {
          type: true,
          weight: true,
        },
      });

      const upvotes = allVotes
        .filter(v => v.type === "upvote")
        .reduce((sum, v) => sum + (v.weight || 1), 0);

      const downvotes = allVotes
        .filter(v => v.type === "downvote")
        .reduce((sum, v) => sum + (v.weight || 1), 0);

      const bookmarks = allVotes
        .filter(v => v.type === "bookmark")
        .reduce((sum, v) => sum + (v.weight || 1), 0);

      return {
        upvotes,
        downvotes,
        bookmarks,
        score: upvotes - downvotes,
        total: upvotes + downvotes + bookmarks,
      };
    } catch (error) {
      throw new Error(`Failed to get vote counts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updatePostVoteCounts(postId: number): Promise<void> {
    try {
      const voteCounts = await this.getVoteCounts(postId);

      await db
        .update(posts)
        .set({
          upvotes: voteCounts.upvotes,
          downvotes: voteCounts.downvotes,
          updatedAt: new Date(),
        })
        .where(eq(posts.id, postId));
    } catch (error) {
      throw new Error(`Failed to update post vote counts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTopVotedPosts(tenantId: number, limit = 10): Promise<any[]> {
    try {
      // Get posts with their vote counts
      const topPosts = await db.query.posts.findMany({
        where: and(
          eq(posts.tenantId, tenantId),
          eq(posts.status, "published"),
          isNull(posts.deletedAt)
        ),
        orderBy: [desc(posts.upvotes)],
        limit,
      });

      return topPosts;
    } catch (error) {
      throw new Error(`Failed to get top voted posts: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getUserBookmarks(userId: string, tenantId: number, limit = 50): Promise<Vote[]> {
    try {
      const bookmarks = await db.query.votes.findMany({
        where: and(
          eq(votes.userId, userId),
          eq(votes.tenantId, tenantId),
          eq(votes.type, "bookmark")
        ),
        orderBy: [desc(votes.createdAt)],
        limit,
      });

      return bookmarks;
    } catch (error) {
      throw new Error(`Failed to get user bookmarks: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getVoteStats(tenantId: number, postId?: number, commentId?: number) {
    try {
      const conditions = [eq(votes.tenantId, tenantId)];

      if (postId) {
        conditions.push(eq(votes.postId, postId));
      }

      if (commentId) {
        conditions.push(eq(votes.commentId, commentId));
      }

      const allVotes = await db.query.votes.findMany({
        where: and(...conditions),
        columns: {
          id: true,
          type: true,
          weight: true,
          createdAt: true,
        },
      });

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        total: allVotes.length,
        byType: allVotes.reduce((acc, vote) => {
          acc[vote.type] = (acc[vote.type] || 0) + 1;
          return acc;
        }, {} as Record<string, number>),
        totalWeight: allVotes.reduce((sum, v) => sum + (v.weight || 1), 0),
        newThisWeek: allVotes.filter(v => v.createdAt > oneWeekAgo).length,
        newThisMonth: allVotes.filter(v => v.createdAt > oneMonthAgo).length,
      };
    } catch (error) {
      throw new Error(`Failed to get vote stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async hasUserVoted(userId: string, tenantId: number, postId?: number, commentId?: number): Promise<{ hasVoted: boolean; vote?: Vote }> {
    try {
      const vote = await this.getUserVote(userId, tenantId, postId, commentId);
      return {
        hasVoted: !!vote,
        vote: vote || undefined,
      };
    } catch (error) {
      throw new Error(`Failed to check if user voted: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
