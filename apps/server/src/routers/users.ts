import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { UserFunctions } from "../functions/users";

const usersRouter = new Hono();

// Validation schemas
const createUserSchema = z.object({
  name: z.string().min(1, "Name is required"),
  email: z.string().email("Valid email is required"),
  emailVerified: z.boolean().default(false),
  tenantId: z.number().optional(),
  authProvider: z.string().optional().default("email"),
  externalId: z.string().optional(),
  role: z.enum(["user", "admin", "moderator"]).optional().default("user"),
  image: z.string().url().optional(),
  customFields: z.record(z.any()).optional(),
});

const updateUserSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  emailVerified: z.boolean().optional(),
  role: z.enum(["user", "admin", "moderator"]).optional(),
  image: z.string().url().optional(),
  customFields: z.record(z.any()).optional(),
});

const createUserAuthSchema = z.object({
  passwordHash: z.string().optional(),
  mfaSecret: z.string().optional(),
  recoveryCodes: z.array(z.string()).optional(),
});

const getUsersQuerySchema = z.object({
  tenantId: z.string().transform(Number).optional(),
  role: z.string().optional(),
  authProvider: z.string().optional(),
  limit: z.string().transform(Number).optional().default("50"),
  offset: z.string().transform(Number).optional().default("0"),
  search: z.string().optional(),
});

// POST /api/users - Create a new user
usersRouter.post(
  "/",
  zValidator("json", createUserSchema),
  async (c) => {
    try {
      const userData = c.req.valid("json");

      // Check if user already exists
      const existingUser = await UserFunctions.getUserByEmail(
        userData.email,
        userData.tenantId
      );

      if (existingUser) {
        return c.json({
          error: "User already exists",
          message: `User with email '${userData.email}' already exists`,
        }, 409);
      }

      const newUser = await UserFunctions.createUser(userData);

      return c.json({
        success: true,
        message: "User created successfully",
        user: newUser,
      }, 201);

    } catch (error) {
      console.error("Error creating user:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to create user",
      }, 500);
    }
  }
);

// GET /api/users - Get users with filters
usersRouter.get(
  "/",
  zValidator("query", getUsersQuerySchema),
  async (c) => {
    try {
      const { tenantId, role, authProvider, limit, offset, search } = c.req.valid("query");

      if (search) {
        const users = await UserFunctions.searchUsers(search, tenantId, limit);
        return c.json({
          success: true,
          data: users,
          pagination: {
            limit,
            offset: 0,
            total: users.length,
          },
        });
      }

      if (tenantId) {
        const users = await UserFunctions.getUsersByTenant(tenantId, {
          role,
          authProvider,
          limit,
          offset,
        });

        return c.json({
          success: true,
          data: users,
          pagination: {
            limit,
            offset,
            total: users.length,
          },
        });
      }

      return c.json({
        error: "Bad request",
        message: "tenantId or search query is required",
      }, 400);

    } catch (error) {
      console.error("Error fetching users:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to fetch users",
      }, 500);
    }
  }
);

// GET /api/users/:id - Get specific user by ID
usersRouter.get("/:id", async (c) => {
  try {
    const userId = c.req.param("id");

    const user = await UserFunctions.getUserById(userId);

    if (!user) {
      return c.json({
        error: "User not found",
        message: "The specified user does not exist",
      }, 404);
    }

    return c.json({
      success: true,
      data: user,
    });

  } catch (error) {
    console.error("Error fetching user:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch user",
    }, 500);
  }
});

// PUT /api/users/:id - Update user
usersRouter.put(
  "/:id",
  zValidator("json", updateUserSchema),
  async (c) => {
    try {
      const userId = c.req.param("id");
      const updateData = c.req.valid("json");

      const updatedUser = await UserFunctions.updateUser(userId, updateData);

      return c.json({
        success: true,
        message: "User updated successfully",
        user: updatedUser,
      });

    } catch (error) {
      console.error("Error updating user:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to update user",
      }, 500);
    }
  }
);

// DELETE /api/users/:id - Soft delete user
usersRouter.delete("/:id", async (c) => {
  try {
    const userId = c.req.param("id");

    const deletedUser = await UserFunctions.softDeleteUser(userId);

    return c.json({
      success: true,
      message: "User deleted successfully",
      user: deletedUser,
    });

  } catch (error) {
    console.error("Error deleting user:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to delete user",
    }, 500);
  }
});

// POST /api/users/:id/restore - Restore deleted user
usersRouter.post("/:id/restore", async (c) => {
  try {
    const userId = c.req.param("id");

    const restoredUser = await UserFunctions.restoreUser(userId);

    return c.json({
      success: true,
      message: "User restored successfully",
      user: restoredUser,
    });

  } catch (error) {
    console.error("Error restoring user:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to restore user",
    }, 500);
  }
});

// POST /api/users/:id/last-active - Update last active timestamp
usersRouter.post("/:id/last-active", async (c) => {
  try {
    const userId = c.req.param("id");

    await UserFunctions.updateLastActive(userId);

    return c.json({
      success: true,
      message: "Last active timestamp updated",
    });

  } catch (error) {
    console.error("Error updating last active:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to update last active",
    }, 500);
  }
});

// User Auth routes
// POST /api/users/:id/auth - Create user auth
usersRouter.post(
  "/:id/auth",
  zValidator("json", createUserAuthSchema),
  async (c) => {
    try {
      const userId = c.req.param("id");
      const authData = c.req.valid("json");

      await UserFunctions.createUserAuth({ userId, ...authData });

      return c.json({
        success: true,
        message: "User auth created successfully",
      }, 201);

    } catch (error) {
      console.error("Error creating user auth:", error);
      return c.json({
        error: "Internal server error",
        message: error instanceof Error ? error.message : "Failed to create user auth",
      }, 500);
    }
  }
);

// GET /api/users/:id/auth - Get user auth (excluding sensitive data)
usersRouter.get("/:id/auth", async (c) => {
  try {
    const userId = c.req.param("id");

    const userAuth = await UserFunctions.getUserAuth(userId);

    if (!userAuth) {
      return c.json({
        error: "User auth not found",
        message: "No authentication data found for this user",
      }, 404);
    }

    // Return sanitized auth data (exclude sensitive fields)
    const sanitizedAuth = {
      userId: userAuth.userId,
      hasMFA: !!userAuth.mfaSecret,
      hasRecoveryCodes: !!(userAuth.recoveryCodes && userAuth.recoveryCodes.length > 0),
      failedAttempts: userAuth.failedAttempts,
      isLocked: !!userAuth.lockedUntil && new Date() < userAuth.lockedUntil,
      lastLogin: userAuth.lastLogin,
    };

    return c.json({
      success: true,
      data: sanitizedAuth,
    });

  } catch (error) {
    console.error("Error fetching user auth:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch user auth",
    }, 500);
  }
});

// POST /api/users/:id/auth/reset-failed-attempts - Reset failed login attempts
usersRouter.post("/:id/auth/reset-failed-attempts", async (c) => {
  try {
    const userId = c.req.param("id");

    await UserFunctions.resetFailedAttempts(userId);

    return c.json({
      success: true,
      message: "Failed attempts reset successfully",
    });

  } catch (error) {
    console.error("Error resetting failed attempts:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to reset failed attempts",
    }, 500);
  }
});

// GET /api/users/stats - Get user statistics
usersRouter.get("/stats/:tenantId", async (c) => {
  try {
    const tenantId = parseInt(c.req.param("tenantId"));

    if (isNaN(tenantId)) {
      return c.json({
        error: "Invalid tenant ID",
        message: "Tenant ID must be a number",
      }, 400);
    }

    const stats = await UserFunctions.getUserStats(tenantId);

    return c.json({
      success: true,
      data: stats,
    });

  } catch (error) {
    console.error("Error fetching user stats:", error);
    return c.json({
      error: "Internal server error",
      message: error instanceof Error ? error.message : "Failed to fetch user stats",
    }, 500);
  }
});

export { usersRouter };
