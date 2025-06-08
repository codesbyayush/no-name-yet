import { z } from "zod";
import { TenantSchema } from "./common";
import {
  TenantIdParamsSchema,
  PaginationQuerySchema,
} from "./shared-request-schemas";

// Request schemas
export const CreateTenantRequestSchema = z.object({
  id: z.string().min(1).describe("Unique tenant identifier"),
  name: z.string().min(1).describe("Tenant name"),
  email: z.string().email().optional().describe("Contact email"),
  config: z
    .object({
      theme: z
        .object({
          primaryColor: z.string().optional().describe("Primary theme color"),
          buttonText: z.string().optional().describe("Custom button text"),
        })
        .optional(),
      apiUrl: z.string().url().optional().describe("Custom API URL"),
      allowedDomains: z
        .array(z.string())
        .optional()
        .describe("Allowed domains for CORS"),
    })
    .optional()
    .describe("Tenant configuration"),
});

// Re-export shared schema for convenience
export { TenantIdParamsSchema } from "./shared-request-schemas";

export const GetTenantsQuerySchema = z.object({
  ...PaginationQuerySchema.shape,
  search: z.string().optional().describe("Search query for tenant name"),
  status: z
    .enum(["active", "inactive", "suspended"])
    .optional()
    .describe("Filter by tenant status"),
});

export const UpdateTenantConfigSchema = z.object({
  theme: z
    .object({
      primaryColor: z.string().optional(),
      buttonText: z.string().optional(),
    })
    .optional(),
  apiUrl: z.string().url().optional(),
  allowedDomains: z.array(z.string()).optional(),
});

// Response schemas
export const CreateTenantResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  tenant: TenantSchema,
});

export const GetTenantsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(TenantSchema),
  pagination: z.object({
    total: z.number(),
    limit: z.number(),
    offset: z.number(),
    hasMore: z.boolean(),
  }),
});

export const GetTenantByIdResponseSchema = z.object({
  success: z.boolean(),
  data: TenantSchema,
});

export const UpdateTenantResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  tenant: TenantSchema,
});

export const DeleteTenantResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const GetTenantStatsResponseSchema = z.object({
  success: z.boolean(),
  data: z.object({
    totalBoards: z.number(),
    totalPosts: z.number(),
    totalComments: z.number(),
    totalUsers: z.number(),
    activeUsers: z.number(),
  }),
});
