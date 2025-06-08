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
} from "../schemas/common";
import {
  BoardSlugParamsSchema,
  CreateBoardResponseSchema,
  GetBoardByIdResponseSchema,
  GetBoardBySlugResponseSchema,
  GetBoardsQuerySchema, // Added this import
  GetBoardsResponseSchema,
  GetPublicBoardsQuerySchema,
  SearchBoardsQuerySchema,
  UpdateBoardResponseSchema,
  DeleteBoardResponseSchema,
  RestoreBoardResponseSchema,
  GetBoardStatsResponseSchema,
  GetPublicBoardsResponseSchema,
  SearchBoardsResponseSchema,
} from "../schemas/board-schemas";
import {
  TenantIdQuerySchema,
  TenantIdParamsSchema,
  BoardIdParamsSchema,
} from "../schemas/shared-request-schemas";

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
          schema: CreateBoardResponseSchema,
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
  description:
    "Retrieve a paginated list of boards for a tenant with optional filtering",
  request: {
    query: GetBoardsQuerySchema,
  },
  responses: {
    200: {
      description: "Boards retrieved successfully",
      content: {
        "application/json": {
          schema: GetBoardsResponseSchema,
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
    params: BoardIdParamsSchema,
    query: TenantIdQuerySchema,
  },
  responses: {
    200: {
      description: "Board retrieved successfully",
      content: {
        "application/json": {
          schema: GetBoardByIdResponseSchema,
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
    params: BoardSlugParamsSchema,
    query: TenantIdQuerySchema,
  },
  responses: {
    200: {
      description: "Board retrieved successfully",
      content: {
        "application/json": {
          schema: GetBoardBySlugResponseSchema,
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
    params: BoardIdParamsSchema,
    query: TenantIdQuerySchema,
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
          schema: UpdateBoardResponseSchema,
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
    params: BoardIdParamsSchema,
    query: TenantIdQuerySchema,
  },
  responses: {
    200: {
      description: "Board deleted successfully",
      content: {
        "application/json": {
          schema: DeleteBoardResponseSchema,
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
    params: BoardIdParamsSchema,
    query: TenantIdQuerySchema,
  },
  responses: {
    200: {
      description: "Board restored successfully",
      content: {
        "application/json": {
          schema: RestoreBoardResponseSchema,
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
    params: TenantIdParamsSchema,
    query: GetPublicBoardsQuerySchema,
  },
  responses: {
    200: {
      description: "Public boards retrieved successfully",
      content: {
        "application/json": {
          schema: GetPublicBoardsResponseSchema,
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
    params: BoardIdParamsSchema,
    query: TenantIdQuerySchema,
  },
  responses: {
    200: {
      description: "Board statistics retrieved successfully",
      content: {
        "application/json": {
          schema: GetBoardStatsResponseSchema,
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
    params: TenantIdParamsSchema,
    query: SearchBoardsQuerySchema,
  },
  responses: {
    200: {
      description: "Board search completed successfully",
      content: {
        "application/json": {
          schema: SearchBoardsResponseSchema,
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
