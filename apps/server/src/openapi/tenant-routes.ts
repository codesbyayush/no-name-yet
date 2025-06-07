import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  ErrorSchema,
  SuccessResponseSchema,
  TenantSchema,
  CreateTenantSchema,
  UpdateTenantSchema,
  TenantResponseSchema,
} from "./schemas";

// Create tenant route
export const createTenantRoute = createRoute({
  method: "post",
  path: "/tenants",
  tags: ["Tenants"],
  summary: "Create new tenant",
  description: "Create a new tenant organization with configuration settings",
  request: {
    body: {
      content: {
        "application/json": {
          schema: z.object({
            id: z.string().min(1).describe("Unique tenant identifier"),
            name: z.string().min(1).describe("Tenant name"),
            email: z.string().email().optional().describe("Contact email"),
            config: z.object({
              theme: z.object({
                primaryColor: z.string().optional().describe("Primary theme color"),
                buttonText: z.string().optional().describe("Custom button text"),
              }).optional(),
              apiUrl: z.string().url().optional().describe("Custom API URL"),
              allowedDomains: z.array(z.string()).optional().describe("Allowed domains for CORS"),
            }).optional().describe("Tenant configuration"),
          }),
        },
      },
    },
  },
  responses: {
    201: {
      description: "Tenant created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            tenant: TenantSchema,
          }),
        },
      },
    },
    409: {
      description: "Tenant already exists",
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

// Get all tenants route
export const getTenantsRoute = createRoute({
  method: "get",
  path: "/tenants",
  tags: ["Tenants"],
  summary: "Get all tenants",
  description: "Retrieve a list of all tenant organizations",
  responses: {
    200: {
      description: "Tenants retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(TenantSchema),
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

// Get tenant by ID route
export const getTenantByIdRoute = createRoute({
  method: "get",
  path: "/tenants/{id}",
  tags: ["Tenants"],
  summary: "Get tenant by ID",
  description: "Retrieve a specific tenant by its unique identifier",
  request: {
    params: z.object({
      id: z.string().describe("Tenant ID"),
    }),
  },
  responses: {
    200: {
      description: "Tenant retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: TenantSchema,
          }),
        },
      },
    },
    404: {
      description: "Tenant not found",
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

// Update tenant route
export const updateTenantRoute = createRoute({
  method: "put",
  path: "/tenants/{id}",
  tags: ["Tenants"],
  summary: "Update tenant",
  description: "Update an existing tenant's information and configuration",
  request: {
    params: z.object({
      id: z.string().describe("Tenant ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            name: z.string().min(1).optional().describe("Tenant name"),
            email: z.string().email().optional().describe("Contact email"),
            isActive: z.boolean().optional().describe("Whether tenant is active"),
            config: z.object({
              theme: z.object({
                primaryColor: z.string().optional().describe("Primary theme color"),
                buttonText: z.string().optional().describe("Custom button text"),
              }).optional(),
              apiUrl: z.string().url().optional().describe("Custom API URL"),
              allowedDomains: z.array(z.string()).optional().describe("Allowed domains for CORS"),
            }).optional().describe("Tenant configuration"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Tenant updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            tenant: TenantSchema,
          }),
        },
      },
    },
    404: {
      description: "Tenant not found",
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

// Delete (deactivate) tenant route
export const deleteTenantRoute = createRoute({
  method: "delete",
  path: "/tenants/{id}",
  tags: ["Tenants"],
  summary: "Deactivate tenant",
  description: "Soft delete a tenant by setting isActive to false",
  request: {
    params: z.object({
      id: z.string().describe("Tenant ID"),
    }),
  },
  responses: {
    200: {
      description: "Tenant deactivated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            tenant: TenantSchema,
          }),
        },
      },
    },
    404: {
      description: "Tenant not found",
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

// Activate tenant route
export const activateTenantRoute = createRoute({
  method: "post",
  path: "/tenants/{id}/activate",
  tags: ["Tenants"],
  summary: "Activate tenant",
  description: "Reactivate a previously deactivated tenant",
  request: {
    params: z.object({
      id: z.string().describe("Tenant ID"),
    }),
  },
  responses: {
    200: {
      description: "Tenant activated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            tenant: TenantSchema,
          }),
        },
      },
    },
    404: {
      description: "Tenant not found",
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
