import { z } from "zod";
import { BoardSchema, PaginationSchema, BoardStatsSchema } from "./common";
import {
  TenantIdQuerySchema,
  TenantIdParamsSchema,
  PaginationQuerySchema,
  OptionalBooleanStringSchema,
} from "./shared-request-schemas";

// Request schemas
export const GetBoardsQuerySchema = z.object({
  tenantId: z.string().transform(Number).describe("Tenant ID to filter boards"),
  isPrivate: OptionalBooleanStringSchema.describe(
    "Filter by private/public status",
  ),
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
  search: z
    .string()
    .optional()
    .describe("Search query for board name/description"),
});

// BoardIdParamsSchema is imported from shared-request-schemas

export const BoardSlugParamsSchema = z.object({
  slug: z.string().describe("Board slug"),
});

export const GetPublicBoardsQuerySchema = z.object({
  limit: z
    .string()
    .transform(Number)
    .optional()
    .default("20")
    .describe("Number of boards to return"),
});

export const SearchBoardsQuerySchema = z.object({
  q: z.string().min(1).describe("Search query"),
  includePrivate: OptionalBooleanStringSchema.default("false").describe(
    "Include private boards in search",
  ),
  limit: z
    .string()
    .transform(Number)
    .optional()
    .default("20")
    .describe("Number of results to return"),
});

// Response schemas
export const CreateBoardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  board: BoardSchema,
});

export const GetBoardsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BoardSchema),
  pagination: PaginationSchema,
});

export const GetBoardByIdResponseSchema = z.object({
  success: z.boolean(),
  data: BoardSchema,
});

export const GetBoardBySlugResponseSchema = z.object({
  success: z.boolean(),
  data: BoardSchema,
});

export const UpdateBoardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  board: BoardSchema,
});

export const DeleteBoardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  board: BoardSchema,
});

export const RestoreBoardResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  board: BoardSchema,
});

export const GetPublicBoardsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BoardSchema),
});

export const GetBoardStatsResponseSchema = z.object({
  success: z.boolean(),
  data: BoardStatsSchema,
});

export const SearchBoardsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(BoardSchema),
  query: z.string(),
});
