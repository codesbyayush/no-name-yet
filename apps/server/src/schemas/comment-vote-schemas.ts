import { z } from "zod";
import {
  CommentSchema,
  VoteSchema,
  PaginationSchema,
  CommentStatsSchema,
  VoteStatsSchema,
  VoteCountsSchema,
} from "./common";
import {
  TenantIdQuerySchema,
  PostIdParamsSchema,
  CommentIdParamsSchema,
  VoteIdParamsSchema,
  PaginationQuerySchema,
  OptionalBooleanStringSchema,
} from "./shared-request-schemas";

// Request schemas
export const GetCommentsQuerySchema = z.object({
  tenantId: z
    .string()
    .transform(Number)
    .describe("Tenant ID to filter comments"),
  postId: z.string().transform(Number).optional().describe("Filter by post ID"),
  parentCommentId: z
    .string()
    .transform(Number)
    .optional()
    .describe("Filter by parent comment ID for nested replies"),
  authorId: z.string().optional().describe("Filter by author ID"),
  isInternal: OptionalBooleanStringSchema.describe(
    "Filter by internal/public status",
  ),
  ...PaginationQuerySchema.shape,
});

// Re-export shared schemas for convenience
export {
  CommentIdParamsSchema,
  PostIdParamsSchema,
  TenantIdQuerySchema,
  VoteIdParamsSchema,
} from "./shared-request-schemas";

export const GetCommentsByPostQuerySchema = z.object({
  ...TenantIdQuerySchema.shape,
  includeInternal: OptionalBooleanStringSchema.default("false").describe(
    "Include internal comments",
  ),
  includeReplies: OptionalBooleanStringSchema.default("true").describe(
    "Include reply comments",
  ),
  sortBy: z
    .enum(["newest", "oldest", "votes"])
    .optional()
    .default("newest")
    .describe("Sort order for comments"),
  ...PaginationQuerySchema.shape,
});

export const GetVotesByPostQuerySchema = z.object({
  ...TenantIdQuerySchema.shape,
  voteType: z
    .enum(["upvote", "downvote"])
    .optional()
    .describe("Filter by vote type"),
  ...PaginationQuerySchema.shape,
});

export const GetVotesByCommentQuerySchema = z.object({
  ...TenantIdQuerySchema.shape,
  voteType: z
    .enum(["upvote", "downvote"])
    .optional()
    .describe("Filter by vote type"),
  ...PaginationQuerySchema.shape,
});

export const GetUserVoteQuerySchema = z.object({
  ...TenantIdQuerySchema.shape,
  userId: z.string().describe("User ID"),
  postId: z
    .string()
    .transform(Number)
    .optional()
    .describe("Post ID to check vote for"),
  commentId: z
    .string()
    .transform(Number)
    .optional()
    .describe("Comment ID to check vote for"),
});

// Response schemas
export const CreateCommentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  comment: CommentSchema,
});

export const GetCommentsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CommentSchema),
  pagination: PaginationSchema,
});

export const GetCommentByIdResponseSchema = z.object({
  success: z.boolean(),
  data: CommentSchema,
});

export const UpdateCommentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  comment: CommentSchema,
});

export const DeleteCommentResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  comment: CommentSchema,
});

export const GetCommentsByPostResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CommentSchema),
  pagination: PaginationSchema,
});

export const GetCommentStatsResponseSchema = z.object({
  success: z.boolean(),
  data: CommentStatsSchema,
});

export const CreateVoteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  vote: VoteSchema,
});

export const UpdateVoteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  vote: VoteSchema,
});

export const DeleteVoteResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const GetVotesByPostResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(VoteSchema),
  pagination: PaginationSchema,
});

export const GetVotesByCommentResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(VoteSchema),
  pagination: PaginationSchema,
});

export const GetVoteCountsResponseSchema = z.object({
  success: z.boolean(),
  data: VoteCountsSchema,
});

export const GetUserVoteResponseSchema = z.object({
  success: z.boolean(),
  data: VoteSchema.nullable(),
});
