import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  ErrorSchema,
  SuccessResponseSchema,
  PaginationSchema,
  CustomFieldSchema,
  CreateCustomFieldSchema,
  UpdateCustomFieldSchema,
  CustomFieldValueSchema,
  CreateCustomFieldValueSchema,
  IntegrationSchema,
  CreateIntegrationSchema,
  UpdateIntegrationSchema,
  PostIntegrationSchema,
  CreatePostIntegrationSchema,
  UpdatePostIntegrationSchema,
} from "./schemas";

// Custom Fields routes
export const createCustomFieldRoute = createRoute({
  method: "post",
  path: "/custom-fields",
  tags: ["Custom Fields"],
  summary: "Create custom field",
  description: "Create a new custom field definition for dynamic data collection",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateCustomFieldSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Custom field created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            customField: CustomFieldSchema,
          }),
        },
      },
    },
    400: {
      description: "Bad request - Invalid input data",
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

export const getCustomFieldsRoute = createRoute({
  method: "get",
  path: "/custom-fields",
  tags: ["Custom Fields"],
  summary: "Get custom fields",
  description: "Retrieve custom field definitions with optional filtering",
  request: {
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID to filter custom fields"),
      entityType: z
        .enum(["user", "post", "board", "comment"])
        .optional()
        .describe("Filter by entity type"),
      fieldType: z
        .enum(["text", "number", "boolean", "date", "dropdown"])
        .optional()
        .describe("Filter by field type"),
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
    }),
  },
  responses: {
    200: {
      description: "Custom fields retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(CustomFieldSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid tenant ID",
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

export const getCustomFieldByIdRoute = createRoute({
  method: "get",
  path: "/custom-fields/{id}",
  tags: ["Custom Fields"],
  summary: "Get custom field by ID",
  description: "Retrieve a specific custom field definition by its ID",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Custom field ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Custom field retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: CustomFieldSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid custom field or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Custom field not found",
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

export const updateCustomFieldRoute = createRoute({
  method: "put",
  path: "/custom-fields/{id}",
  tags: ["Custom Fields"],
  summary: "Update custom field",
  description: "Update an existing custom field definition",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Custom field ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateCustomFieldSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Custom field updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            customField: CustomFieldSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid custom field or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Custom field not found",
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

export const deleteCustomFieldRoute = createRoute({
  method: "delete",
  path: "/custom-fields/{id}",
  tags: ["Custom Fields"],
  summary: "Delete custom field",
  description: "Delete a custom field definition and all its values",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Custom field ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Custom field deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Invalid custom field or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Custom field not found",
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

export const setCustomFieldValueRoute = createRoute({
  method: "post",
  path: "/custom-fields/{fieldId}/values",
  tags: ["Custom Fields"],
  summary: "Set custom field value",
  description: "Set a custom field value for a specific entity",
  request: {
    params: z.object({
      fieldId: z.string().transform(Number).describe("Custom field ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: CreateCustomFieldValueSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Custom field value set successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            value: CustomFieldValueSchema,
          }),
        },
      },
    },
    400: {
      description: "Bad request - Invalid input data",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Custom field not found",
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

export const getCustomFieldValuesRoute = createRoute({
  method: "get",
  path: "/custom-fields/{fieldId}/values",
  tags: ["Custom Fields"],
  summary: "Get custom field values",
  description: "Retrieve all values for a specific custom field",
  request: {
    params: z.object({
      fieldId: z.string().transform(Number).describe("Custom field ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
      entityId: z
        .string()
        .optional()
        .describe("Filter by specific entity ID"),
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
    }),
  },
  responses: {
    200: {
      description: "Custom field values retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(CustomFieldValueSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid custom field or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Custom field not found",
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

// Integration routes
export const createIntegrationRoute = createRoute({
  method: "post",
  path: "/integrations",
  tags: ["Integrations"],
  summary: "Create integration",
  description: "Create a new third-party service integration",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateIntegrationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Integration created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            integration: IntegrationSchema,
          }),
        },
      },
    },
    400: {
      description: "Bad request - Invalid input data",
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

export const getIntegrationsRoute = createRoute({
  method: "get",
  path: "/integrations",
  tags: ["Integrations"],
  summary: "Get integrations",
  description: "Retrieve configured integrations for a tenant",
  request: {
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID to filter integrations"),
      type: z
        .enum(["jira", "salesforce", "slack", "zendesk"])
        .optional()
        .describe("Filter by integration type"),
      isActive: z
        .string()
        .transform(val => val === "true")
        .optional()
        .describe("Filter by active status"),
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
    }),
  },
  responses: {
    200: {
      description: "Integrations retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(IntegrationSchema),
            pagination: PaginationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid tenant ID",
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

export const getIntegrationByIdRoute = createRoute({
  method: "get",
  path: "/integrations/{id}",
  tags: ["Integrations"],
  summary: "Get integration by ID",
  description: "Retrieve a specific integration configuration by its ID",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Integration ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Integration retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: IntegrationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid integration or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Integration not found",
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

export const updateIntegrationRoute = createRoute({
  method: "put",
  path: "/integrations/{id}",
  tags: ["Integrations"],
  summary: "Update integration",
  description: "Update an existing integration configuration",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Integration ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
    body: {
      content: {
        "application/json": {
          schema: UpdateIntegrationSchema,
        },
      },
    },
  },
  responses: {
    200: {
      description: "Integration updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            integration: IntegrationSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid integration or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Integration not found",
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

export const deleteIntegrationRoute = createRoute({
  method: "delete",
  path: "/integrations/{id}",
  tags: ["Integrations"],
  summary: "Delete integration",
  description: "Delete an integration configuration",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Integration ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Integration deleted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
          }),
        },
      },
    },
    400: {
      description: "Invalid integration or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Integration not found",
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

export const testIntegrationRoute = createRoute({
  method: "post",
  path: "/integrations/{id}/test",
  tags: ["Integrations"],
  summary: "Test integration",
  description: "Test the connection and configuration of an integration",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Integration ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Integration test completed successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            testResults: z.object({
              connected: z.boolean(),
              responseTime: z.number().optional(),
              error: z.string().optional(),
              details: z.record(z.any()).optional(),
            }),
          }),
        },
      },
    },
    400: {
      description: "Invalid integration or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Integration not found",
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

export const syncIntegrationRoute = createRoute({
  method: "post",
  path: "/integrations/{id}/sync",
  tags: ["Integrations"],
  summary: "Sync integration",
  description: "Trigger a manual sync for an integration",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Integration ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Integration sync initiated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            syncId: z.string().optional(),
          }),
        },
      },
    },
    400: {
      description: "Invalid integration or tenant ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Integration not found",
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

export const createPostIntegrationRoute = createRoute({
  method: "post",
  path: "/integrations/post-mappings",
  tags: ["Integrations"],
  summary: "Create post integration mapping",
  description: "Map a post to an external system entity",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreatePostIntegrationSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Post integration mapping created successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            postIntegration: PostIntegrationSchema,
          }),
        },
      },
    },
    400: {
      description: "Bad request - Invalid input data",
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

export const getPostIntegrationsRoute = createRoute({
  method: "get",
  path: "/integrations/post-mappings/post/{postId}",
  tags: ["Integrations"],
  summary: "Get post integration mappings",
  description: "Retrieve all integration mappings for a specific post",
  request: {
    params: z.object({
      postId: z.string().transform(Number).describe("Post ID"),
    }),
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID for authorization"),
    }),
  },
  responses: {
    200: {
      description: "Post integration mappings retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(PostIntegrationSchema),
          }),
        },
      },
    },
    400: {
      description: "Invalid post or tenant ID",
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
