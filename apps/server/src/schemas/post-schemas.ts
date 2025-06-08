import { z } from "zod";
import { PostSchema, PaginationSchema, PostStatsSchema } from "./common";
import {
  TenantIdQuerySchema,
  TenantIdParamsSchema,
  PaginationQuerySchema,
  OptionalBooleanStringSchema,
} from "./shared-request-schemas";

// Request schemas
export const GetPostsQuerySchema = z.object({
  tenantId: z.string().transform(Number).describe("Tenant ID to filter posts"),
  boardId: z
    .string()
    .transform(Number)
    .optional()
    .describe("Filter by board ID"),
  authorId: z.string().optional().describe("Filter by author ID"),
  status: z
    .enum(["draft", "published", "archived", "deleted"])
    .optional()
    .describe("Filter by post status"),
  priority: z
    .string()
    .transform(Number)
    .optional()
    .describe("Filter by priority level"),
  ...PaginationQuerySchema.shape,
  search: z.string().optional().describe("Search query for post title/content"),
});

export const PostIdParamsSchema = z.object({
  id: z.string().transform(Number).describe("Post ID"),
});

export const PostSlugParamsSchema = z.object({
  slug: z.string().describe("Post slug"),
});

// Re-export shared schemas for convenience
export {
  TenantIdQuerySchema,
  TenantIdParamsSchema,
} from "./shared-request-schemas";

export const GetPostsByBoardQuerySchema = z.object({
  ...TenantIdQuerySchema.shape,
  includeDeleted: OptionalBooleanStringSchema.default("false").describe(
    "Include deleted posts",
  ),
  sortBy: z
    .enum(["newest", "oldest", "priority", "votes"])
    .optional()
    .default("newest")
    .describe("Sort order for posts"),
  ...PaginationQuerySchema.shape,
});

export const SearchPostsQuerySchema = z.object({
  q: z.string().min(1).describe("Search query"),
  includeDeleted: OptionalBooleanStringSchema.default("false").describe(
    "Include deleted posts in search",
  ),
  boardId: z
    .string()
    .transform(Number)
    .optional()
    .describe("Limit search to specific board"),
  limit: z
    .string()
    .transform(Number)
    .optional()
    .default("20")
    .describe("Number of results to return"),
});

export const GetPublicPostsQuerySchema = z.object({
  limit: z
    .string()
    .transform(Number)
    .optional()
    .default("20")
    .describe("Number of posts to return"),
  boardId: z
    .string()
    .transform(Number)
    .optional()
    .describe("Filter by board ID"),
});

// Response schemas
export const CreatePostResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  post: PostSchema,
});

export const GetPostsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PostSchema),
  pagination: PaginationSchema,
});

export const GetPostByIdResponseSchema = z.object({
  success: z.boolean(),
  data: PostSchema,
});

export const GetPostBySlugResponseSchema = z.object({
  success: z.boolean(),
  data: PostSchema,
});

export const UpdatePostResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  post: PostSchema,
});

export const DeletePostResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  post: PostSchema,
});

export const RestorePostResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  post: PostSchema,
});

export const GetPostsByBoardResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PostSchema),
  pagination: PaginationSchema,
});

export const GetPostStatsResponseSchema = z.object({
  success: z.boolean(),
  data: PostStatsSchema,
});

export const SearchPostsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PostSchema),
  query: z.string(),
});

export const GetPublicPostsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PostSchema),
});
