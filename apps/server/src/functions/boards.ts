import { db } from "../db";
import { boards, type Board, type NewBoard } from "../db/schema";
import { eq, and, isNull, desc, asc, count } from "drizzle-orm";

export interface CreateBoardData {
  tenantId: number;
  name: string;
  slug: string;
  description?: string;
  isPrivate?: boolean;
  customFields?: Record<string, any>;
}

export interface UpdateBoardData {
  name?: string;
  slug?: string;
  description?: string;
  isPrivate?: boolean;
  customFields?: Record<string, any>;
}

export interface BoardFilters {
  tenantId: number;
  isPrivate?: boolean;
  isDeleted?: boolean;
  limit?: number;
  offset?: number;
  search?: string;
}

export class BoardFunctions {
  static async createBoard(boardData: CreateBoardData): Promise<Board> {
    try {
      // Check if slug already exists for this tenant
      const existingBoard = await db.query.boards.findFirst({
        where: and(
          eq(boards.tenantId, boardData.tenantId),
          eq(boards.slug, boardData.slug),
          isNull(boards.deletedAt)
        ),
      });

      if (existingBoard) {
        throw new Error("A board with this slug already exists in this tenant");
      }

      const [newBoard] = await db
        .insert(boards)
        .values({
          tenantId: boardData.tenantId,
          name: boardData.name,
          slug: boardData.slug,
          description: boardData.description,
          isPrivate: boardData.isPrivate || false,
          customFields: boardData.customFields,
          postCount: 0,
          viewCount: 0,
        })
        .returning();

      return newBoard;
    } catch (error) {
      throw new Error(`Failed to create board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getBoardById(boardId: number, tenantId: number): Promise<Board | null> {
    try {
      const board = await db.query.boards.findFirst({
        where: and(
          eq(boards.id, boardId),
          eq(boards.tenantId, tenantId),
          isNull(boards.deletedAt)
        ),
      });

      return board || null;
    } catch (error) {
      throw new Error(`Failed to get board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getBoardBySlug(slug: string, tenantId: number): Promise<Board | null> {
    try {
      const board = await db.query.boards.findFirst({
        where: and(
          eq(boards.slug, slug),
          eq(boards.tenantId, tenantId),
          isNull(boards.deletedAt)
        ),
      });

      return board || null;
    } catch (error) {
      throw new Error(`Failed to get board by slug: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getBoardsByTenant(filters: BoardFilters): Promise<Board[]> {
    try {
      const conditions = [
        eq(boards.tenantId, filters.tenantId),
        isNull(boards.deletedAt)
      ];

      if (filters.isPrivate !== undefined) {
        conditions.push(eq(boards.isPrivate, filters.isPrivate));
      }

      let boardsList = await db.query.boards.findMany({
        where: and(...conditions),
        orderBy: [desc(boards.createdAt)],
        limit: filters.limit || 50,
        offset: filters.offset || 0,
      });

      // Apply search filter if provided
      if (filters.search) {
        const searchTerm = filters.search.toLowerCase();
        boardsList = boardsList.filter(board =>
          board.name.toLowerCase().includes(searchTerm) ||
          (board.description && board.description.toLowerCase().includes(searchTerm))
        );
      }

      return boardsList;
    } catch (error) {
      throw new Error(`Failed to get boards by tenant: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async updateBoard(boardId: number, tenantId: number, updateData: UpdateBoardData): Promise<Board> {
    try {
      // If updating slug, check for conflicts
      if (updateData.slug) {
        const existingBoard = await db.query.boards.findFirst({
          where: and(
            eq(boards.tenantId, tenantId),
            eq(boards.slug, updateData.slug),
            isNull(boards.deletedAt)
          ),
        });

        if (existingBoard && existingBoard.id !== boardId) {
          throw new Error("A board with this slug already exists in this tenant");
        }
      }

      const [updatedBoard] = await db
        .update(boards)
        .set({
          ...updateData,
          updatedAt: new Date(),
        })
        .where(and(
          eq(boards.id, boardId),
          eq(boards.tenantId, tenantId),
          isNull(boards.deletedAt)
        ))
        .returning();

      if (!updatedBoard) {
        throw new Error("Board not found or already deleted");
      }

      return updatedBoard;
    } catch (error) {
      throw new Error(`Failed to update board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async softDeleteBoard(boardId: number, tenantId: number): Promise<Board> {
    try {
      const [deletedBoard] = await db
        .update(boards)
        .set({
          deletedAt: new Date(),
          updatedAt: new Date(),
        })
        .where(and(
          eq(boards.id, boardId),
          eq(boards.tenantId, tenantId),
          isNull(boards.deletedAt)
        ))
        .returning();

      if (!deletedBoard) {
        throw new Error("Board not found or already deleted");
      }

      return deletedBoard;
    } catch (error) {
      throw new Error(`Failed to delete board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async restoreBoard(boardId: number, tenantId: number): Promise<Board> {
    try {
      const [restoredBoard] = await db
        .update(boards)
        .set({
          deletedAt: null,
          updatedAt: new Date(),
        })
        .where(and(
          eq(boards.id, boardId),
          eq(boards.tenantId, tenantId)
        ))
        .returning();

      if (!restoredBoard) {
        throw new Error("Board not found");
      }

      return restoredBoard;
    } catch (error) {
      throw new Error(`Failed to restore board: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async incrementPostCount(boardId: number): Promise<void> {
    try {
      await db
        .update(boards)
        .set({
          postCount: boards.postCount + 1,
          updatedAt: new Date(),
        })
        .where(eq(boards.id, boardId));
    } catch (error) {
      throw new Error(`Failed to increment post count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async decrementPostCount(boardId: number): Promise<void> {
    try {
      await db
        .update(boards)
        .set({
          postCount: boards.postCount - 1,
          updatedAt: new Date(),
        })
        .where(eq(boards.id, boardId));
    } catch (error) {
      throw new Error(`Failed to decrement post count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async incrementViewCount(boardId: number): Promise<void> {
    try {
      await db
        .update(boards)
        .set({
          viewCount: boards.viewCount + 1,
        })
        .where(eq(boards.id, boardId));
    } catch (error) {
      throw new Error(`Failed to increment view count: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getPublicBoards(tenantId: number, limit = 20): Promise<Board[]> {
    try {
      const publicBoards = await db.query.boards.findMany({
        where: and(
          eq(boards.tenantId, tenantId),
          eq(boards.isPrivate, false),
          isNull(boards.deletedAt)
        ),
        orderBy: [desc(boards.viewCount), desc(boards.postCount)],
        limit,
      });

      return publicBoards;
    } catch (error) {
      throw new Error(`Failed to get public boards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getBoardStats(boardId: number, tenantId: number) {
    try {
      const board = await this.getBoardById(boardId, tenantId);
      if (!board) {
        throw new Error("Board not found");
      }

      // In a real implementation, you'd join with posts, comments, etc.
      // For now, we'll return the basic stats from the board record
      return {
        id: board.id,
        name: board.name,
        slug: board.slug,
        postCount: board.postCount,
        viewCount: board.viewCount,
        isPrivate: board.isPrivate,
        createdAt: board.createdAt,
        updatedAt: board.updatedAt,
      };
    } catch (error) {
      throw new Error(`Failed to get board stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async getTenantBoardStats(tenantId: number) {
    try {
      const allBoards = await db.query.boards.findMany({
        where: and(
          eq(boards.tenantId, tenantId),
          isNull(boards.deletedAt)
        ),
        columns: {
          id: true,
          isPrivate: true,
          postCount: true,
          viewCount: true,
          createdAt: true,
        },
      });

      const now = new Date();
      const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
      const oneMonthAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

      return {
        total: allBoards.length,
        public: allBoards.filter(b => !b.isPrivate).length,
        private: allBoards.filter(b => b.isPrivate).length,
        totalPosts: allBoards.reduce((sum, b) => sum + (b.postCount || 0), 0),
        totalViews: allBoards.reduce((sum, b) => sum + (b.viewCount || 0), 0),
        newThisWeek: allBoards.filter(b => b.createdAt > oneWeekAgo).length,
        newThisMonth: allBoards.filter(b => b.createdAt > oneMonthAgo).length,
      };
    } catch (error) {
      throw new Error(`Failed to get tenant board stats: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  static async searchBoards(query: string, tenantId: number, includePrivate = false, limit = 20): Promise<Board[]> {
    try {
      const conditions = [
        eq(boards.tenantId, tenantId),
        isNull(boards.deletedAt)
      ];

      if (!includePrivate) {
        conditions.push(eq(boards.isPrivate, false));
      }

      const boardsList = await db.query.boards.findMany({
        where: and(...conditions),
        orderBy: [asc(boards.name)],
        limit,
      });

      // Filter by query (basic string matching)
      const searchTerm = query.toLowerCase();
      return boardsList.filter(board =>
        board.name.toLowerCase().includes(searchTerm) ||
        board.slug.toLowerCase().includes(searchTerm) ||
        (board.description && board.description.toLowerCase().includes(searchTerm))
      );
    } catch (error) {
      throw new Error(`Failed to search boards: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }
}
