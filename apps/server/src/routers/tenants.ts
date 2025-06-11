import { Hono } from "hono";
import { zValidator } from "@hono/zod-validator";
import { z } from "zod";
import { db } from "../db";
import { tenants } from "../db/schema";
import { eq } from "drizzle-orm";
import {
  requireAuth,
  requireRole,
  getCurrentUser,
  isAdmin,
} from "../middleware/utils";

const tenantsRouter = new Hono();

// Validation schemas
const createTenantSchema = z.object({
  id: z.string().min(1, "Tenant ID is required"),
  name: z.string().min(1, "Tenant name is required"),
  email: z.string().email().optional(),
  config: z
    .object({
      theme: z
        .object({
          primaryColor: z.string().optional(),
          buttonText: z.string().optional(),
        })
        .optional(),
      apiUrl: z.string().url().optional(),
      allowedDomains: z.array(z.string()).optional(),
    })
    .optional(),
});

const updateTenantSchema = z.object({
  name: z.string().min(1).optional(),
  email: z.string().email().optional(),
  isActive: z.boolean().optional(),
  config: z
    .object({
      theme: z
        .object({
          primaryColor: z.string().optional(),
          buttonText: z.string().optional(),
        })
        .optional(),
      apiUrl: z.string().url().optional(),
      allowedDomains: z.array(z.string()).optional(),
    })
    .optional(),
});

// POST /api/tenants - Create a new tenant (Admin only)
tenantsRouter.post(
  "/",
  requireAuth,
  requireRole("admin"),
  zValidator("json", createTenantSchema),
  async (c) => {
    try {
      const data = c.req.valid("json");

      // Check if tenant already exists
      const existingTenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, parseInt(data.id, 10)),
      });

      if (existingTenant) {
        return c.json(
          {
            error: "Tenant already exists",
            message: `Tenant with ID '${data.id}' already exists`,
          },
          409,
        );
      }

      // Create new tenant
      const result = await db
        .insert(tenants)
        .values({
          name: data.name,
          slug: data.id, // Assuming slug should be the same as the provided id string
          email: data.email,
          config: data.config || {},
        })
        .returning();

      return c.json(
        {
          success: true,
          message: "Tenant created successfully",
          tenant: result[0],
        },
        201,
      );
    } catch (error) {
      console.error("Error creating tenant:", error);
      return c.json(
        {
          error: "Internal server error",
          message: "Failed to create tenant",
        },
        500,
      );
    }
  },
);

// GET /api/tenants - Get all tenants (Admin only)
tenantsRouter.get("/", requireAuth, requireRole("admin"), async (c) => {
  try {
    const tenantsList = await db.query.tenants.findMany({
      orderBy: (tenants, { desc }) => [desc(tenants.createdAt)],
    });

    return c.json({
      success: true,
      data: tenantsList,
    });
  } catch (error) {
    console.error("Error fetching tenants:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to fetch tenants",
      },
      500,
    );
  }
});

// GET /api/tenants/:id - Get specific tenant by ID (Admin or user from same tenant)
tenantsRouter.get("/:id", requireAuth, async (c) => {
  try {
    const tenantId = parseInt(c.req.param("id"));
    const user = getCurrentUser(c);

    if (isNaN(tenantId)) {
      return c.json(
        {
          error: "Invalid tenant ID",
          message: "Tenant ID must be a number",
        },
        400,
      );
    }

    // Allow access if user is admin or belongs to the requested tenant
    if (!isAdmin(c) && user?.tenantId !== tenantId) {
      return c.json(
        {
          error: "Forbidden",
          message: "You can only access your own tenant information",
        },
        403,
      );
    }

    const tenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!tenant) {
      return c.json(
        {
          error: "Tenant not found",
          message: "The specified tenant does not exist",
        },
        404,
      );
    }

    return c.json({
      success: true,
      data: tenant,
    });
  } catch (error) {
    console.error("Error fetching tenant:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to fetch tenant",
      },
      500,
    );
  }
});

// PUT /api/tenants/:id - Update tenant (Admin only)
tenantsRouter.put(
  "/:id",
  requireAuth,
  requireRole("admin"),
  zValidator("json", updateTenantSchema),
  async (c) => {
    try {
      const tenantId = parseInt(c.req.param("id"));
      const data = c.req.valid("json");

      if (isNaN(tenantId)) {
        return c.json(
          {
            error: "Invalid tenant ID",
            message: "Tenant ID must be a number",
          },
          400,
        );
      }

      // Check if tenant exists
      const existingTenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, tenantId),
      });

      if (!existingTenant) {
        return c.json(
          {
            error: "Tenant not found",
            message: "The specified tenant does not exist",
          },
          404,
        );
      }

      // Update tenant
      const result = await db
        .update(tenants)
        .set({
          ...data,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId))
        .returning();

      return c.json({
        success: true,
        message: "Tenant updated successfully",
        tenant: result[0],
      });
    } catch (error) {
      console.error("Error updating tenant:", error);
      return c.json(
        {
          error: "Internal server error",
          message: "Failed to update tenant",
        },
        500,
      );
    }
  },
);

// DELETE /api/tenants/:id - Delete tenant (soft delete by setting isActive to false) (Admin only)
tenantsRouter.delete("/:id", requireAuth, requireRole("admin"), async (c) => {
  try {
    const tenantId = parseInt(c.req.param("id"), 10);

    // Check if tenant exists
    const existingTenant = await db.query.tenants.findFirst({
      where: eq(tenants.id, tenantId),
    });

    if (!existingTenant) {
      return c.json(
        {
          error: "Tenant not found",
          message: "The specified tenant does not exist",
        },
        404,
      );
    }

    // Soft delete by setting isActive to false
    const result = await db
      .update(tenants)
      .set({
        isActive: false,
        updatedAt: new Date(),
      })
      .where(eq(tenants.id, tenantId))
      .returning();

    return c.json({
      success: true,
      message: "Tenant deactivated successfully",
      tenant: result[0],
    });
  } catch (error) {
    console.error("Error deactivating tenant:", error);
    return c.json(
      {
        error: "Internal server error",
        message: "Failed to deactivate tenant",
      },
      500,
    );
  }
});

// POST /api/tenants/:id/activate - Reactivate tenant (Admin only)
tenantsRouter.post(
  "/:id/activate",
  requireAuth,
  requireRole("admin"),
  async (c) => {
    try {
      const tenantId = parseInt(c.req.param("id"), 10);

      // Check if tenant exists
      const existingTenant = await db.query.tenants.findFirst({
        where: eq(tenants.id, tenantId),
      });

      if (!existingTenant) {
        return c.json(
          {
            error: "Tenant not found",
            message: "The specified tenant does not exist",
          },
          404,
        );
      }

      // Reactivate tenant
      const result = await db
        .update(tenants)
        .set({
          isActive: true,
          updatedAt: new Date(),
        })
        .where(eq(tenants.id, tenantId))
        .returning();

      return c.json({
        success: true,
        message: "Tenant activated successfully",
        tenant: result[0],
      });
    } catch (error) {
      console.error("Error activating tenant:", error);
      return c.json(
        {
          error: "Internal server error",
          message: "Failed to activate tenant",
        },
        500,
      );
    }
  },
);

export { tenantsRouter };
