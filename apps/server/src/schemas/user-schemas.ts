import { z } from "zod";
import { UserSchema, PaginationSchema, UserStatsSchema } from "./common";
import {
  TenantIdQuerySchema,
  TenantIdParamsSchema,
  UserIdParamsSchema,
  PaginationQuerySchema,
  OptionalBooleanStringSchema,
} from "./shared-request-schemas";

// Request schemas
export const GetUsersQuerySchema = z.object({
  tenantId: z.string().transform(Number).describe("Tenant ID to filter users"),
  role: z
    .enum(["admin", "moderator", "user"])
    .optional()
    .describe("Filter by user role"),
  status: z
    .enum(["active", "inactive", "banned"])
    .optional()
    .describe("Filter by user status"),
  ...PaginationQuerySchema.shape,
  search: z.string().optional().describe("Search query for user name/email"),
});

// Re-export shared schemas for convenience
export {
  UserIdParamsSchema,
  TenantIdQuerySchema,
  TenantIdParamsSchema,
} from "./shared-request-schemas";

export const GetUsersByTenantQuerySchema = z.object({
  includeInactive: OptionalBooleanStringSchema.default("false").describe(
    "Include inactive users",
  ),
  role: z
    .enum(["admin", "moderator", "user"])
    .optional()
    .describe("Filter by user role"),
  ...PaginationQuerySchema.shape,
});

export const SearchUsersQuerySchema = z.object({
  q: z.string().min(1).describe("Search query"),
  includeInactive: OptionalBooleanStringSchema.default("false").describe(
    "Include inactive users in search",
  ),
  role: z
    .enum(["admin", "moderator", "user"])
    .optional()
    .describe("Filter by user role"),
  limit: z
    .string()
    .transform(Number)
    .optional()
    .default("20")
    .describe("Number of results to return"),
});

export const UpdateUserRoleSchema = z.object({
  role: z.enum(["admin", "moderator", "user"]).describe("New user role"),
});

export const UpdateUserStatusSchema = z.object({
  status: z.enum(["active", "inactive", "banned"]).describe("New user status"),
  reason: z.string().optional().describe("Reason for status change"),
});

// Response schemas
export const CreateUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserSchema,
});

export const GetUsersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserSchema),
  pagination: PaginationSchema,
});

export const GetUserByIdResponseSchema = z.object({
  success: z.boolean(),
  data: UserSchema,
});

export const UpdateUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserSchema,
});

export const DeleteUserResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const GetUsersByTenantResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserSchema),
  pagination: PaginationSchema,
});

export const GetUserStatsResponseSchema = z.object({
  success: z.boolean(),
  data: UserStatsSchema,
});

export const SearchUsersResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(UserSchema),
  query: z.string(),
});

export const UpdateUserRoleResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserSchema,
});

export const UpdateUserStatusResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  user: UserSchema,
});
