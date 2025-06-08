import type { Context, Next } from "hono";
import { auth } from "../lib/auth";
import { db } from "../db";
import { tenants } from "../db/schema/feedback";
import { eq } from "drizzle-orm";

// Extended context interface to include user and tenant
export interface AuthContext {
  user: {
    id: string;
    name: string;
    email: string;
    emailVerified: boolean;
    image?: string;
    tenantId?: number;
    role: string;
    createdAt: Date;
    updatedAt: Date;
  } | null;
  tenant: {
    id: number;
    name: string;
    slug: string;
    plan: string;
    email?: string;
    isActive: boolean;
    config: any;
    createdAt: Date;
    updatedAt: Date;
  } | null;
}

declare module "hono" {
  interface ContextVariableMap {
    user: AuthContext["user"];
    tenant: AuthContext["tenant"];
  }
}

/**
 * Global middleware that extracts user and tenant information
 * and attaches them to the request context
 */
export const authMiddleware = async (c: Context, next: Next) => {
  try {
    let user: AuthContext["user"] = null;
    let tenant: AuthContext["tenant"] = null;

    // Try to get user session from better-auth
    try {
      const session = await auth.api.getSession({
        headers: c.req.raw.headers,
      });

      if (session?.user) {
        user = {
          id: session.user.id,
          name: session.user.name,
          email: session.user.email,
          emailVerified: session.user.emailVerified,
          image: session.user.image || undefined,
          tenantId: (session.user as any).tenantId,
          role: (session.user as any).role || "user",
          createdAt: session.user.createdAt,
          updatedAt: session.user.updatedAt,
        };
      }
    } catch (authError) {
      // User is not authenticated, continue with null user
      console.log("No authenticated user found:", authError);
    }

    // Try to get tenant information
    let tenantId: number | null = null;

    // Priority 1: Get tenant from authenticated user
    if (user?.tenantId) {
      tenantId = user.tenantId;
    }
    // Priority 2: Get tenant from X-Tenant-ID header
    else {
      const tenantHeader = c.req.header("X-Tenant-ID");
      if (tenantHeader) {
        const parsedTenantId = parseInt(tenantHeader);
        if (!isNaN(parsedTenantId)) {
          tenantId = parsedTenantId;
        }
      }
    }

    // Fetch tenant information if we have a tenant ID
    if (tenantId) {
      try {
        const tenantData = await db.query.tenants.findFirst({
          where: eq(tenants.id, tenantId),
        });

        if (tenantData) {
          tenant = {
            id: tenantData.id,
            name: tenantData.name,
            slug: tenantData.slug,
            plan: tenantData.plan,
            email: tenantData.email,
            isActive: tenantData.isActive,
            config: tenantData.config,
            createdAt: tenantData.createdAt,
            updatedAt: tenantData.updatedAt,
          };
        }
      } catch (tenantError) {
        console.error("Error fetching tenant:", tenantError);
      }
    }

    c.set("user", user);
    c.set("tenant", tenant);

    await next();
  } catch (error) {
    console.error("Auth middleware error:", error);
    // Continue execution even if middleware fails
    c.set("user", null);
    c.set("tenant", null);
    await next();
  }
};

/**
 * Helper function to require authentication
 * Use this in routes that need authenticated users
 */
export const requireAuth = async (c: Context, next: Next) => {
  const user = c.get("user");

  if (!user) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Authentication required",
      },
      401,
    );
  }

  await next();
};

/**
 * Helper function to require tenant context
 * Use this in routes that need tenant information
 */
export const requireTenant = async (c: Context, next: Next) => {
  const tenant = c.get("tenant");

  if (!tenant) {
    return c.json(
      {
        error: "Bad Request",
        message:
          "Tenant context required. Please provide X-Tenant-ID header or authenticate with a tenant-associated account.",
      },
      400,
    );
  }

  if (!tenant.isActive) {
    return c.json(
      {
        error: "Forbidden",
        message: "Tenant is inactive",
      },
      403,
    );
  }

  await next();
};

/**
 * Helper function to require both auth and tenant
 */
export const requireAuthAndTenant = async (c: Context, next: Next) => {
  const user = c.get("user");
  const tenant = c.get("tenant");

  if (!user) {
    return c.json(
      {
        error: "Unauthorized",
        message: "Authentication required",
      },
      401,
    );
  }

  if (!tenant) {
    return c.json(
      {
        error: "Bad Request",
        message: "Tenant context required",
      },
      400,
    );
  }

  if (!tenant.isActive) {
    return c.json(
      {
        error: "Forbidden",
        message: "Tenant is inactive",
      },
      403,
    );
  }

  await next();
};

/**
 * Helper function to check if user has required role
 */
export const requireRole = (requiredRole: string | string[]) => {
  return async (c: Context, next: Next) => {
    const user = c.get("user");

    if (!user) {
      return c.json(
        {
          error: "Unauthorized",
          message: "Authentication required",
        },
        401,
      );
    }

    const roles = Array.isArray(requiredRole) ? requiredRole : [requiredRole];

    if (!roles.includes(user.role)) {
      return c.json(
        {
          error: "Forbidden",
          message: `Required role: ${roles.join(" or ")}`,
        },
        403,
      );
    }

    await next();
  };
};
