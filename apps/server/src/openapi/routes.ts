import { createRoute } from "@hono/zod-openapi";
import { z } from "zod";
import {
  ErrorSchema,
  SuccessResponseSchema,
  PaginationSchema,
  FeedbackSchema,
  CreateFeedbackSchema,
} from "./schemas";

// Submit feedback route
export const submitFeedbackRoute = createRoute({
  method: "post",
  path: "/feedback/submit",
  tags: ["Feedback"],
  summary: "Submit new feedback",
  description:
    "Submit a new feedback item (bug report or suggestion) for a specific tenant",
  request: {
    body: {
      content: {
        "application/json": {
          schema: CreateFeedbackSchema,
        },
      },
    },
  },
  responses: {
    201: {
      description: "Feedback submitted successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            feedback: FeedbackSchema,
          }),
        },
      },
    },
    400: {
      description: "Bad request - Invalid tenant ID or validation error",
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

// Get feedback list route
export const getFeedbackRoute = createRoute({
  method: "get",
  path: "/feedback",
  tags: ["Feedback"],
  summary: "Get feedback list",
  description:
    "Retrieve a paginated list of feedback items for a tenant with optional filtering",
  request: {
    query: z.object({
      tenantId: z
        .string()
        .transform(Number)
        .describe("Tenant ID to filter feedback"),
      type: z
        .enum(["bug", "suggestion"])
        .optional()
        .describe("Filter by feedback type"),
      status: z
        .enum(["open", "in_progress", "resolved", "closed"])
        .optional()
        .describe("Filter by status"),
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
      description: "Feedback list retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: z.array(FeedbackSchema),
            pagination: PaginationSchema,
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

// Get specific feedback route
export const getFeedbackByIdRoute = createRoute({
  method: "get",
  path: "/feedback/{id}",
  tags: ["Feedback"],
  summary: "Get feedback by ID",
  description: "Retrieve a specific feedback item by its ID",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Feedback ID"),
    }),
  },
  responses: {
    200: {
      description: "Feedback retrieved successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            data: FeedbackSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid feedback ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Feedback not found",
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

// Update feedback status route
export const updateFeedbackStatusRoute = createRoute({
  method: "post",
  path: "/feedback/{id}/status",
  tags: ["Feedback"],
  summary: "Update feedback status",
  description: "Update the status of a specific feedback item",
  request: {
    params: z.object({
      id: z.string().transform(Number).describe("Feedback ID"),
    }),
    body: {
      content: {
        "application/json": {
          schema: z.object({
            status: z
              .enum(["open", "in_progress", "resolved", "closed"])
              .describe("New status for the feedback"),
          }),
        },
      },
    },
  },
  responses: {
    200: {
      description: "Feedback status updated successfully",
      content: {
        "application/json": {
          schema: z.object({
            success: z.boolean(),
            message: z.string(),
            feedback: FeedbackSchema,
          }),
        },
      },
    },
    400: {
      description: "Invalid feedback ID",
      content: {
        "application/json": {
          schema: ErrorSchema,
        },
      },
    },
    404: {
      description: "Feedback not found",
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
