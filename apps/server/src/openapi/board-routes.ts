import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  ErrorSchema,
  SuccessResponseSchema,
  PaginationSchema,
  BoardSchema,
  CreateBoardSchema,
  UpdateBoardSchema,
  BoardStatsSchema,
} from "./schemas";

// Create board route
export const createBoardRoute = createRoute({
  method: "post",
  path: "/boards",
  tags: ["Boards"],
  summary: "Create new board",
  description: "Create a new board for organizing posts and feedback",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateBoardSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Board created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            board: BoardSchema,
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

// Get boards route
export const getBoardsRoute = createRoute({
  method: "get",
  path: "/boards",
  tags: ["Boards"],
  summary: "Get boards list",
  description: "Retrieve a paginated list of boards for a tenant with optional filtering",
  request: {
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID to filter boards"),
      isPrivate: z
        .string()
        .transform(val => val === "true")
        .optional()
        .describe("Filter by private/public status"),
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
      search: z.string().optional().describe("Search query for board name/description"),
    }),
  },
  responses: {
    200: {
      description: "Boards retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(BoardSchema),
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

// Get board by ID route
export const getBoardByIdRoute = createRoute({
  method: "get",
  path: "/boards/{id}",
  tags: ["Boards"],
  summary: "Get board by ID",
  description: "Retrieve a specific board by its ID",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Board ID"),
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
      description: "Board retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: BoardSchema,
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
    404: {
      description: "Board not found",
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

// Get board by slug route
export const getBoardBySlugRoute = createRoute({
  method: "get",
  path: "/boards/slug/{slug}",
  tags: ["Boards"],
  summary: "Get board by slug",
  description: "Retrieve a specific board by its slug identifier",
  request: {
    params: z.object({
      slug: z.string().describe("Board slug"),
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
      description: "Board retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: BoardSchema,
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
      description: "Board not found",
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

// Update board route
export const updateBoardRoute = createRoute({
  method: "put",
  path: "/boards/{id}",
  tags: ["Boards"],
  summary: "Update board",
  description: "Update an existing board's information",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Board ID"),
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
          schema: UpdateBoardSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Board updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            board: BoardSchema,
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
    404: {
      description: "Board not found",
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

// Delete board route
export const deleteBoardRoute = createRoute({
  method: "delete",
  path: "/boards/{id}",
  tags: ["Boards"],
  summary: "Delete board",
  description: "Soft delete a board (sets status to deleted)",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Board ID"),
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
      description: "Board deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            board: BoardSchema,
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
    404: {
      description: "Board not found",
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

// Restore board route
export const restoreBoardRoute = createRoute({
  method: "post",
  path: "/boards/{id}/restore",
  tags: ["Boards"],
  summary: "Restore deleted board",
  description: "Restore a previously deleted board",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Board ID"),
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
      description: "Board restored successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            board: BoardSchema,
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
    404: {
      description: "Board not found",
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

// Get public boards route
export const getPublicBoardsRoute = createRoute({
  method: "get",
  path: "/boards/public/{tenantId}",
  tags: ["Boards"],
  summary: "Get public boards",
  description: "Retrieve public boards for a tenant",
  request: {
    params: z.object({
      tenantId: z.string().transform(Number).describe("Tenant ID"),
    }),
    query: z.object({
      limit: z
        .string()
        .transform(Number)
        .optional()
        .default("20")
        .describe("Number of boards to return"),
    }),
  },
  responses: {
    200: {
      description: "Public boards retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(BoardSchema),
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

// Get board statistics route
export const getBoardStatsRoute = createRoute({
  method: "get",
  path: "/boards/{id}/stats",
  tags: ["Boards"],
  summary: "Get board statistics",
  description: "Retrieve statistics for a specific board",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Board ID"),
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
      description: "Board statistics retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: BoardStatsSchema,
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
    404: {
      description: "Board not found",
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

// Search boards route
export const searchBoardsRoute = createRoute({
  method: "get",
  path: "/boards/search/{tenantId}",
  tags: ["Boards"],
  summary: "Search boards",
  description: "Search for boards by name or description",
  request: {
    params: z.object({
      tenantId: z.string().transform(Number).describe("Tenant ID"),
    }),
    query: z.object({
      q: z.string().min(1).describe("Search query"),
      includePrivate: z
        .string()
        .transform(val => val === "true")
        .optional()
        .default("false")
        .describe("Include private boards in search"),
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
      description: "Board search completed successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(BoardSchema),
            query: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Invalid tenant ID or missing search query",
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
