import type { Context } from "hono";
import {
  type AuthContext,
  requireAuth,
  requireTenant,
  requireAuthAndTenant,
  requireRole,
} from "./auth";

/**
 * Utility functions for accessing user and tenant context in routes
 */

/**
 * Get the current authenticated user from context
 */
export const getCurrentUser = (c: Context): AuthContext["user"] => {
  return c.get("user");
};

/**
 * Get the current tenant from context
 */
export const getCurrentTenant = (c: Context): AuthContext["tenant"] => {
  return c.get("tenant");
};

/**
 * Check if the current user is authenticated
 */
export const isAuthenticated = (c: Context): boolean => {
  const user = getCurrentUser(c);
  return user !== null;
};

/**
 * Check if the current user has a specific role
 */
export const hasRole = (c: Context, role: string | string[]): boolean => {
  const user = getCurrentUser(c);
  if (!user) return false;

  const roles = Array.isArray(role) ? role : [role];
  return roles.includes(user.role);
};

/**
 * Check if the current user is an admin
 */
export const isAdmin = (c: Context): boolean => {
  return hasRole(c, "admin");
};

/**
 * Check if the current user is a moderator or admin
 */
export const isModerator = (c: Context): boolean => {
  return hasRole(c, ["admin", "moderator"]);
};

/**
 * Check if tenant context is available
 */
export const hasTenantContext = (c: Context): boolean => {
  const tenant = getCurrentTenant(c);
  return tenant !== null && tenant.isActive;
};

/**
 * Get the tenant ID from context
 */
export const getTenantId = (c: Context): number | null => {
  const tenant = getCurrentTenant(c);
  return tenant?.id || null;
};

/**
 * Get the user ID from context
 */
export const getUserId = (c: Context): string | null => {
  const user = getCurrentUser(c);
  return user?.id || null;
};

/**
 * Check if the current user belongs to the current tenant
 */
export const userBelongsToTenant = (c: Context): boolean => {
  const user = getCurrentUser(c);
  const tenant = getCurrentTenant(c);

  if (!user || !tenant) return false;

  return user.tenantId === tenant.id;
};

/**
 * Get user and tenant info as a combined object
 */
export const getAuthContext = (
  c: Context,
): {
  user: AuthContext["user"];
  tenant: AuthContext["tenant"];
  isAuthenticated: boolean;
  hasTenant: boolean;
} => {
  const user = getCurrentUser(c);
  const tenant = getCurrentTenant(c);

  return {
    user,
    tenant,
    isAuthenticated: user !== null,
    hasTenant: tenant !== null && tenant.isActive,
  };
};

/**
 * Create a response with user context for debugging
 */
export const createContextResponse = (c: Context) => {
  const { user, tenant, isAuthenticated, hasTenant } = getAuthContext(c);

  return {
    user: user
      ? {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
          tenantId: user.tenantId,
        }
      : null,
    tenant: tenant
      ? {
          id: tenant.id,
          name: tenant.name,
          slug: tenant.slug,
          plan: tenant.plan,
          isActive: tenant.isActive,
        }
      : null,
    context: {
      isAuthenticated,
      hasTenant,
      userBelongsToTenant: userBelongsToTenant(c),
    },
  };
};

// Re-export middleware functions for convenience
export { requireAuth, requireTenant, requireAuthAndTenant, requireRole };
