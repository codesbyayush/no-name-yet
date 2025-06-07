import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { BoardFunctions } from "../functions/boards";

const boardsRouter = new Hono();

// Validation schemas
const createBoardSchema = z.object({
  tenantId: z.number(),
  name: z.string().min(1, "Board name is required"),
  slug: z.string().min(1, "Board slug is required").regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens"),
  description: z.string().optional(),
  isPrivate: z.boolean().optional().default(false),
  customFields: z.record(z.any()).optional(),
});

const updateBoardSchema = z.object({
  name: z.string().min(1).optional(),
  slug: z.string().min(1).regex(/^[a-z0-9-]+$/, "Slug must contain only lowercase letters, numbers, and hyphens").optional(),
  description: z.string().optional(),
  isPrivate: z.boolean().optional(),
  customFields: z.record(z.any()).optional(),
});

const getBoardsQuerySchema = z.object({
  tenantId: z.string().transform(Number),
  isPrivate: z.string().transform(val => val === "true").optional(),
  limit: z.string().transform(Number).optional().default("50"),
  offset: z.string().transform(Number).optional().default("0"),
  search: z.string().optional(),
});

// POST /api/boards - Create a new board
boardsRouter.post(
  "/",
  zValidator("json", createBoardSchema),
  async (c) => {
    try {
      const boardData = c.req.valid("json");

      const newBoard = await BoardFunctions.createBoard(boardData);

      return c.json({
        success: true,
        message: "Board created successfully",
        board: newBoard,
      }, 201);

    } catch (error) {
      console.error("Error creating board:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to create board",
      }, 500);
    }
  }
);

// GET /api/boards - Get boards with filters
boardsRouter.get(
  "/",
  zValidator("query", getBoardsQuerySchema),
  async (c) => {
    try {
      const filters = c.req.valid("query");

      const boards = await BoardFunctions.getBoardsByTenant(filters);

      return c.json({
        success: true,
        data: boards,
        pagination: {
          limit: filters.limit,
          offset: filters.offset,
          total: boards.length,
        },
      });

    } catch (error) {
      console.error("Error fetching boards:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to fetch boards",
      }, 500);
    }
  }
);

// GET /api/boards/:id - Get specific board by ID
boardsRouter.get("/:id", async (c) => {
  try {
    const boardId = parseInt(c.req.param("id"));
    const tenantId = parseInt(c.req.query("tenantId") || "0");

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

    const board = await BoardFunctions.getBoardById(boardId, tenantId);

    if (!board) {
      return c.json({
        error: "Board not found",
        message: "The specified board does not exist",
      }, 404);
    }

    // Increment view count
    await BoardFunctions.incrementViewCount(boardId);

    return c.json({
      success: true,
      data: board,
    });

  } catch (error) {
    console.error("Error fetching board:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch board",
    }, 500);
  }
});

// GET /api/boards/slug/:slug - Get board by slug
boardsRouter.get("/slug/:slug", async (c) => {
  try {
    const slug = c.req.param("slug");
    const tenantId = parseInt(c.req.query("tenantId") || "0");

    if (isNaN(tenantId) || tenantId === 0) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Valid tenant ID is required",
      }, 400);
    }

    const board = await BoardFunctions.getBoardBySlug(slug, tenantId);

    if (!board) {
      return c.json({
        error: "Board not found",
        message: "The specified board does not exist",
      }, 404);
    }

    // Increment view count
    await BoardFunctions.incrementViewCount(board.id);

    return c.json({
      success: true,
      data: board,
    });

  } catch (error) {
    console.error("Error fetching board by slug:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch board",
    }, 500);
  }
});

// PUT /api/boards/:id - Update board
boardsRouter.put(
  "/:id",
  zValidator("json", updateBoardSchema),
  async (c) => {
    try {
      const boardId = parseInt(c.req.param("id"));
      const tenantId = parseInt(c.req.query("tenantId") || "0");
      const updateData = c.req.valid("json");

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

      const updatedBoard = await BoardFunctions.updateBoard(boardId, tenantId, updateData);

      return c.json({
        success: true,
        message: "Board updated successfully",
        board: updatedBoard,
      });

    } catch (error) {
      console.error("Error updating board:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to update board",
      }, 500);
    }
  }
);

// DELETE /api/boards/:id - Soft delete board
boardsRouter.delete("/:id", async (c) => {
  try {
    const boardId = parseInt(c.req.param("id"));
    const tenantId = parseInt(c.req.query("tenantId") || "0");

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

    const deletedBoard = await BoardFunctions.softDeleteBoard(boardId, tenantId);

    return c.json({
      success: true,
      message: "Board deleted successfully",
      board: deletedBoard,
    });

  } catch (error) {
    console.error("Error deleting board:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to delete board",
    }, 500);
  }
});

// POST /api/boards/:id/restore - Restore deleted board
boardsRouter.post("/:id/restore", async (c) => {
  try {
    const boardId = parseInt(c.req.param("id"));
    const tenantId = parseInt(c.req.query("tenantId") || "0");

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

    const restoredBoard = await BoardFunctions.restoreBoard(boardId, tenantId);

    return c.json({
      success: true,
      message: "Board restored successfully",
      board: restoredBoard,
    });

  } catch (error) {
    console.error("Error restoring board:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to restore board",
    }, 500);
  }
});

// GET /api/boards/public/:tenantId - Get public boards for a tenant
boardsRouter.get("/public/:tenantId", async (c) => {
  try {
    const tenantId = parseInt(c.req.param("tenantId"));
    const limit = parseInt(c.req.query("limit") || "20");

    if (isNaN(tenantId)) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Tenant ID must be a number",
      }, 400);
    }

    const publicBoards = await BoardFunctions.getPublicBoards(tenantId, limit);

    return c.json({
      success: true,
      data: publicBoards,
    });

  } catch (error) {
    console.error("Error fetching public boards:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch public boards",
    }, 500);
  }
});

// GET /api/boards/:id/stats - Get board statistics
boardsRouter.get("/:id/stats", async (c) => {
  try {
    const boardId = parseInt(c.req.param("id"));
    const tenantId = parseInt(c.req.query("tenantId") || "0");

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

    const stats = await BoardFunctions.getBoardStats(boardId, tenantId);

    return c.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error("Error fetching board stats:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch board stats",
    }, 500);
  }
});

// GET /api/boards/stats/tenant/:tenantId - Get tenant board statistics
boardsRouter.get("/stats/tenant/:tenantId", async (c) => {
  try {
    const tenantId = parseInt(c.req.param("tenantId"));

    if (isNaN(tenantId)) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Tenant ID must be a number",
      }, 400);
    }

    const stats = await BoardFunctions.getTenantBoardStats(tenantId);

    return c.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error("Error fetching tenant board stats:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch tenant board stats",
    }, 500);
  }
});

// GET /api/boards/search/:tenantId - Search boards
boardsRouter.get("/search/:tenantId", async (c) => {
  try {
    const tenantId = parseInt(c.req.param("tenantId"));
    const query = c.req.query("q") || "";
    const includePrivate = c.req.query("includePrivate") === "true";
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

    const boards = await BoardFunctions.searchBoards(query, tenantId, includePrivate, limit);

    return c.json({
      success: true,
      data: boards,
      query,
    });

  } catch (error) {
    console.error("Error searching boards:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to search boards",
    }, 500);
  }
});

export { boardsRouter };
