import { z } from "zod";

// Common parameter schemas used across multiple routes
export const TenantIdQuerySchema = z.object({
  tenantId: z
    .string()
    .transform(Number)
    .describe("Tenant ID for authorization"),
});

export const TenantIdParamsSchema = z.object({
  tenantId: z.string().transform(Number).describe("Tenant ID"),
});

export const PostIdParamsSchema = z.object({
  postId: z.string().transform(Number).describe("Post ID"),
});

export const CommentIdParamsSchema = z.object({
  id: z.string().transform(Number).describe("Comment ID"),
});

export const UserIdParamsSchema = z.object({
  id: z.string().describe("User ID"),
});

export const BoardIdParamsSchema = z.object({
  id: z.string().transform(Number).describe("Board ID"),
});

export const VoteIdParamsSchema = z.object({
  id: z.string().transform(Number).describe("Vote ID"),
});

export const IntegrationIdParamsSchema = z.object({
  id: z.string().transform(Number).describe("Integration ID"),
});

export const CustomFieldIdParamsSchema = z.object({
  id: z.string().transform(Number).describe("Custom field ID"),
});

// Common pagination query schemas
export const PaginationQuerySchema = z.object({
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
});

export const SearchQuerySchema = z.object({
  search: z.string().optional().describe("Search query"),
});

// Common boolean transform helpers
export const BooleanStringSchema = z
  .string()
  .transform(val => val === "true");

export const OptionalBooleanStringSchema = z
  .string()
  .transform(val => val === "true")
  .optional();
