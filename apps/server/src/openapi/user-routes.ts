import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  ErrorSchema,
  SuccessResponseSchema,
  PaginationSchema,
  UserSchema,
  CreateUserSchema,
  UpdateUserSchema,
  UserStatsSchema,
} from "./schemas";

// Create user route
export const createUserRoute = createRoute({
  method: "post",
  path: "/users",
  tags: ["Users"],
  summary: "Create new user",
  description: "Create a new user account with role-based access control",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateUserSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "User created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            user: UserSchema,
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
      description: "User already exists",
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

// Get users route
export const getUsersRoute = createRoute({
  method: "get",
  path: "/users",
  tags: ["Users"],
  summary: "Get users list",
  description: "Retrieve a paginated list of users with optional filtering",
  request: {
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .optional()
        .describe("Filter by tenant ID"),
      role: z
        .enum(["user", "admin", "moderator"])
        .optional()
        .describe("Filter by user role"),
      authProvider: z
        .string()
        .optional()
        .describe("Filter by authentication provider"),
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
        .describe("Search query for user name/email"),
    }),
  },
  responses: {
    200: {
      description: "Users retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(UserSchema),
            pagination: PaginationSchema,
          }),
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

// Get user by ID route
export const getUserByIdRoute = createRoute({
  method: "get",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "Get user by ID",
  description: "Retrieve a specific user by their unique identifier",
  request: {
    params: z.object({
      id: z.string().describe("User ID"),
    }),
  },
  responses: {
    200: {
      description: "User retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: UserSchema,
          }),
        },
      },
    },
    404: {
      description: "User not found",
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

// Update user route
export const updateUserRoute = createRoute({
  method: "put",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "Update user",
  description: "Update an existing user's information and role",
  request: {
    params: z.object({
      id: z.string().describe("User ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateUserSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "User updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            user: UserSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid input data",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "User not found",
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

// Delete user route
export const deleteUserRoute = createRoute({
  method: "delete",
  path: "/users/{id}",
  tags: ["Users"],
  summary: "Delete user",
  description: "Soft delete a user account (sets deletedAt timestamp)",
  request: {
    params: z.object({
      id: z.string().describe("User ID"),
    }),
  },
  responses: {
    200: {
      description: "User deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            user: UserSchema,
          }),
        },
      },
    },
    404: {
      description: "User not found",
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

// Get users by tenant route
export const getUsersByTenantRoute = createRoute({
  method: "get",
  path: "/users/tenant/{tenantId}",
  tags: ["Users"],
  summary: "Get users by tenant",
  description: "Retrieve all users belonging to a specific tenant",
  request: {
    params: z.object({
      tenantId: z.string().transform(Number).describe("Tenant ID"),
    }),
    query: z.object({
      role: z
        .enum(["user", "admin", "moderator"])
        .optional()
        .describe("Filter by user role"),
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
      description: "Tenant users retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(UserSchema),
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

// Update user role route
export const updateUserRoleRoute = createRoute({
  method: "post",
  path: "/users/{id}/role",
  tags: ["Users"],
  summary: "Update user role",
  description: "Update a user's role (admin, moderator, user)",
  request: {
    params: z.object({
      id: z.string().describe("User ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            role: z
              .enum(["user", "admin", "moderator"])
              .describe("New role for the user"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "User role updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            user: UserSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid role",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "User not found",
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

// Get user statistics route
export const getUserStatsRoute = createRoute({
  method: "get",
  path: "/users/{id}/stats",
  tags: ["Users"],
  summary: "Get user statistics",
  description: "Retrieve statistics for a specific user",
  request: {
    params: z.object({
      id: z.string().describe("User ID"),
    }),
  },
  responses: {
    200: {
      description: "User statistics retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: UserStatsSchema,
          }),
        },
      },
    },
    404: {
      description: "User not found",
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

// Search users route
export const searchUsersRoute = createRoute({
  method: "get",
  path: "/users/search",
  tags: ["Users"],
  summary: "Search users",
  description: "Search for users by name or email",
  request: {
    query: z.object({
      q: z.string().min(1).describe("Search query"),
      tenantId: z
        .string()
        .transform(Number)
        .optional()
        .describe("Filter by tenant ID"),
      role: z
        .enum(["user", "admin", "moderator"])
        .optional()
        .describe("Filter by user role"),
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
      description: "User search completed successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(UserSchema),
            query: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Missing search query",
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
