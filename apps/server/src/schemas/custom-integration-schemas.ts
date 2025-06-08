import { z } from "zod";
import {
  CustomFieldSchema,
  IntegrationSchema,
  PostIntegrationSchema,
  CustomFieldValueSchema,
  PaginationSchema,
} from "./common";
import {
  TenantIdQuerySchema,
  TenantIdParamsSchema,
  CustomFieldIdParamsSchema,
  IntegrationIdParamsSchema,
  PaginationQuerySchema,
  OptionalBooleanStringSchema,
} from "./shared-request-schemas";

// Request schemas
export const GetCustomFieldsQuerySchema = z.object({
  tenantId: z
    .string()
    .transform(Number)
    .describe("Tenant ID to filter custom fields"),
  fieldType: z
    .enum(["text", "number", "boolean", "date", "select", "multiselect"])
    .optional()
    .describe("Filter by field type"),
  isRequired: OptionalBooleanStringSchema.describe("Filter by required status"),
  ...PaginationQuerySchema.shape,
});

// Re-export shared schemas for convenience
export {
  CustomFieldIdParamsSchema,
  TenantIdQuerySchema,
  TenantIdParamsSchema,
} from "./shared-request-schemas";

export const GetIntegrationsQuerySchema = z.object({
  tenantId: z
    .string()
    .transform(Number)
    .describe("Tenant ID to filter integrations"),
  type: z
    .enum(["webhook", "api", "email", "slack", "teams"])
    .optional()
    .describe("Filter by integration type"),
  isActive: OptionalBooleanStringSchema.describe("Filter by active status"),
  ...PaginationQuerySchema.shape,
});

// Re-export shared schema for convenience
export { IntegrationIdParamsSchema } from "./shared-request-schemas";

export const GetCustomFieldValuesQuerySchema = z.object({
  ...TenantIdQuerySchema.shape,
  postId: z.string().transform(Number).optional().describe("Filter by post ID"),
  fieldId: z
    .string()
    .transform(Number)
    .optional()
    .describe("Filter by custom field ID"),
  ...PaginationQuerySchema.shape,
});

export const CustomFieldValueIdParamsSchema = z.object({
  id: z.string().transform(Number).describe("Custom field value ID"),
});

export const GetPostIntegrationsQuerySchema = z.object({
  ...TenantIdQuerySchema.shape,
  postId: z.string().transform(Number).optional().describe("Filter by post ID"),
  integrationId: z
    .string()
    .transform(Number)
    .optional()
    .describe("Filter by integration ID"),
  status: z
    .enum(["pending", "success", "failed", "retrying"])
    .optional()
    .describe("Filter by execution status"),
  ...PaginationQuerySchema.shape,
});

export const PostIntegrationIdParamsSchema = z.object({
  id: z.string().transform(Number).describe("Post integration ID"),
});

export const TestIntegrationSchema = z.object({
  testData: z
    .object({})
    .passthrough()
    .describe("Test data to send through integration"),
});

// Response schemas
export const CreateCustomFieldResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  customField: CustomFieldSchema,
});

export const GetCustomFieldsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CustomFieldSchema),
  pagination: PaginationSchema,
});

export const GetCustomFieldByIdResponseSchema = z.object({
  success: z.boolean(),
  data: CustomFieldSchema,
});

export const UpdateCustomFieldResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  customField: CustomFieldSchema,
});

export const DeleteCustomFieldResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const CreateCustomFieldValueResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  customFieldValue: CustomFieldValueSchema,
});

export const GetCustomFieldValuesResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(CustomFieldValueSchema),
  pagination: PaginationSchema,
});

export const GetCustomFieldValueByIdResponseSchema = z.object({
  success: z.boolean(),
  data: CustomFieldValueSchema,
});

export const UpdateCustomFieldValueResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  customFieldValue: CustomFieldValueSchema,
});

export const DeleteCustomFieldValueResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const CreateIntegrationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  integration: IntegrationSchema,
});

export const GetIntegrationsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(IntegrationSchema),
  pagination: PaginationSchema,
});

export const GetIntegrationByIdResponseSchema = z.object({
  success: z.boolean(),
  data: IntegrationSchema,
});

export const UpdateIntegrationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  integration: IntegrationSchema,
});

export const DeleteIntegrationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const TestIntegrationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  result: z.object({
    status: z.string(),
    response: z.any().optional(),
    error: z.string().optional(),
    executionTime: z.number(),
  }),
});

export const CreatePostIntegrationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  postIntegration: PostIntegrationSchema,
});

export const GetPostIntegrationsResponseSchema = z.object({
  success: z.boolean(),
  data: z.array(PostIntegrationSchema),
  pagination: PaginationSchema,
});

export const GetPostIntegrationByIdResponseSchema = z.object({
  success: z.boolean(),
  data: PostIntegrationSchema,
});

export const UpdatePostIntegrationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  postIntegration: PostIntegrationSchema,
});

export const DeletePostIntegrationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
});

export const RetryPostIntegrationResponseSchema = z.object({
  success: z.boolean(),
  message: z.string(),
  postIntegration: PostIntegrationSchema,
});
